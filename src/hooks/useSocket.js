import { useState, useEffect, useCallback, useRef } from 'react';
import socket from '../socket';

/**
 * useSocket — Manages Socket.io connection, real-time GPS, trips, and routes.
 */
export default function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [ghostRoutes, setGhostRoutes] = useState([]);
  const [tripActive, setTripActive] = useState(false);
  const [lastTripResult, setLastTripResult] = useState(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      socket.emit('gps:get-active-users');
      socket.emit('routes:get');
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onUserPosition(userInfo) {
      setActiveUsers((prev) => {
        const next = new Map(prev);
        next.set(userInfo.socketId, userInfo);
        return next;
      });
    }

    function onActiveUsers(users) {
      const map = new Map();
      users.forEach((u) => map.set(u.socketId, u));
      setActiveUsers(map);
    }

    function onUserDisconnected({ socketId }) {
      setActiveUsers((prev) => {
        const next = new Map(prev);
        next.delete(socketId);
        return next;
      });
    }

    // Routes updated from server
    function onRoutesUpdated(routes) {
      setGhostRoutes(routes || []);
    }

    // Trip result from server
    function onTripResult(result) {
      setLastTripResult(result);
      setTripActive(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('gps:user-position', onUserPosition);
    socket.on('gps:active-users', onActiveUsers);
    socket.on('gps:user-disconnected', onUserDisconnected);
    socket.on('routes:updated', onRoutesUpdated);
    socket.on('trip:result', onTripResult);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('gps:user-position', onUserPosition);
      socket.off('gps:active-users', onActiveUsers);
      socket.off('gps:user-disconnected', onUserDisconnected);
      socket.off('routes:updated', onRoutesUpdated);
      socket.off('trip:result', onTripResult);
    };
  }, []);

  const connect = useCallback((user) => {
    if (!connectedRef.current) {
      socket.connect();
      connectedRef.current = true;
    }
    if (user) {
      socket.emit('user:identify', {
        userId: user._id,
        name: user.name,
        role: user.role,
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    socket.disconnect();
    connectedRef.current = false;
    setActiveUsers(new Map());
  }, []);

  const sendPosition = useCallback((position) => {
    if (socket.connected && position) {
      socket.emit('gps:update', {
        lat: position.lat,
        lng: position.lng,
        speed: position.speed,
        heading: position.heading,
        accuracy: position.accuracy,
      });
    }
  }, []);

  // Start a trip — server begins buffering GPS
  const startTrip = useCallback(() => {
    socket.emit('trip:start');
    setTripActive(true);
    setLastTripResult(null);
  }, []);

  // End a trip — server processes GPS through engines
  const endTrip = useCallback(() => {
    socket.emit('trip:end');
    // tripActive will be set false when result comes back
  }, []);

  // Request routes
  const fetchRoutes = useCallback(() => {
    socket.emit('routes:get');
  }, []);

  return {
    isConnected,
    activeUsers,
    ghostRoutes,
    tripActive,
    lastTripResult,
    sendPosition,
    connect,
    disconnect,
    startTrip,
    endTrip,
    fetchRoutes,
  };
}
