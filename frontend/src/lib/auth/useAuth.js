import { useSyncExternalStore } from 'react';
import {
  canEdit,
  ensureAuthBootstrapped,
  getAuthUser,
  isAuthenticated,
  subscribeAuth,
} from './authStore';

const SERVER_SNAPSHOT = {
  user: null,
  authenticated: false,
  canEdit: false,
};

export function useAuth() {
  const state = useSyncExternalStore(
    subscribeAuth,
    () => ({
      user: getAuthUser(),
      authenticated: isAuthenticated(),
      canEdit: canEdit(),
    }),
    () => SERVER_SNAPSHOT,
  );

  return {
    ...state,
    bootstrap: ensureAuthBootstrapped,
  };
}
