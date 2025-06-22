/**
 * Lazy-loaded component definitions for performance optimization
 * This file centralizes all React.lazy imports to reduce initial bundle size
 */
import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/usePerformance';

// ============================================================================
// LAZY COMPONENT DEFINITIONS
// ============================================================================

// Templates
export const SimplePreviewTemplate = lazy(() => 
  import('../components/templates/SimplePreviewTemplate').then(module => ({
    default: module.SimplePreviewTemplate || module.default
  }))
);

export const CreativeProjectTemplate = lazy(() => 
  import('../components/templates/CreativeProjectTemplate').then(module => ({
    default: module.CreativeProjectTemplate || module.default
  }))
);

export const TechProjectTemplate = lazy(() => 
  import('../components/templates/TechProjectTemplate').then(module => ({
    default: module.TechProjectTemplate || module.default
  }))
);

// Authentication
export const LoginModal = lazy(() => 
  import('../components/auth/LoginModal').then(module => ({
    default: module.LoginModal || module.default
  }))
);

export const ConversionPrompt = lazy(() => 
  import('../components/conversion/ConversionPrompt').then(module => ({
    default: module.ConversionPrompt || module.default
  }))
);

// Error Handling
export const ErrorBoundary = lazy(() => 
  import('../components/error/ErrorBoundary').then(module => ({
    default: module.ErrorBoundary || module.default
  }))
);

// Feedback
export const FloatingFeedbackButton = lazy(() => 
  import('../components/feedback/FloatingFeedbackButton').then(module => ({
    default: module.FloatingFeedbackButton || module.default
  }))
);

// Loading Components
export const AIGenerationLoader = lazy(() => 
  import('../components/loading/AIGenerationLoader').then(module => ({
    default: module.AIGenerationLoader || module.default
  }))
);

// ============================================================================
// LAZY WRAPPER COMPONENT
// ============================================================================

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
  className?: string;
  enableIntersection?: boolean;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback, 
  minHeight = "200px",
  className = "",
  enableIntersection = false
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  const defaultFallback = (
    <div 
      className={`flex items-center justify-center ${className}`} 
      style={{ minHeight }}
    >
      <motion.div 
        className="flex items-center gap-3 text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading component...</span>
      </motion.div>
    </div>
  );

  if (enableIntersection) {
    return (
      <div ref={ref} className={className}>
        {isIntersecting ? (
          <Suspense fallback={fallback || defaultFallback}>
            {children}
          </Suspense>
        ) : (
          <div style={{ minHeight }} className="flex items-center justify-center">
            <div className="text-white/40 text-sm">Scroll to load...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// ============================================================================
// PRELOADING UTILITIES
// ============================================================================

interface PreloadComponents {
  preloadTemplates: () => void;
  preloadAuth: () => void;
  preloadFeedback: () => void;
  preloadErrorHandling: () => void;
  preloadAll: () => void;
}

export const preloadComponents: PreloadComponents = {
  preloadTemplates: () => {
    // Preload all template components
    import('../components/templates/SimplePreviewTemplate');
    import('../components/templates/CreativeProjectTemplate');
    import('../components/templates/TechProjectTemplate');
  },

  preloadAuth: () => {
    // Preload authentication components
    import('../components/auth/LoginModal');
    import('../components/conversion/ConversionPrompt');
  },

  preloadFeedback: () => {
    // Preload feedback components
    import('../components/feedback/FloatingFeedbackButton');
  },

  preloadErrorHandling: () => {
    // Preload error handling components
    import('../components/error/ErrorBoundary');
  },

  preloadAll: () => {
    // Preload all components for critical paths
    preloadComponents.preloadTemplates();
    preloadComponents.preloadAuth();
    preloadComponents.preloadFeedback();
    preloadComponents.preloadErrorHandling();
    import('../components/loading/AIGenerationLoader');
  }
};

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

interface LazyLoadMetrics {
  componentName: string;
  loadTime: number;
  fromCache: boolean;
  renderTime: number;
}

class LazyLoadTracker {
  private metrics: LazyLoadMetrics[] = [];

  trackLoad(componentName: string, loadTime: number, fromCache: boolean = false) {
    const renderStart = performance.now();
    
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart;
      
      this.metrics.push({
        componentName,
        loadTime,
        fromCache,
        renderTime
      });

      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-50); // Keep last 50 metrics
      }

      // Log slow loading components
      if (loadTime > 1000) {
        console.warn(`[LazyLoad] Slow component load: ${componentName} took ${loadTime.toFixed(2)}ms`);
      }

      // Performance insights
      if (process.env.NODE_ENV === 'development') {
        console.log(`[LazyLoad] ${componentName}: ${loadTime.toFixed(2)}ms load, ${renderTime.toFixed(2)}ms render`);
      }
    });
  }

  getMetrics(): LazyLoadMetrics[] {
    return [...this.metrics];
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const cacheHits = this.metrics.filter(metric => metric.fromCache).length;
    return (cacheHits / this.metrics.length) * 100;
  }

  clear() {
    this.metrics = [];
  }
}

export const lazyLoadTracker = new LazyLoadTracker();

// ============================================================================
// ENHANCED LAZY WRAPPER WITH TRACKING
// ============================================================================

interface TrackedLazyWrapperProps extends LazyWrapperProps {
  componentName: string;
  trackPerformance?: boolean;
}

export const TrackedLazyWrapper: React.FC<TrackedLazyWrapperProps> = ({
  componentName,
  trackPerformance = true,
  ...props
}) => {
  const loadStart = performance.now();

  React.useEffect(() => {
    if (trackPerformance) {
      const loadTime = performance.now() - loadStart;
      lazyLoadTracker.trackLoad(componentName, loadTime);
    }
  }, [componentName, trackPerformance, loadStart]);

  return <LazyWrapper {...props} />;
};

// ============================================================================
// IMAGE LAZY LOADING
// ============================================================================

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23333'/%3E%3C/svg%3E",
  onLoad,
  onError
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });
  
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {isIntersecting ? (
        <motion.img
          src={hasError ? placeholder : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      ) : (
        <img src={placeholder} alt="Loading..." className="opacity-50" />
      )}
      
      {!isLoaded && isIntersecting && (
        <div className="absolute inset-0 bg-gray-800/20 animate-pulse" />
      )}
    </div>
  );
};

// ============================================================================
// PRELOAD CRITICAL RESOURCES
// ============================================================================

export const preloadCriticalResources = () => {
  // Preload critical images
  const criticalImages = [
    '/4sitepro-logo.png',
    '/ae4sitepro-assets/branding/'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Preload critical components after initial render
  setTimeout(() => {
    preloadComponents.preloadTemplates();
  }, 100);

  // Preload auth components for anonymous users
  setTimeout(() => {
    preloadComponents.preloadAuth();
  }, 1000);
};

// ============================================================================
// BUNDLE ANALYZER UTILITIES
// ============================================================================

export const getBundleInfo = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      totalLoadTime: navigation.loadEventEnd - navigation.navigationStart,
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      serverResponse: navigation.responseEnd - navigation.requestStart,
      documentProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
      resourceLoading: navigation.loadEventEnd - navigation.domContentLoadedEventEnd
    };
  }
  
  return null;
};

// Initialize critical resource preloading
if (typeof window !== 'undefined') {
  window.addEventListener('load', preloadCriticalResources);
}

export default LazyWrapper;