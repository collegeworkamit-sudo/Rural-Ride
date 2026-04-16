import { useState, useEffect, useCallback, useRef } from 'react';
import socket from '../socket';

/**
 * useSocket — Manages Socket.io connection and real-time GPS events.
 *
 * Returns:
 *   isConnected: boolean
 *   activeUsers: Map of other users' live positions
 *   sendPosition: (position) => void — broadcast your position
 *   connect: (user) => void — connect and identify
 *   disconnect: () => void
 */
export default function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const connectedRef = useRef(false);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('📡 Socket connected');
      // Request current active users
      socket.emit('gps:get-active-users');
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // Receive another user's position update
    function onUserPosition(userInfo) {
      setActiveUsers((prev) => {
        const next = new Map(prev);
        next.set(userInfo.socketId, userInfo);
        return next;
      });
    }

    // Receive full list of active users
    function onActiveUsers(users) {
      const map = new Map();
      users.forEach((u) => map.set(u.socketId, u));
      setActiveUsers(map);
    }

    // A user disconnected
    function onUserDisconnected({ socketId }) {
      setActiveUsers((prev) => {
        const next = new Map(prev);
        next.delete(socketId);
        return next;
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('gps:user-position', onUserPosition);
    socket.on('gps:active-users', onActiveUsers);
    socket.on('gps:user-disconnected', onUserDisconnected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('gps:user-position', onUserPosition);
      socket.off('gps:active-users', onActiveUsers);
      socket.off('gps:user-disconnected', onUserDisconnected);
    };
  }, []);

  // Connect and identify user
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

  // Disconnect
  const disconnect = useCallback(() => {
    socket.disconnect();
    connectedRef.current = false;
    setActiveUsers(new Map());
  }, []);

  // Send GPS position
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

  return {
    isConnected,
    activeUsers,
    sendPosition,
    connect,
    disconnect,
  };
}
