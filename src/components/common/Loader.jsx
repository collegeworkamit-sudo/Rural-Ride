import { MapPin } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-[#111111] flex flex-col items-center justify-center z-50">
      {/* Pulsing map pin */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-[#7DE5D0] text-gray-900 flex items-center justify-center shadow-none">
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
