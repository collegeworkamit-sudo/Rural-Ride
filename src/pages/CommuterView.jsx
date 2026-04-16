import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import useSocket from '../hooks/useSocket';
import Map from '../components/Map';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import {
  MapPin,
  Navigation,
  LogOut,
  Trophy,
  Locate,
  LocateOff,
  Compass,
  Gauge,
  Wifi,
  WifiOff,
  Users,
  Route,
  Play,
  Square,
} from 'lucide-react';

export default function CommuterView() {
  const { user, logout } = useAuth();
  const geo = useGeolocation();
  const sock = useSocket();

  // Connect socket on mount
  useEffect(() => {
    if (user) sock.connect(user);
    return () => sock.disconnect();
  }, [user]);

  // Send position updates
  useEffect(() => {
    if (geo.position && geo.isTracking && sock.isConnected) {
      sock.sendPosition(geo.position);
    }
  }, [geo.position, geo.isTracking, sock.isConnected]);

  // Show trip result toast
  useEffect(() => {
    if (sock.lastTripResult) {
      const r = sock.lastTripResult;
      if (r.success) {
        toast.success(
          `Trip logged! ${r.pointsLogged} GPS points. ${
            r.isNewRoute
              ? `New route created: ${r.route?.name}`
              : r.route
              ? `Merged into ${r.route?.name} (${r.route?.userCount} users)`
              : 'Processing...'
          } ${r.stopsDetected > 0 ? `| ${r.stopsDetected} stops detected` : ''}`,
          { duration: 5000 }
        );
      } else {
        toast.error(r.message || 'Trip too short');
      }
    }
  }, [sock.lastTripResult]);

  const handleStartGPS = () => {
    geo.startTracking();
    sock.startTrip();
  };

  const handleStopGPS = () => {
    sock.endTrip();
    geo.stopTracking();
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1c] text-white">
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
            {/* Trip toggle — starts GPS + trip together */}
            <Button
              variant={geo.isTracking ? 'danger' : 'primary'}
              onClick={geo.isTracking ? handleStopGPS : handleStartGPS}
              className="px-4 py-2 text-xs"
            >
              {geo.isTracking ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">End Trip</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Start Trip</span>
                </>
              )}
            </Button>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs ${
                sock.isConnected
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {sock.isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              <Trophy className="w-3 h-3" />
              <span className="font-medium">{user?.points || 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-xs font-medium text-gray-200">{user?.name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button variant="ghost" onClick={logout} className="px-2 py-2">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <Map
            position={geo.position}
            trackingHistory={geo.trackingHistory}
            isTracking={geo.isTracking}
            markerColor="#06b6d4"
            activeUsers={sock.activeUsers}
            ghostRoutes={sock.ghostRoutes}
          />

          {geo.error && (
            <div className="absolute top-14 left-4 right-4 z-[1000] bg-red-500/15 border border-red-500/30 text-red-300 text-xs px-4 py-2.5 rounded-xl backdrop-blur-md">
              ⚠️ {geo.error}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="hidden lg:flex w-72 border-l border-white/[0.06] bg-white/[0.01] flex-col p-4 gap-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Live Status</h2>

          <div className="space-y-3">
            <InfoCard icon={<Navigation className="w-4 h-4" />} label="Coordinates" value={geo.position ? `${geo.position.lat.toFixed(5)}, ${geo.position.lng.toFixed(5)}` : '—'} active={!!geo.position} />
            <InfoCard icon={<Gauge className="w-4 h-4" />} label="Speed" value={geo.position?.speed ? `${(geo.position.speed * 3.6).toFixed(1)} km/h` : '0 km/h'} active={!!geo.position?.speed} />
            <InfoCard icon={<Users className="w-4 h-4" />} label="Users Online" value={sock.activeUsers.size.toString()} active={sock.activeUsers.size > 0} />
            <InfoCard icon={<Route className="w-4 h-4" />} label="Ghost Routes" value={sock.ghostRoutes.length.toString()} active={sock.ghostRoutes.length > 0} />
          </div>

          {/* Ghost routes list */}
          {sock.ghostRoutes.length > 0 && (
            <div className="mt-2">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Discovered Routes</h3>
              <div className="space-y-2">
                {sock.ghostRoutes.map((route) => (
                  <div key={route._id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-xs font-medium text-gray-200">👻 {route.name}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-gray-500">{route.userCount} users</span>
                      <span className="text-[10px] text-gray-500">{route.confidence}% conf</span>
                      <span className="text-[10px] text-gray-500">{route.stops?.length || 0} stops</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${sock.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
              {sock.isConnected ? 'Connected to live network' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, active }) {
  return (
    <div className={`p-3 rounded-xl border transition-colors ${active ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white/[0.01] border-white/[0.04]'}`}>
      <div className="flex items-center gap-2 text-gray-500 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className={`text-sm font-medium ${active ? 'text-gray-200' : 'text-gray-600'}`}>{value}</p>
    </div>
  );
}
