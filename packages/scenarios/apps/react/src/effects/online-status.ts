import { useEffect, useState, useSyncExternalStore } from 'react';

function subscribeToNetwork(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

function getOnlineStatus(): boolean {
  return navigator.onLine;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribeToNetwork, getOnlineStatus, () => true);
}

export function useEffectOnlineStatus(): boolean {
  const [online, setOnline] = useState(getOnlineStatus);
  // expect: error sonsu-lee(require-effect-reason) -- The hook starts a network subscription without a reason.
  useEffect(() => subscribeToNetwork(() => setOnline(getOnlineStatus())), []);
  return online;
}
