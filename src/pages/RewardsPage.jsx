import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Gift,
  Trophy,
  Star,
  Lock,
  CheckCircle,
  ShoppingBag,
  Utensils,
  Train,
  Clapperboard,
} from 'lucide-react';

const CATEGORY_ICONS = {
  transport: Train,
  food: Utensils,
  shopping: ShoppingBag,
  entertainment: Clapperboard,
};

const CATEGORY_COLORS = {
  transport: 'cyan',
  food: 'amber',
  shopping: 'purple',
  entertainment: 'pink',
};

export default function RewardsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [tab, setTab] = useState('coupons'); // 'coupons' | 'badges' | 'claimed'
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, couponsRes] = await Promise.all([
        api.get('/rewards/profile'),
        api.get('/rewards/coupons'),
      ]);
      setProfile(profileRes.data.profile);
      setCoupons(couponsRes.data.coupons || []);

      // Show new badge toast
      if (profileRes.data.newBadges?.length > 0) {
        profileRes.data.newBadges.forEach((b) => {
          toast.success(`Badge unlocked: ${b.emoji} ${b.name}!`, { duration: 4000 });
        });
      }
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (couponId) => {
    setClaiming(couponId);
    try {
      const { data } = await api.post(`/rewards/coupons/${couponId}/claim`);
      if (data.success) {
        toast.success(
          `${data.coupon.emoji} Claimed "${data.coupon.name}"! Code: ${data.coupon.code}`,
          { duration: 6000 }
        );
        fetchData(); // Refresh
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <Loader />;

  const myPoints = profile?.points || 0;

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      {/* Header */}
      <div className="border-b border-transparent bg-[#181818] backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="px-2 py-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Rewards Store</h1>
              <p className="text-xs text-gray-500">Earn points. Unlock rewards.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-lg font-bold text-yellow-400">{myPoints}</span>
            <span className="text-xs text-gray-500">pts</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Next badge progress */}
        {profile?.nextBadge && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{profile.nextBadge.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-gray-200">Next: {profile.nextBadge.name}</p>
                  <p className="text-xs text-gray-500">{profile.nextBadge.remaining} points to go</p>
                </div>
              </div>
              <span className="text-xs text-purple-400">{profile.nextBadge.pointsNeeded} pts</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, ((myPoints / profile.nextBadge.pointsNeeded) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'coupons', label: 'Coupons', icon: '🎟️' },
            { id: 'badges', label: 'Badges', icon: '🏅' },
            { id: 'claimed', label: 'My Claims', icon: '✅' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer
                ${
                  tab === t.id
                    ? 'bg-white/10 border border-white/20 text-white'
                    : 'bg-[#181818] border border-transparent text-gray-500 hover:bg-white/[0.05]'
                }
              `}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Coupons Tab */}
        {tab === 'coupons' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {coupons.length === 0 ? (
              <div className="col-span-2 text-center py-16">
                <Gift className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No coupons available right now</p>
              </div>
            ) : (
              coupons.map((coupon) => {
                const Icon = CATEGORY_ICONS[coupon.category] || Gift;
                const color = CATEGORY_COLORS[coupon.category] || 'gray';
                const canAfford = myPoints >= coupon.pointsCost;
                const alreadyClaimed = profile?.claimedCoupons?.some(
                  (c) => c.couponId === coupon._id
                );

                return (
                  <div
                    key={coupon._id}
                    className={`
                      p-4 rounded-2xl border transition-all
                      ${canAfford && !alreadyClaimed
                        ? `bg-${color}-500/5 border-${color}-500/20 hover:border-${color}-500/40`
                        : 'bg-white/[0.01] border-transparent opacity-60'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-${color}-500/15 flex items-center justify-center text-lg shrink-0`}>
                        {coupon.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{coupon.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{coupon.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-600 capitalize">{coupon.brand}</span>
                          <span className="text-[10px] text-gray-600">{coupon.remaining} left</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-400">{coupon.pointsCost}</span>
                        <span className="text-xs text-gray-600">pts</span>
                      </div>

                      {alreadyClaimed ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Claimed
                        </div>
                      ) : (
                        <Button
                          variant={canAfford ? 'primary' : 'secondary'}
                          disabled={!canAfford || claiming === coupon._id}
                          loading={claiming === coupon._id}
                          onClick={() => handleClaim(coupon._id)}
                          className="px-3 py-1.5 text-xs"
                        >
                          {canAfford ? (
                            <>
                              <Gift className="w-3 h-3" />
                              Claim
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              {coupon.pointsCost - myPoints} more
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Badges Tab */}
        {tab === 'badges' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { id: 'first_trip', name: 'First Steps', emoji: '🐣', pointsNeeded: 10 },
              { id: 'explorer', name: 'Route Explorer', emoji: '🧭', pointsNeeded: 50 },
              { id: 'stop_hunter', name: 'Stop Hunter', emoji: '🚏', pointsNeeded: 75 },
              { id: 'community', name: 'Community Hero', emoji: '🤝', pointsNeeded: 75 },
              { id: 'trailblazer', name: 'Trailblazer', emoji: '🔥', pointsNeeded: 100 },
              { id: 'pathfinder', name: 'Pathfinder', emoji: '🗺️', pointsNeeded: 250 },
              { id: 'navigator', name: 'Navigator', emoji: '⭐', pointsNeeded: 500 },
              { id: 'legend', name: 'Transit Legend', emoji: '👑', pointsNeeded: 1000 },
            ].map((badge) => {
              const unlocked = profile?.badges?.some((b) => b.id === badge.id);
              const progress = Math.min(100, (myPoints / badge.pointsNeeded) * 100);

              return (
                <div
                  key={badge.id}
                  className={`
                    p-4 rounded-2xl border transition-all
                    ${unlocked
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-white/[0.01] border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                      ${unlocked ? 'bg-emerald-500/15' : 'bg-[#282828] grayscale opacity-50'}
                    `}>
                      {badge.emoji}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${unlocked ? 'text-emerald-300' : 'text-gray-400'}`}>
                        {badge.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {unlocked ? '✓ Unlocked' : `${badge.pointsNeeded} pts required`}
                      </p>
                    </div>
                    {unlocked && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  </div>

                  {!unlocked && (
                    <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gray-500 to-gray-400 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Claimed Tab */}
        {tab === 'claimed' && (
          <div className="space-y-3">
            {(!profile?.claimedCoupons || profile.claimedCoupons.length === 0) ? (
              <div className="text-center py-16">
                <Gift className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No coupons claimed yet</p>
                <p className="text-gray-600 text-xs mt-1">Earn points and claim rewards!</p>
              </div>
            ) : (
              profile.claimedCoupons.map((claimed, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-4"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200">{claimed.name}</p>
                    <p className="text-xs text-gray-500">
                      Code: <span className="text-emerald-400 font-mono font-bold">{claimed.code}</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-600 shrink-0">
                    {new Date(claimed.claimedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
