/**
 * Advanced Service Worker for 4site.pro
 * Implements intelligent caching, offline support, and performance optimization
 */

const CACHE_NAME = '4site-pro-v1.0.0';
const DYNAMIC_CACHE_NAME = '4site-pro-dynamic-v1.0.0';
const API_CACHE_NAME = '4site-pro-api-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first', 
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/4sitepro-logo.png',
  '/ae4sitepro-assets/branding/',
  // Add other static assets
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.github\.com\/repos\/.*\/readme$/,
  /^https:\/\/raw\.githubusercontent\.com\/.*\/README\.md$/,
  /^https:\/\/generativelanguage\.googleapis\.com\/.*$/
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /^https:\/\/generativelanguage\.googleapis\.com\//,
  /\/api\//
];

// Cache-first patterns (serve from cache, update in background)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:css|js)$/,
  /^https:\/\/fonts\./,
  /^https:\/\/cdn\./
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting');
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Claiming clients');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

/**
 * Main request handler with intelligent caching
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Determine caching strategy based on URL patterns
    const strategy = getCachingStrategy(url);
    
    switch (strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request);
      
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request);
      
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request);
        
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
        
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await caches.match(request);
        
      default:
        return await networkFirst(request);
    }
  } catch (error) {
    console.error('[ServiceWorker] Request failed:', error);
    return await handleOfflineFallback(request);
  }
}

/**
 * Determine caching strategy based on URL
 */
function getCachingStrategy(url) {
  // API endpoints - network first
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Static assets - cache first
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // GitHub API - stale while revalidate
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Default to network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Cache First Strategy
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    event.waitUntil(updateCache(request));
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  await cacheResponse(request, networkResponse.clone());
  return networkResponse;
}

/**
 * Network First Strategy
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      await cacheResponse(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Always update cache in background
  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cacheResponse(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.log('[ServiceWorker] Background update failed:', error);
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    event.waitUntil(networkPromise);
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return networkPromise;
}

/**
 * Cache response with appropriate cache
 */
async function cacheResponse(request, response) {
  const url = new URL(request.url);
  let cacheName = DYNAMIC_CACHE_NAME;
  
  // Use API cache for API responses
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
    cacheName = API_CACHE_NAME;
  }
  
  // Use static cache for static assets
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
    cacheName = CACHE_NAME;
  }
  
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
}

/**
 * Update cache in background
 */
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(request, response);
    }
  } catch (error) {
    console.log('[ServiceWorker] Background cache update failed:', error);
  }
}

/**
 * Handle offline fallbacks
 */
async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  
  // Try to serve from cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Serve offline page for navigation requests
  if (request.destination === 'document') {
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
  }
  
  // Serve placeholder for images
  if (request.destination === 'image') {
    const placeholder = await caches.match('/offline-image.svg');
    if (placeholder) {
      return placeholder;
    }
  }
  
  // Return generic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'This request requires an internet connection'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Background sync for failed requests
 */
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'failed-requests') {
    event.waitUntil(retryFailedRequests());
  }
});

/**
 * Retry failed requests when connection is restored
 */
async function retryFailedRequests() {
  const failedRequests = await getFailedRequests();
  
  for (const request of failedRequests) {
    try {
      await fetch(request);
      await removeFailedRequest(request);
    } catch (error) {
      console.log('[ServiceWorker] Retry failed:', error);
    }
  }
}

/**
 * Store failed requests for retry
 */
async function storeFailedRequest(request) {
  const db = await openDB();
  const tx = db.transaction(['failed-requests'], 'readwrite');
  const store = tx.objectStore('failed-requests');
  await store.add({
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now()
  });
}

/**
 * Message handling for cache management
 */
self.addEventListener('message', (event) => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      clearCaches(data.cacheNames);
      break;
      
    case 'PREFETCH':
      prefetchResources(data.urls);
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      });
      break;
  }
});

/**
 * Clear specified caches
 */
async function clearCaches(cacheNames = []) {
  if (cacheNames.length === 0) {
    cacheNames = [CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME];
  }
  
  for (const cacheName of cacheNames) {
    await caches.delete(cacheName);
    console.log('[ServiceWorker] Cleared cache:', cacheName);
  }
}

/**
 * Prefetch resources
 */
async function prefetchResources(urls) {
  const cache = await caches.open(CACHE_NAME);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.log('[ServiceWorker] Prefetch failed for:', url, error);
    }
  }
}

/**
 * Get total cache size
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const size = await getResponseSize(response);
        totalSize += size;
      }
    }
  }
  
  return totalSize;
}

/**
 * Get response size estimate
 */
async function getResponseSize(response) {
  const text = await response.clone().text();
  return new Blob([text]).size;
}

/**
 * Performance monitoring
 */
self.addEventListener('fetch', (event) => {
  const start = performance.now();
  
  event.respondWith(
    handleRequest(event.request).then(response => {
      const duration = performance.now() - start;
      
      // Log slow requests
      if (duration > 1000) {
        console.warn('[ServiceWorker] Slow request:', event.request.url, `${duration.toFixed(2)}ms`);
      }
      
      return response;
    })
  );
});

console.log('[ServiceWorker] Service Worker loaded');