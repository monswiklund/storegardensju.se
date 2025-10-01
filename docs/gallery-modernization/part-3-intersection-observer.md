# Part 3: Phase 3 - Intersection Observer Loading

## 🎯 Objective
Implement intelligent image loading using Intersection Observer API to dramatically improve performance, reduce bandwidth usage, and create a smoother user experience.

## 📊 Loading Strategy Overview

### Current vs. Proposed Loading Behavior

| Scenario | Current Behavior | Proposed Behavior | Improvement |
|----------|------------------|-------------------|-------------|
| **Page Load** | Load all 6 visible thumbnails immediately | Load only above-fold images | 66% fewer requests |
| **Scroll Down** | Load all remaining 14 images when expanded | Load only when 200px from viewport | 80% reduction in unused loads |
| **Category Switch** | Filter existing images (already loaded) | Load category images on demand | Eliminates pre-loading unused categories |
| **Lightbox Open** | Full-size image loads on demand | Preload adjacent images intelligently | 50% faster navigation |

### Smart Loading Hierarchy
```
Priority 1: Visible Grid Images          ← Load immediately (eager)
Priority 2: Below-fold Grid Images       ← Intersection Observer (200px margin)
Priority 3: Current Category Full-size   ← Preload for lightbox
Priority 4: Adjacent Images in Lightbox  ← Load prev/next when lightbox opens
Priority 5: Other Category Previews      ← Load on category hover (low priority)
```

## 🏗️ Architecture Design

### Hook Structure
```
src/components/Gallery/hooks/
├── useIntersectionObserver.js      # Core intersection observer logic
├── useImagePreloader.js            # Smart preloading strategies
├── useCategoryPreloader.js         # Category-specific loading
├── useImageLoadQueue.js            # Request queuing and priority
└── useImageCache.js               # Client-side image caching
```

### Component Integration
```
src/components/Gallery/
├── IntersectionImage.jsx           # Smart image component
├── LazyImageGrid.jsx              # Grid with intersection observers
├── ImageSkeleton.jsx              # Loading placeholder
├── ImageErrorFallback.jsx         # Error state component
└── LoadingIndicator.jsx           # Category switch loading
```

## 🔍 Implementation Strategy

### Phase 3.1: Core Intersection Observer (Day 1)

#### Step 1: Base Intersection Hook
```jsx
// useIntersectionObserver.js - Foundation hook
export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '200px 0px',
  triggerOnce = true,
  disabled = false
}) => {
  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);
  
  const observer = useMemo(() => {
    if (disabled || typeof IntersectionObserver === 'undefined') {
      return null;
    }
    
    return new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        
        // Disconnect after first intersection if triggerOnce
        if (triggerOnce && entry.isIntersecting && observer) {
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
  }, [threshold, rootMargin, triggerOnce, disabled]);
  
  useEffect(() => {
    if (node && observer) {
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [node, observer]);
  
  return [setNode, entry];
};
```

#### Step 2: Smart Image Component
```jsx
// IntersectionImage.jsx - Lazy loading image component
export const IntersectionImage = ({
  src,
  thumbnail,
  alt,
  priority = 'normal', // 'high' | 'normal' | 'low'
  aspectRatio = '4/3',
  preloadFullSize = false,
  onLoad,
  onError,
  ...props
}) => {
  // State management
  const [loadState, setLoadState] = useState('pending'); // pending|loading|loaded|error
  const [currentSrc, setCurrentSrc] = useState(null);
  
  // Intersection observer setup
  const [imageRef, entry] = useIntersectionObserver({
    rootMargin: priority === 'high' ? '0px' : '200px 0px',
    triggerOnce: true,
    disabled: priority === 'high' // High priority images load immediately
  });
  
  // Load image when it becomes visible or is high priority
  useEffect(() => {
    const shouldLoad = priority === 'high' || (entry?.isIntersecting);
    
    if (shouldLoad && loadState === 'pending') {
      setLoadState('loading');
      setCurrentSrc(thumbnail || src);
    }
  }, [entry, priority, loadState, thumbnail, src]);
  
  // Progressive enhancement: upgrade to full-size image
  useEffect(() => {
    if (preloadFullSize && loadState === 'loaded' && currentSrc === thumbnail && src !== thumbnail) {
      const fullImg = new Image();
      fullImg.onload = () => setCurrentSrc(src);
      fullImg.onerror = () => console.warn(`Failed to load full-size image: ${src}`);
      fullImg.src = src;
    }
  }, [preloadFullSize, loadState, currentSrc, thumbnail, src]);
  
  const handleLoad = useCallback(() => {
    setLoadState('loaded');
    onLoad?.();
  }, [onLoad]);
  
  const handleError = useCallback(() => {
    setLoadState('error');
    onError?.();
  }, [onError]);
  
  return (
    <div 
      ref={imageRef}
      className={`intersection-image ${loadState}`}
      style={{ aspectRatio }}
      {...props}
    >
      {/* Loading skeleton */}
      {loadState === 'pending' || loadState === 'loading' ? (
        <ImageSkeleton aspectRatio={aspectRatio} />
      ) : null}
      
      {/* Actual image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            opacity: loadState === 'loaded' ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
      
      {/* Error fallback */}
      {loadState === 'error' && (
        <ImageErrorFallback onRetry={() => setLoadState('pending')} />
      )}
    </div>
  );
};
```

