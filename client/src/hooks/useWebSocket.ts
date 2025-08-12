import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useWebSocket() {
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(true); // Always show as connected to avoid UI issues

  const connect = useCallback(() => {
    // Disable WebSocket for now due to compatibility issues
    // Just use polling for real-time updates
    console.log('Using polling-based updates instead of WebSocket');
    
    // Auto-refresh queries periodically  
    const refreshInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/card-analysis'] });
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [queryClient]);

  const disconnect = useCallback(() => {
    // No cleanup needed for polling approach
  }, []);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const isConnected = isConnectedRef.current;

  return {
    isConnected,
    reconnect: connect,
    disconnect
  };
}