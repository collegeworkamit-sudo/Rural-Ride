import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  ArrowLeft,
  Users,
  MapPin,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RANK_STYLES = {
  1: { bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/40', icon: Crown, color: 'text-yellow-400' },
  2: { bg: 'from-gray-300/15 to-gray-400/5', border: 'border-gray-400/30', icon: Medal, color: 'text-gray-300' },
  3: { bg: 'from-amber-700/15 to-orange-600/5', border: 'border-amber-600/30', icon: Medal, color: 'text-amber-500' },
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/rewards/leaderboard?limit=20');
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const myRank = leaderboard.findIndex((u) => u._id === user?._id) + 1;

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="px-2 py-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Leaderboard</h1>
              <p className="text-xs text-gray-500">Top RuralRides</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Your stats card */}
        {user && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-teal-500/5 border border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {myRank > 0 ? `#${myRank}` : '—'}
                </div>
                <div>
                  <p className="font-semibold text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">{user.points || 0}</p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          </div>
        )}

        {/* Point values info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <PointCard icon={<MapPin className="w-3.5 h-3.5" />} label="Trip" value="+10" />
          <PointCard icon={<Star className="w-3.5 h-3.5" />} label="New Route" value="+50" />
          <PointCard icon={<Users className="w-3.5 h-3.5" />} label="Confirm" value="+25" />
          <PointCard icon={<Zap className="w-3.5 h-3.5" />} label="Stop" value="+15" />
        </div>

        {/* Leaderboard list */}
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No rankings yet</p>
              <p className="text-gray-600 text-xs mt-1">Start a trip to earn points!</p>
            </div>
          ) : (
            leaderboard.map((entry) => {
              const isMe = entry._id === user?._id;
              const style = RANK_STYLES[entry.rank];
              const RankIcon = style?.icon || null;

              return (
                <div
                  key={entry._id}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border transition-all
                    ${isMe
                      ? 'bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20'
                      : style
                        ? `bg-gradient-to-r ${style.bg} ${style.border}`
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {/* Rank */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                      ${style
                        ? `${style.color}`
                        : 'text-gray-500'
                      }
                    `}
                  >
                    {RankIcon ? (
                      <RankIcon className="w-5 h-5" />
                    ) : (
                      `#${entry.rank}`
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isMe ? 'text-cyan-300' : 'text-gray-200'}`}>
                      {entry.name} {isMe && <span className="text-xs text-cyan-500">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{entry.role}</p>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <p className={`font-bold ${style ? style.color : 'text-gray-300'}`}>
                      {entry.points}
                    </p>
                    <p className="text-[10px] text-gray-600">pts</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function PointCard({ icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
      <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-sm font-bold text-emerald-400">{value}</p>
    </div>
  );
}
