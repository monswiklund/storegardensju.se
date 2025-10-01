# Part 2: Phase 2 - Custom Lightbox Plan

## 🎯 Objective
Replace react-image-gallery (57KB) with a custom lightweight lightbox solution (~15KB) while maintaining all current functionality and improving performance.

## 📐 Architecture Design

### Component Structure
```
src/components/Gallery/Lightbox/
├── LightboxProvider.jsx          # Context + global state management
├── LightboxContainer.jsx         # Portal wrapper + overlay
├── LightboxImage.jsx             # Image display + loading states
├── LightboxNavigation.jsx        # Previous/Next arrows
├── LightboxThumbnails.jsx        # Thumbnail strip at bottom
├── LightboxCounter.jsx           # "3 of 20" display
├── LightboxControls.jsx          # Close, fullscreen, etc.
└── styles/
    ├── lightbox-core.css         # Base lightbox styles
    ├── lightbox-animations.css   # Transitions + effects
    └── lightbox-responsive.css   # Mobile optimizations
```

### Hook Architecture
```
src/components/Gallery/hooks/
├── useLightbox.js               # Main lightbox state logic
├── useKeyboardNavigation.js     # Keyboard shortcuts (←→, ESC, F)
├── useSwipeGestures.js          # Touch/mouse swipe detection
├── useImagePreloader.js         # Smart adjacent image preloading
├── useFullscreenAPI.js          # Browser fullscreen handling
└── useLightboxHistory.js        # URL integration (optional)
```

## 🔄 Feature Migration Matrix

| react-image-gallery Feature | Custom Implementation | Component | Effort | Priority |
|----------------------------|---------------------|-----------|--------|----------|
| **Modal Overlay** | Custom portal + backdrop | `LightboxContainer` | 2h | High |
| **Image Display** | Responsive image with loading | `LightboxImage` | 3h | High |
| **Navigation Arrows** | Custom arrow buttons + logic | `LightboxNavigation` | 2h | High |
| **Keyboard Controls** | Arrow keys, ESC, F, space | `useKeyboardNavigation` | 2h | High |
| **Touch/Swipe** | Custom gesture detection | `useSwipeGestures` | 4h | High |
| **Thumbnail Strip** | Scrollable thumbnail bar | `LightboxThumbnails` | 4h | Medium |
| **Image Counter** | Simple "X of Y" display | `LightboxCounter` | 1h | Low |
| **Fullscreen API** | Browser fullscreen toggle | `useFullscreenAPI` | 2h | Medium |
| **Infinite Loop** | Circular array navigation | `useLightbox` logic | 1h | Low |
| **Loading States** | Custom skeletons + spinners | `LightboxImage` | 2h | Medium |

**Total Estimated Effort**: 23 hours (~3 days)

## 🏗️ Implementation Strategy

### Phase 2.1: Core Foundation (Day 1)

#### Step 1: Context Provider Setup
```jsx
// LightboxProvider.jsx - Central state management
export const LightboxProvider = ({ children, images, categories }) => {
  const [state, setState] = useState({
    isOpen: false,
    currentIndex: 0,
    currentCategory: 'alla',
    isLoading: false,
    hasError: false,
    isFullscreen: false
  });
  
  // Core lightbox methods
  const openLightbox = useCallback((index, category = 'alla') => {
    setState(prev => ({
      ...prev,
      isOpen: true,
      currentIndex: index,
      currentCategory: category
    }));
    document.body.classList.add('lightbox-open');
  }, []);
  
  const closeLightbox = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
    document.body.classList.remove('lightbox-open');
  }, []);
  
  return (
    <LightboxContext.Provider value={{
      ...state,
      openLightbox,
      closeLightbox,
      navigate: (direction) => {/* navigation logic */}
    }}>
      {children}
    </LightboxContext.Provider>
  );
};
```

#### Step 2: Portal Container
```jsx
// LightboxContainer.jsx - Modal wrapper
export const LightboxContainer = ({ children }) => {
  const { isOpen, closeLightbox } = useLightbox();
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div 
      className="lightbox-overlay"
      onClick={(e) => e.target === e.currentTarget && closeLightbox()}
    >
      <div className="lightbox-modal">
        {children}
      </div>
    </div>,
    document.getElementById('lightbox-root') || document.body
  );
};
```

### Phase 2.2: Image Display + Navigation (Day 2)

#### Step 3: Image Component with Loading
```jsx
// LightboxImage.jsx - Smart image display
export const LightboxImage = ({ image, isActive }) => {
  const [loadState, setLoadState] = useState('loading'); // loading|loaded|error
  const [imageSrc, setImageSrc] = useState(image.thumbnail);
  
  // Progressive enhancement: load full-size after thumbnail
  useEffect(() => {
    if (isActive && loadState === 'loaded' && imageSrc === image.thumbnail) {
      const fullImg = new Image();
      fullImg.onload = () => setImageSrc(image.original);
      fullImg.src = image.original;
    }
  }, [isActive, loadState, imageSrc, image]);
  
  return (
    <div className={`lightbox-slide ${isActive ? 'active' : ''}`}>
      {loadState === 'loading' && <ImageSkeleton />}
      <img
        src={imageSrc}
        alt={image.originalAlt}
        onLoad={() => setLoadState('loaded')}
        onError={() => setLoadState('error')}
        className="lightbox-image"
      />
      {loadState === 'error' && <ImageErrorFallback />}
    </div>
  );
};
```

