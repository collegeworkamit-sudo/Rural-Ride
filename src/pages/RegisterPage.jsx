import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  User,
  MapPin,
  Bus,
  Car,
} from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'commuter',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/');
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
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
        <div className="absolute inset-0 bg-[#111111]" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-[#7DE5D0] text-gray-900 flex items-center justify-center shadow-none">
            <MapPin className="w-10 h-10 text-gray-950" />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Join the{' '}
            <span className="text-[#7DE5D0]">
              Movement
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Help map the invisible transit network. Every ride you take makes
            the system smarter for everyone.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '0→∞', label: 'Routes found' },
              { value: 'Real-time', label: 'GPS tracking' },
              { value: 'Earn', label: 'Reward points' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="py-3 px-2 rounded-xl bg-[#282828] border border-transparent"
              >
                <p className="text-[#7DE5D0] font-bold text-lg">{value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — register form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#7DE5D0] text-gray-900 flex items-center justify-center shadow-none">
              <MapPin className="w-7 h-7 text-gray-950" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Rural <span className="text-[#7DE5D0]">Rides</span>
            </h1>
          </div>

          {/* Form card */}
          <div className="bg-[#181818] border border-transparent backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Create account
              </h2>
              <p className="text-gray-500 text-sm">
                Start mapping your city's transit
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="register-name"
                label="Full Name"
                type="text"
                name="name"
                placeholder="John Doe"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
              />

              <Input
                id="register-email"
                label="Email"
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
                id="register-password"
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />

              <Input
                id="register-confirm-password"
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              {/* Role selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300 pl-1">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: 'commuter',
                      label: 'Commuter',
                      icon: Bus,
                      desc: 'I ride transit',
                    },
                    {
                      value: 'driver',
                      label: 'Driver',
                      icon: Car,
                      desc: 'I operate a vehicle',
                    },
                  ].map(({ value, label, icon: RIcon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: value }))
                      }
                      className={`
                        flex flex-col items-center gap-1.5 p-4 rounded-xl border
                        transition-all duration-200 cursor-pointer
                        ${formData.role === value
                          ? 'bg-cyan-500/10 border-[#7DE5D0]/40 text-[#7DE5D0] shadow-none'
                          : 'bg-[#181818] border-transparent text-gray-400 hover:border-white/15 hover:bg-[#222222]'
                        }
                      `}
                    >
                      <RIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#7DE5D0] hover:text-[#7DE5D0] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