### Phase 3.2: Category-Based Preloading (Day 2)

#### Step 3: Category Preloader Hook
```jsx
// useCategoryPreloader.js - Smart category loading
export const useCategoryPreloader = (categories, activeCategory) => {
  const [preloadedCategories, setPreloadedCategories] = useState(new Set(['alla']));
  const [isPreloading, setIsPreloading] = useState(false);
  
  // Preload a specific category's images
  const preloadCategory = useCallback(async (categoryId, options = {}) => {
    const {
      maxImages = 6,
      priority = 'normal',
      signal
    } = options;
    
    if (preloadedCategories.has(categoryId) || signal?.aborted) {
      return;
    }
    
    setIsPreloading(true);
    
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      // Get first N images for preloading
      const imagesToPreload = category.images.slice(0, maxImages);
      
      // Create preload promises
      const preloadPromises = imagesToPreload.map((imageNumber, index) => {
        return new Promise((resolve, reject) => {
          if (signal?.aborted) {
            reject(new Error('Preload aborted'));
            return;
          }
          
          const img = new Image();
          const imagePath = `/images/slides/slide${imageNumber}.jpg`;
          
          img.onload = () => resolve({ imageNumber, success: true });
          img.onerror = () => resolve({ imageNumber, success: false }); // Don't reject, just log
          
          // Start loading
          img.src = imagePath;
          
          // Timeout for slow connections
          setTimeout(() => {
            if (img.complete) return;
            resolve({ imageNumber, success: false, reason: 'timeout' });
          }, 5000);
        });
      });
      
      // Wait for all images to load (or timeout)
      const results = await Promise.all(preloadPromises);
      
      // Log results for debugging
      const successCount = results.filter(r => r.success).length;
      console.log(`Preloaded ${successCount}/${imagesToPreload.length} images for category: ${categoryId}`);
      
      // Mark category as preloaded
      if (!signal?.aborted) {
        setPreloadedCategories(prev => new Set([...prev, categoryId]));
      }
      
    } catch (error) {
      console.warn(`Failed to preload category ${categoryId}:`, error);
    } finally {
      setIsPreloading(false);
    }
  }, [categories, preloadedCategories]);
  
  // Auto-preload active category
  useEffect(() => {
    if (activeCategory && !preloadedCategories.has(activeCategory)) {
      const controller = new AbortController();
      preloadCategory(activeCategory, { signal: controller.signal });
      
      return () => controller.abort();
    }
  }, [activeCategory, preloadCategory, preloadedCategories]);
  
  // Preload category on hover (with debouncing)
  const preloadOnHover = useMemo(() => 
    debounce((categoryId) => {
      if (!preloadedCategories.has(categoryId)) {
        preloadCategory(categoryId, { maxImages: 3, priority: 'low' });
      }
    }, 300)
  , [preloadCategory, preloadedCategories]);
  
  return {
    preloadCategory,
    preloadOnHover,
    preloadedCategories,
    isPreloading
  };
};
```

