import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useGeolocation — Streams live GPS position from the browser.
 *
 * Returns:
 *   position: { lat, lng, accuracy, speed, heading, timestamp }
 *   error: string | null
 *   isTracking: boolean
 *   startTracking: () => void
 *   stopTracking: () => void
 */
export default function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 10000,
    autoStart = false,
  } = options;

  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const wasTrackingRef = useRef(localStorage.getItem('transit-gps-active') === 'true');
  const watchIdRef = useRef(null);
  const trackingHistoryRef = useRef([]);

  const handleSuccess = useCallback((pos) => {
    const newPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      timestamp: pos.timestamp,
    };

    setPosition(newPosition);
    setError(null);

    // Keep history of last 100 points
    trackingHistoryRef.current = [
      ...trackingHistoryRef.current.slice(-99),
      newPosition,
    ];
  }, []);

  const handleError = useCallback((err) => {
    let message;
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable it in your browser settings.';
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable.';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out.';
        break;
      default:
        message = 'An unknown error occurred while getting location.';
    }
    setError(message);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    // Clear any existing watcher
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsTracking(true);
    localStorage.setItem('transit-gps-active', 'true');
    setError(null);
    trackingHistoryRef.current = [];

    // Get initial position immediately
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      maximumAge,
      timeout,
    });

    // Start watching
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy, maximumAge, timeout }
    );
  }, [enableHighAccuracy, maximumAge, timeout, handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    localStorage.removeItem('transit-gps-active');
  }, []);

  // Auto-start if requested OR if was tracking before refresh
  useEffect(() => {
    if (autoStart || wasTrackingRef.current) {
      startTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    position,
    error,
    isTracking,
    startTracking,
    stopTracking,
    trackingHistory: trackingHistoryRef.current,
  };
}
