import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import Map from '../components/Map';
import Button from '../components/common/Button';
import {
  MapPin,
  Navigation,
  LogOut,
  Trophy,
  Locate,
  LocateOff,
  Compass,
  Gauge,
} from 'lucide-react';

export default function CommuterView() {
  const { user, logout } = useAuth();
  const {
    position,
    error: gpsError,
    isTracking,
    startTracking,
    stopTracking,
    trackingHistory,
  } = useGeolocation();

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1c] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl shrink-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-gray-950" />
            </div>
            <h1 className="text-lg font-bold hidden sm:block">
              Transit <span className="text-cyan-400">Mapper</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* GPS toggle */}
            <Button
              variant={isTracking ? 'primary' : 'secondary'}
              onClick={isTracking ? stopTracking : startTracking}
              className="px-4 py-2 text-xs"
            >
              {isTracking ? (
                <>
                  <LocateOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Stop GPS</span>
                </>
              ) : (
                <>
                  <Locate className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Start GPS</span>
                </>
              )}
            </Button>

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
        {/* Map — takes most of the space */}
        <div className="flex-1 relative">
          <Map
            position={position}
            trackingHistory={trackingHistory}
            isTracking={isTracking}
            markerColor="#06b6d4"
          />

          {/* GPS Error banner */}
          {gpsError && (
            <div className="absolute top-14 left-4 right-4 z-[1000] bg-red-500/15 border border-red-500/30 text-red-300 text-xs px-4 py-2.5 rounded-xl backdrop-blur-md">
              ⚠️ {gpsError}
            </div>
          )}
        </div>

        {/* Side panel — GPS info */}
        <div className="hidden lg:flex w-72 border-l border-white/[0.06] bg-white/[0.01] flex-col p-4 gap-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            GPS Status
          </h2>

          {/* Status cards */}
          <div className="space-y-3">
            <InfoCard
              icon={<Navigation className="w-4 h-4" />}
              label="Coordinates"
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
              icon={<MapPin className="w-4 h-4" />}
              label="Points Logged"
              value={trackingHistory.length.toString()}
              active={trackingHistory.length > 0}
            />
          </div>

          {/* Tracking status */}
          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div
                className={`w-2 h-2 rounded-full ${
                  isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
                }`}
              />
              {isTracking
                ? 'Tracking your location...'
                : 'GPS inactive — tap Start GPS'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Info card sub-component ──
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
