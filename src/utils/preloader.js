// Preload critical components
export const preloadGallery = () => {
  // Preload the gallery component
  return import('../components/ImageGallery.jsx');
};

export const preloadProfiles = () => {
  // Preload the profiles component
  return import('../components/team/Who/Who.jsx');
};

// Preload critical images
export const preloadCriticalImages = () => {
  const criticalImages = [
    '/images/slides/slide1.jpg',
    '/images/slides/slide2.jpg',
    '/images/slides/slide3.jpg',
    '/images/slides/slide4.jpg',
    '/images/slides/slide5.jpg',
    '/images/slides/slide6.jpg',
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

// Intersection Observer for lazy component loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};