#### Step 4: Navigation Controls
```jsx
// LightboxNavigation.jsx - Arrow navigation
export const LightboxNavigation = () => {
  const { navigate, currentIndex, images } = useLightbox();
  
  return (
    <>
      <button
        className="lightbox-nav lightbox-nav--prev"
        onClick={() => navigate(-1)}
        aria-label="Föregående bild"
        disabled={currentIndex === 0} // Remove for infinite loop
      >
        <ChevronLeft size={32} />
      </button>
      
      <button
        className="lightbox-nav lightbox-nav--next"
        onClick={() => navigate(1)}
        aria-label="Nästa bild"
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight size={32} />
      </button>
    </>
  );
};
```

### Phase 2.3: Advanced Features (Day 3)

#### Step 5: Keyboard Navigation Hook
```jsx
// useKeyboardNavigation.js - Comprehensive keyboard support
export const useKeyboardNavigation = () => {
  const { isOpen, navigate, closeLightbox, toggleFullscreen } = useLightbox();
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e) => {
      // Prevent default browser behavior
      if (['ArrowLeft', 'ArrowRight', 'Escape', ' ', 'f', 'F'].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'h': // Vim-style
          navigate(-1);
          break;
        case 'ArrowRight':
        case 'l': // Vim-style
          navigate(1);
          break;
        case 'Escape':
          closeLightbox();
          break;
        case ' ': // Spacebar
          navigate(1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Home':
          navigate(0, { absolute: true });
          break;
        case 'End':
          navigate(-1, { absolute: true, fromEnd: true });
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, navigate, closeLightbox, toggleFullscreen]);
};
```

#### Step 6: Touch Gesture Support
```jsx
// useSwipeGestures.js - Mobile-friendly gestures
export const useSwipeGestures = (elementRef) => {
  const { navigate } = useLightbox();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) navigate(1);
    if (isRightSwipe) navigate(-1);
  };
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchend', onTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [elementRef]);
};
```

## 🎨 Styling Strategy

### Core CSS Structure
```css
/* lightbox-core.css - Base styles */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-modal {
  position: relative;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
}

.lightbox-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

/* Prevent body scroll when lightbox is open */
body.lightbox-open {
  overflow: hidden;
}
```

### Animation System
```css
/* lightbox-animations.css - Smooth transitions */
.lightbox-overlay {
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lightbox-overlay.open {
  opacity: 1;
  transform: scale(1);
}

.lightbox-slide {
  opacity: 0;
  transform: translateX(100px);
  transition: all 0.4s ease-out;
}

.lightbox-slide.active {
  opacity: 1;
  transform: translateX(0);
}

.lightbox-slide.prev {
  transform: translateX(-100px);
}
```

## 📱 Mobile Optimization

### Responsive Design Considerations
1. **Touch Targets**: Minimum 44px for iOS accessibility
2. **Viewport Units**: Use `vh`/`vw` for full-screen experience
3. **Safe Areas**: Handle iPhone notch with `env(safe-area-*)`
4. **Performance**: Hardware-accelerated transforms only

### Mobile-Specific Features
```jsx
// Mobile-optimized thumbnail strip
const LightboxThumbnails = () => {
  const { images, currentIndex, navigate } = useLightbox();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    // Show simplified dot indicators instead of full thumbnails
    return <DotIndicators />;
  }
  
  return (
    <div className="lightbox-thumbnails">
      {images.map((image, index) => (
        <ThumbnailItem key={index} {...} />
      ))}
    </div>
  );
};
```

## 🔧 Integration Plan

### Step-by-Step Migration
1. **Parallel Development**: Build custom lightbox alongside existing
2. **Feature Flag**: Environment variable to toggle implementations
3. **A/B Testing**: Compare user engagement metrics
4. **Gradual Rollout**: 10% → 50% → 100% of users

### Backwards Compatibility
```jsx
// Feature flag wrapper
const GalleryLightbox = ({ images, ...props }) => {
  const useCustomLightbox = process.env.VITE_USE_CUSTOM_LIGHTBOX === 'true';
  
  if (useCustomLightbox) {
    return <CustomLightbox images={images} {...props} />;
  }
  
  return <ReactImageGallery items={images} {...props} />;
};
```

## 🧪 Testing Strategy

### Unit Tests
- Component rendering with different states
- Keyboard navigation behavior
- Touch gesture recognition
- Error boundary functionality

### Integration Tests  
- Category switching with lightbox open
- Image preloading behavior
- Mobile vs desktop feature differences
- Accessibility compliance

### Performance Tests
- Bundle size comparison
- Time to interactive measurements
- Memory usage profiling
- Mobile performance benchmarks

## ✅ Success Criteria

### Technical Metrics
- **Bundle Size**: 57KB → 15KB (74% reduction)
- **First Paint**: <200ms improvement
- **Interaction Response**: <16ms (60fps)
- **Memory Usage**: <50% of current implementation

### User Experience Metrics
- **Accessibility Score**: 100% (Lighthouse)
- **Mobile Usability**: Pass all Core Web Vitals
- **Error Rate**: <1% image load failures
- **User Satisfaction**: Maintain current engagement levels

---

**Previous**: [← Part 1: Current State Analysis](./part-1-current-state.md)  
**Next**: [Part 3: Phase 3 - Intersection Observer Plan →](./part-3-intersection-observer.md)