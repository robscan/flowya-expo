/**
 * useNetworkStatus Hook
 * Detects online/offline status
 * Uses native APIs without external dependencies
 */

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web: Use navigator.onLine API
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // Native: Default to online (can be enhanced later with NetInfo if needed)
      // For now, we assume online since we don't have expo-network installed
      setIsOnline(true);
      
      // Note: To add native network detection, install @react-native-community/netinfo
      // and uncomment the following:
      /*
      import NetInfo from '@react-native-community/netinfo';
      
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(state.isConnected ?? true);
      });
      
      return () => unsubscribe();
      */
    }
  }, []);

  return isOnline;
}