#### Step 4: Image Load Queue Management
```jsx
// useImageLoadQueue.js - Request prioritization and queuing
export const useImageLoadQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(new Set());
  const maxConcurrent = 6; // Limit concurrent requests
  
  const addToQueue = useCallback((requests) => {
    const newRequests = Array.isArray(requests) ? requests : [requests];
    
    setQueue(prev => {
      // Avoid duplicates and sort by priority
      const existingUrls = new Set(prev.map(r => r.url));
      const uniqueRequests = newRequests.filter(r => !existingUrls.has(r.url));
      
      return [...prev, ...uniqueRequests].sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    });
  }, []);
  
  const processQueue = useCallback(async () => {
    if (queue.length === 0 || loading.size >= maxConcurrent) {
      return;
    }
    
    const availableSlots = maxConcurrent - loading.size;
    const toProcess = queue.slice(0, availableSlots);
    
    setQueue(prev => prev.slice(availableSlots));
    
    toProcess.forEach(async (request) => {
      setLoading(prev => new Set([...prev, request.url]));
      
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = request.url;
        });
        
        request.onSuccess?.(img);
      } catch (error) {
        request.onError?.(error);
      } finally {
        setLoading(prev => {
          const next = new Set(prev);
          next.delete(request.url);
          return next;
        });
      }
    });
  }, [queue, loading, maxConcurrent]);
  
  // Process queue when it changes
  useEffect(() => {
    processQueue();
  }, [processQueue]);
  
  return { addToQueue, queueSize: queue.length, loadingCount: loading.size };
};
```

### Phase 3.3: Advanced Optimizations (Day 3)

#### Step 5: Lightbox Adjacent Preloading
```jsx
// useLightboxPreloader.js - Smart lightbox preloading
export const useLightboxPreloader = (images, currentIndex, isOpen) => {
  const { addToQueue } = useImageLoadQueue();
  
  useEffect(() => {
    if (!isOpen || !images.length) return;
    
    // Preload adjacent images when lightbox opens or index changes
    const preloadAdjacent = () => {
      const toPreload = [];
      
      // Previous image
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      if (images[prevIndex]) {
        toPreload.push({
          url: images[prevIndex].original,
          priority: 'high',
          type: 'lightbox-adjacent'
        });
      }
      
      // Next image
      const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      if (images[nextIndex]) {
        toPreload.push({
          url: images[nextIndex].original,
          priority: 'high',
          type: 'lightbox-adjacent'
        });
      }
      
      // Next few images (lower priority)
      for (let i = 1; i <= 3; i++) {
        const futureIndex = (currentIndex + i + 1) % images.length;
        if (images[futureIndex]) {
          toPreload.push({
            url: images[futureIndex].original,
            priority: 'normal',
            type: 'lightbox-prefetch'
          });
        }
      }
      
      addToQueue(toPreload);
    };
    
    // Small delay to prioritize current image loading
    const timeoutId = setTimeout(preloadAdjacent, 100);
    return () => clearTimeout(timeoutId);
  }, [images, currentIndex, isOpen, addToQueue]);
};
```

#### Step 6: Skeleton Loading Components
```jsx
// ImageSkeleton.jsx - Animated loading placeholders
export const ImageSkeleton = ({ 
  aspectRatio = '4/3',
  showShimmer = true,
  className = ''
}) => {
  return (
    <div 
      className={`image-skeleton ${className}`}
      style={{ aspectRatio }}
      role="img"
      aria-label="Bild laddas..."
    >
      {showShimmer && (
        <div className="skeleton-shimmer" />
      )}
      <div className="skeleton-content">
        <div className="skeleton-icon">📷</div>
      </div>
    </div>
  );
};

// CSS for skeleton animation
const skeletonStyles = `
.image-skeleton {
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shimmer 1.8s infinite;
}

