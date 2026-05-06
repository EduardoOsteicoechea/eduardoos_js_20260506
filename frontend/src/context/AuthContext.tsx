import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchClient, setAccessToken } from '../api/fetchClient';

// 1. Explicit Type Definitions
export interface UserState {
  id: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: UserState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Context Initialization
const AuthContext = createContext<AuthContextType | null>(null);

// 3. The Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Silent Authentication on Mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        // This request triggers the fetchClient. 
        // If the short-lived token is missing or expired, the client automatically 
        // handles the refresh sequence via the HTTP-Only cookie before resolving.
        const response = await fetchClient('/api/auth/me');
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // Login Action
  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await fetchClient('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Authentication failed');
    }

    const data = await response.json();
    
    // Explicitly update the in-memory token and React state
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  // Logout Action
  const logout = async (): Promise<void> => {
    try {
      // Tell the backend to invalidate the HTTP-Only refresh cookie
      await fetchClient('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error during logout sequence:', error);
    } finally {
      // Purge state regardless of network success to ensure local security
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook for easy consumption in components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider component hierarchy');
  }
  return context;
};