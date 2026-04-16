import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-300 pl-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        )}
        <input
          id={id}
          type={inputType}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/[0.03] border
            text-gray-100 text-sm
            placeholder:text-gray-600
            transition-all duration-200
            outline-none
            ${Icon ? 'pl-11' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${
              error
                ? 'border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
                : 'border-white/[0.08] focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 hover:border-white/15'
            }
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 pl-1 animate-[slideDown_0.2s_ease-out]">
          {error}
        </p>
      )}
    </div>
  );
}