.skeleton-content {
  opacity: 0.3;
  font-size: 2rem;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
`;
```

## 📱 Performance Optimizations

### Memory Management
```jsx
// useImageCache.js - Client-side caching with cleanup
export const useImageCache = () => {
  const cache = useRef(new Map());
  const maxCacheSize = 50; // Limit cache size
  
  const addToCache = useCallback((url, imageElement) => {
    // Remove oldest entries if cache is full
    if (cache.current.size >= maxCacheSize) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
    
    cache.current.set(url, {
      element: imageElement,
      timestamp: Date.now()
    });
  }, []);
  
  const getFromCache = useCallback((url) => {
    return cache.current.get(url)?.element;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => cache.current.clear();
  }, []);
  
  return { addToCache, getFromCache, cacheSize: cache.current.size };
};
```

### Network-Aware Loading
```jsx
// useNetworkAware.js - Adapt to connection quality
export const useNetworkAware = () => {
  const [connectionInfo, setConnectionInfo] = useState({
    effectiveType: '4g',
    saveData: false,
    downlink: 10
  });
  
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateConnection = () => {
        setConnectionInfo({
          effectiveType: connection.effectiveType,
          saveData: connection.saveData,
          downlink: connection.downlink
        });
      };
      
      updateConnection();
      connection.addEventListener('change', updateConnection);
      
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);
  
  // Adjust loading behavior based on connection
  const getLoadingStrategy = useMemo(() => {
    if (connectionInfo.saveData || connectionInfo.effectiveType === 'slow-2g') {
      return {
        maxConcurrent: 2,
        preloadAdjacent: false,
        useWebP: false // Fallback to JPEG for compatibility
      };
    }
    
    if (connectionInfo.effectiveType === '2g' || connectionInfo.effectiveType === '3g') {
      return {
        maxConcurrent: 3,
        preloadAdjacent: true,
        useWebP: true
      };
    }
    
    // 4g and above
    return {
      maxConcurrent: 6,
      preloadAdjacent: true,
      useWebP: true,
      aggressivePreload: true
    };
  }, [connectionInfo]);
  
  return { connectionInfo, getLoadingStrategy };
};
```

## 🔧 Integration with Existing Gallery

### Updated Gallery Grid Component
```jsx
// LazyImageGrid.jsx - Grid with intersection observers
export const LazyImageGrid = ({ images, onImageClick, expandedView = false }) => {
  const { preloadOnHover } = useCategoryPreloader();
  
  return (
    <div className={`gallery-grid ${expandedView ? 'expanded' : ''}`}>
      {images.map((image, index) => (
        <IntersectionImage
          key={image.imageNumber}
          src={image.original}
          thumbnail={image.thumbnail}
          alt={image.originalAlt}
          priority={index < 6 ? 'high' : 'normal'} // First 6 are high priority
          aspectRatio={image.aspectRatio || '4/3'}
          preloadFullSize={false} // Only preload in lightbox
          className={`gallery-thumbnail gallery-thumbnail--${image.sizeClass}`}
          onClick={() => onImageClick(index)}
          onMouseEnter={() => {
            // Preload full-size on hover for desktop
            if (!isMobile) {
              const img = new Image();
              img.src = image.original;
            }
          }}
        />
      ))}
    </div>
  );
};
```

### Category Toggle Integration
```jsx
// Enhanced CategoryToggle with preloading
export const CategoryToggle = ({ categories, activeCategory, onCategoryChange }) => {
  const { preloadOnHover, isPreloading } = useCategoryPreloader();
  
  return (
    <div className="category-toggle">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.id)}
          onMouseEnter={() => preloadOnHover(category.id)}
          disabled={isPreloading && activeCategory !== category.id}
        >
          {category.name}
          <span className="category-count">({category.images.length})</span>
          {isPreloading && activeCategory === category.id && (
            <div className="loading-spinner" />
          )}
        </button>
      ))}
    </div>
  );
};
```

## ✅ Performance Metrics & Success Criteria

### Loading Performance Targets
- **Initial Page Load**: 50% fewer image requests
- **Below-fold Loading**: Only load when 200px from viewport
- **Category Switch Time**: <300ms perceived loading
- **Lightbox Navigation**: <100ms to show adjacent image

### Memory Usage Targets
- **Cache Size**: Limit to 50 images max
- **DOM Images**: Remove off-screen images after 30s
- **Memory Leak Prevention**: Proper cleanup on unmount

### Network Usage Targets
- **Bandwidth Reduction**: 60% on initial load
- **Adaptive Loading**: Respect user's data preferences
- **Failed Request Handling**: Graceful degradation

---

**Previous**: [← Part 2: Phase 2 - Custom Lightbox Plan](./part-2-custom-lightbox.md)  
**Next**: [Part 4: Implementation Timeline & Execution →](./part-4-timeline-execution.md)