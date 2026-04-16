import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-gradient-to-r from-cyan-500 to-teal-400 text-gray-950 font-semibold hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:scale-[1.02]',
  secondary:
    'bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20',
  ghost:
    'bg-transparent text-cyan-400 hover:text-cyan-300 hover:bg-white/5 underline-offset-4',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-500 text-white font-semibold hover:shadow-[0_0_24px_rgba(239,68,68,0.4)] hover:scale-[1.02]',
};

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        relative flex items-center justify-center gap-2
        px-6 py-3 rounded-xl
        text-sm tracking-wide
        transition-all duration-200 ease-out
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
        cursor-pointer
        ${variants[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
