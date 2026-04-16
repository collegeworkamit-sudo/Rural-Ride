import { MapPin } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-[#0a0f1c] flex flex-col items-center justify-center z-50">
      {/* Pulsing map pin */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)]">
          <MapPin className="w-8 h-8 text-gray-950" />
        </div>
      </div>

      {/* Loading text */}
      <p className="mt-6 text-gray-400 text-sm tracking-widest uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
}
