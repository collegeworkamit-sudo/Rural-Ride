import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  MapPin,
  Bus,
  Navigation,
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-[#111111] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-[#111111]" />

        {/* Animated floating elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-md px-12 text-left">
          {/* Logo */}
          <div className="mb-4">
            <MapPin className="w-10 h-10 text-[#7DE5D0]" strokeWidth={2.5} />
          </div>

          <h1 className="text-5xl font-black text-[#7DE5D0] mb-6 tracking-tight uppercase">
            Rural Rides
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Turn commuters into live sensors. Map and predict unorganized transit in real time.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-start">
            {[
              { icon: Bus, label: 'Ghost Routes' },
              { icon: Navigation, label: 'Live ETA' },
              { icon: MapPin, label: 'Smart Stops' },
            ].map(({ icon: FIcon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#222222] border border-transparent text-gray-300 text-sm"
              >
                <FIcon className="w-3.5 h-3.5 text-[#7DE5D0]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo (hidden on desktop) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#7DE5D0] text-gray-900 flex items-center justify-center shadow-none">
              <MapPin className="w-7 h-7 text-gray-950" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Rural <span className="text-[#7DE5D0]">Rides</span>
            </h1>
          </div>

          {/* Form card */}
          <div className="bg-[#181818] border-l-4 border-l-[#7DE5D0] rounded-r-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-gray-500 text-sm">
                Sign in to continue tracking transit
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="login-email"
                label="EMAIL ADDRESS"
                type="email"
                name="email"
                placeholder="you@example.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />

              <Input
                id="login-password"
                label="PASSWORD"
                type="password"
                name="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2"
              >
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#7DE5D0] hover:text-[#7DE5D0] font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
