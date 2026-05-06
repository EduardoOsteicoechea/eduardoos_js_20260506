// Define the structure for queued requests waiting for a token refresh
interface QueuedRequest {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}

let currentAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Updates the in-memory token. This is used by AuthContext after login
 * and internally by this client after a successful rotation.
 */
export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

/**
 * Process the queue of pending requests once a refresh attempt completes.
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Custom fetch wrapper that handles:
 * 1. Automatic Authorization header attachment.
 * 2. 401 Unauthorized interception.
 * 3. Token rotation via HTTP-Only cookies.
 * 4. Request queuing during refresh.
 */
export const fetchClient = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers);

  // Attach the short-lived access token if we have one in memory
  if (currentAccessToken) {
    headers.set('Authorization', `Bearer ${currentAccessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    // CRITICAL: Tells the browser to send the HTTP-Only refresh cookie
    credentials: 'include', 
  };

  let response = await fetch(url, config);

  // Handle Token Expiration (401)
  if (response.status === 401) {
    
    // If we are already refreshing, add this request to the queue
    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          headers.set('Authorization', `Bearer ${token}`);
          return fetch(url, { ...config, headers });
        })
        .catch((err) => Promise.reject(err));
    }

    // Start the refresh process
    isRefreshing = true;

    try {
      // Hit the backend refresh endpoint
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshResponse.ok) throw new Error('Session expired');

      const data = await refreshResponse.json();
      const newAccessToken = data.accessToken;
      
      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      // Replay the original failed request with the new token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      return await fetch(url, { ...config, headers });

    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      setAccessToken(null);
      // Redirect to login or handle session termination
      window.dispatchEvent(new CustomEvent('auth-failure'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};