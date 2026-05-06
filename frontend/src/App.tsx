import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { fetchClient } from './api/fetchClient';

export default function App() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const [healthStatus, setHealthStatus] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-white">Loading session...</div>;

  const handleTestLogin = async () => {
    try {
      await login({ email: 'eduardo@test.com', password: 'password123' });
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const checkApiHealth = async () => {
    try {
      // This tests the local proxy or Nginx routing
      const response = await fetchClient('/api/health');
      const data = await response.json();
      setHealthStatus(JSON.stringify(data, null, 2));
    } catch (error) {
      setHealthStatus('API Unreachable. Check network tab.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-blue-400">System Dashboard</h1>
        
        {!isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">System locked. Authentication required.</p>
            <button 
              onClick={handleTestLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-colors"
            >
              Initiate Login Sequence
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded text-sm">
              <span className="text-gray-400 block mb-1">Active User Session:</span>
              <pre className="text-green-400">{JSON.stringify(user, null, 2)}</pre>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={checkApiHealth}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded transition-colors text-sm"
              >
                Ping API Health
              </button>
              <button 
                onClick={logout}
                className="flex-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium py-2 rounded transition-colors text-sm"
              >
                Terminate Session
              </button>
            </div>

            {healthStatus && (
              <div className="mt-4 p-4 bg-black rounded text-xs text-yellow-300 overflow-x-auto">
                <pre>{healthStatus}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}