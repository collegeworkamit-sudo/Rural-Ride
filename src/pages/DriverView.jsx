import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import useSocket from '../hooks/useSocket';
import Map from '../components/Map';
import Button from '../components/common/Button';
import {
  MapPin,
  Navigation,
  LogOut,
  Trophy,
  Compass,
  Gauge,
  Car,
  Radio,
  LocateOff,
  Wifi,
  WifiOff,
  Users,
} from 'lucide-react';

export default function DriverView() {
  const { user, logout } = useAuth();
  const {
    position,
    error: gpsError,
    isTracking,
    startTracking,
    stopTracking,
    trackingHistory,
  } = useGeolocation();
  const { isConnected, activeUsers, sendPosition, connect, disconnect } =
    useSocket();

  // Connect socket on mount
  useEffect(() => {
    if (user) {
      connect(user);
    }
    return () => disconnect();
  }, [user, connect, disconnect]);

  // Send position updates to socket when tracking
  useEffect(() => {
    if (position && isTracking && isConnected) {
      sendPosition(position);
    }
  }, [position, isTracking, isConnected, sendPosition]);

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1c] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shrink-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center">
              <Car className="w-5 h-5 text-gray-950" />
            </div>
            <h1 className="text-lg font-bold hidden sm:block">
              Transit <span className="text-teal-400">Driver</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Broadcast toggle */}
            <Button
              variant={isTracking ? 'primary' : 'secondary'}
              onClick={isTracking ? stopTracking : startTracking}
              className="px-4 py-2 text-xs"
            >
              {isTracking ? (
                <>
                  <LocateOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stop Broadcast</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Go Live</span>
                </>
              )}
            </Button>

            {/* Socket status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs ${
                isConnected
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
            </div>

            {/* Points badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              <Trophy className="w-3 h-3" />
              <span className="font-medium">{user?.points || 0}</span>
            </div>

            {/* User info + logout */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-xs font-medium text-gray-200">
                  {user?.name}
                </p>
                <p className="text-[10px] text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <Button variant="ghost" onClick={logout} className="px-2 py-2">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <Map
            position={position}
            trackingHistory={trackingHistory}
            isTracking={isTracking}
            markerColor="#14b8a6"
            activeUsers={activeUsers}
          />

          {/* GPS Error banner */}
          {gpsError && (
            <div className="absolute top-14 left-4 right-4 z-[1000] bg-red-500/15 border border-red-500/30 text-red-300 text-xs px-4 py-2.5 rounded-xl backdrop-blur-md">
              ⚠️ {gpsError}
            </div>
          )}

          {/* Live indicator when broadcasting */}
          {isTracking && (
            <div className="absolute top-4 right-16 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-medium backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {/* Side panel — Driver stats */}
        <div className="hidden lg:flex w-72 border-l border-white/[0.06] bg-white/[0.01] flex-col p-4 gap-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Driver Status
          </h2>

          <div className="space-y-3">
            <InfoCard
              icon={<Navigation className="w-4 h-4" />}
              label="Current Position"
              value={
                position
                  ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
                  : '—'
              }
              active={!!position}
            />
            <InfoCard
              icon={<Gauge className="w-4 h-4" />}
              label="Speed"
              value={
                position?.speed
                  ? `${(position.speed * 3.6).toFixed(1)} km/h`
                  : '0 km/h'
              }
              active={!!position?.speed}
            />
            <InfoCard
              icon={<Compass className="w-4 h-4" />}
              label="Accuracy"
              value={
                position?.accuracy
                  ? `±${position.accuracy.toFixed(0)}m`
                  : '—'
              }
              active={!!position}
            />
            <InfoCard
              icon={<Users className="w-4 h-4" />}
              label="Users Online"
              value={activeUsers.size.toString()}
              active={activeUsers.size > 0}
            />
          </div>

          {/* Trip summary */}
          <div className="mt-4 p-4 rounded-xl bg-teal-500/5 border border-teal-500/15">
            <h3 className="text-xs font-medium text-teal-400 mb-2">
              Today's Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-lg font-bold text-white">0</p>
                <p className="text-[10px] text-gray-500">Trips</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">0 km</p>
                <p className="text-[10px] text-gray-500">Distance</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                }`}
              />
              {isConnected
                ? 'Connected to live network'
                : 'Disconnected — reconnecting...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, active }) {
  return (
    <div
      className={`
        p-3 rounded-xl border transition-colors
        ${
          active
            ? 'bg-white/[0.03] border-white/[0.08]'
            : 'bg-white/[0.01] border-white/[0.04]'
        }
      `}
    >
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`text-sm font-medium ${
          active ? 'text-gray-200' : 'text-gray-600'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
