import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import useSocket from '../hooks/useSocket';
import Map from '../components/Map';
import Button from '../components/common/Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
  Route,
  Play,
  Square,
  Gift,
  Gamepad2,
} from 'lucide-react';

export default function DriverView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const geo = useGeolocation();
  const sock = useSocket();

  useEffect(() => {
    if (user) sock.connect(user);
    return () => sock.disconnect();
  }, [user]);

  useEffect(() => {
    if (geo.position && geo.isTracking && sock.isConnected) {
      sock.sendPosition(geo.position);
    }
  }, [geo.position, geo.isTracking, sock.isConnected]);

  useEffect(() => {
    if (sock.lastTripResult) {
      const r = sock.lastTripResult;
      if (r.success) {
        toast.success(
          `Trip logged! ${r.pointsLogged} GPS points. ${r.isNewRoute ? `New route: ${r.route?.name}` : r.route ? `Merged: ${r.route?.name}` : ''
          }${r.rewards?.totalAwarded ? ` | +${r.rewards.totalAwarded} pts 🏆` : ''}`,
          { duration: 5000 }
        );
      } else {
        toast.error(r.message || 'Trip too short');
      }
    }
  }, [sock.lastTripResult]);

  const handleGoLive = () => {
    geo.startTracking();
    sock.startTrip();
  };

  const handleStopLive = () => {
    sock.endTrip();
    geo.stopTracking();
  };

  const [simRunning, setSimRunning] = useState(false);

  const toggleSimulator = async () => {
    try {
      if (simRunning) {
        await api.post('/simulator/stop');
        toast.success('Simulator stopped — routes processed!');
        setSimRunning(false);
      } else {
        await api.post('/simulator/start', { riderCount: 5 });
        toast.success('Simulator started — 5 riders moving!');
        setSimRunning(true);
      }
    } catch (err) {
      toast.error('Simulator error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#111111] text-white">
      <nav className="border-b border-transparent bg-[#181818] backdrop-blur-xl shrink-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center">
              <Car className="w-5 h-5 text-gray-950" />
            </div>
            <h1 className="text-lg font-bold hidden sm:block">
              RuralRides <span className="text-teal-400">Driver</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={geo.isTracking ? 'danger' : 'primary'}
              onClick={geo.isTracking ? handleStopLive : handleGoLive}
              className="px-4 py-2 text-xs"
            >
              {geo.isTracking ? (
                <><Square className="w-3.5 h-3.5" /><span className="hidden sm:inline">End Trip</span></>
              ) : (
                <><Radio className="w-3.5 h-3.5" /><span className="hidden sm:inline">Go Live</span></>
              )}
            </Button>

            <Button
              variant={simRunning ? 'danger' : 'secondary'}
              onClick={toggleSimulator}
              className="px-3 py-2 text-xs"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{simRunning ? 'Stop Sim' : 'Simulate'}</span>
            </Button>

            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs ${sock.isConnected ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
              {sock.isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            </div>

            <div
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs cursor-pointer hover:bg-yellow-500/20 transition-colors"
            >
              <Trophy className="w-3 h-3" /><span className="font-medium">{user?.points || 0}</span>
            </div>

            <div
              onClick={() => navigate('/rewards')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs cursor-pointer hover:bg-purple-500/20 transition-colors"
            >
              <Gift className="w-3 h-3" />
              <span className="hidden sm:inline font-medium">Rewards</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-xs font-medium text-gray-200">{user?.name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button variant="ghost" onClick={logout} className="px-2 py-2"><LogOut className="w-4 h-4" /></Button>
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
            markerColor="#14b8a6"
            activeUsers={sock.activeUsers}
            ghostRoutes={sock.ghostRoutes}
          />

          {geo.error && (
            <div className="absolute top-14 left-4 right-4 z-[1000] bg-red-500/15 border border-red-500/30 text-red-300 text-xs px-4 py-2.5 rounded-xl backdrop-blur-md">
              ⚠️ {geo.error}
            </div>
          )}

          {geo.isTracking && (
            <div className="absolute top-4 right-16 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-medium backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />LIVE
            </div>
          )}
        </div>

        <div className="hidden lg:flex w-72 border-l border-transparent bg-white/[0.01] flex-col p-4 gap-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Driver Status</h2>

          <div className="space-y-3">
            <InfoCard icon={<Navigation className="w-4 h-4" />} label="Position" value={geo.position ? `${geo.position.lat.toFixed(5)}, ${geo.position.lng.toFixed(5)}` : '—'} active={!!geo.position} />
            <InfoCard icon={<Gauge className="w-4 h-4" />} label="Speed" value={geo.position?.speed ? `${(geo.position.speed * 3.6).toFixed(1)} km/h` : '0 km/h'} active={!!geo.position?.speed} />
            <InfoCard icon={<Users className="w-4 h-4" />} label="Users Online" value={sock.activeUsers.size.toString()} active={sock.activeUsers.size > 0} />
            <InfoCard icon={<Route className="w-4 h-4" />} label="Ghost Routes" value={sock.ghostRoutes.length.toString()} active={sock.ghostRoutes.length > 0} />
          </div>

          <div className="mt-4 p-4 rounded-xl bg-teal-500/5 border border-teal-500/15">
            <h3 className="text-xs font-medium text-teal-400 mb-2">Today's Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-lg font-bold text-white">0</p><p className="text-[10px] text-gray-500">Trips</p></div>
              <div><p className="text-lg font-bold text-white">0 km</p><p className="text-[10px] text-gray-500">Distance</p></div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-transparent">
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
    <div className={`p-3 rounded-xl border transition-colors ${active ? 'bg-[#282828] border-transparent' : 'bg-white/[0.01] border-white/[0.04]'}`}>
      <div className="flex items-center gap-2 text-gray-500 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className={`text-sm font-medium ${active ? 'text-gray-200' : 'text-gray-600'}`}>{value}</p>
    </div>
  );
}
