import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Custom pulsing user marker ──
const createUserIcon = (color = '#06b6d4') => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="position:relative;width:18px;height:18px;">
        <div style="
          position:absolute;inset:0;
          background:${color};
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 0 12px ${color}88;
          z-index:2;
        "></div>
        <div style="
          position:absolute;inset:-6px;
          background:${color}33;
          border-radius:50%;
          animation:pulse-ring 2s ease-out infinite;
          z-index:1;
        "></div>
      </div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
};

// ── Other user marker (no pulse, smaller) ──
const createOtherUserIcon = (role = 'commuter') => {
  const color = role === 'driver' ? '#f59e0b' : '#8b5cf6';
  const emoji = role === 'driver' ? '🚗' : '👤';
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="position:relative;width:28px;height:28px;">
        <div style="
          position:absolute;inset:0;
          background:${color}20;
          border:2px solid ${color}80;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          font-size:14px;
        ">${emoji}</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

// ── Auto-pan map to follow user position ──
function MapFollower({ position, shouldFollow }) {
  const map = useMap();

  useEffect(() => {
    if (position && shouldFollow) {
      map.setView([position.lat, position.lng], map.getZoom(), {
        animate: true,
        duration: 0.5,
      });
    }
  }, [position, shouldFollow, map]);

  return null;
}

// ── Map invalidation on container resize ──
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

/**
 * Map component — Leaflet + OpenStreetMap
 *
 * Props:
 *   position: { lat, lng, accuracy } — user's live position
 *   trackingHistory: [{ lat, lng }] — trail of positions
 *   isTracking: boolean — whether GPS is active
 *   markerColor: string — color for user marker
 *   activeUsers: Map — other connected users' positions
 *   className: string — custom CSS classes
 *   children: ReactNode — additional map layers
 */
export default function Map({
  position,
  trackingHistory = [],
  isTracking = false,
  markerColor = '#06b6d4',
  activeUsers = new Map(),
  className = '',
  children,
}) {
  const [followUser, setFollowUser] = useState(true);
  const mapRef = useRef(null);

  // Default center: India (Lucknow area for demo)
  const defaultCenter = [26.8467, 80.9462];
  const center = position
    ? [position.lat, position.lng]
    : defaultCenter;

  const userIcon = createUserIcon(markerColor);

  // Trail polyline from tracking history
  const trailPositions = trackingHistory
    .filter((p) => p.lat && p.lng)
    .map((p) => [p.lat, p.lng]);

  // Convert activeUsers Map to array for rendering
  const otherUsers = Array.from(activeUsers.values());

  return (
    <div className={`relative w-full h-full ${className}`}>
      <MapContainer
        center={center}
        zoom={15}
        className="w-full h-full rounded-xl"
        zoomControl={false}
        ref={mapRef}
        style={{ background: '#0d1117' }}
      >
        {/* Dark-themed map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapResizer />
        <MapFollower position={position} shouldFollow={followUser} />

        {/* User position marker */}
        {position && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[position.lat, position.lng]}
              radius={position.accuracy || 20}
              pathOptions={{
                color: markerColor,
                fillColor: markerColor,
                fillOpacity: 0.08,
                weight: 1,
                opacity: 0.3,
              }}
            />

            {/* User marker */}
            <Marker
              position={[position.lat, position.lng]}
              icon={userIcon}
            >
              <Popup className="dark-popup">
                <div style={{ color: '#e5e7eb', fontSize: '12px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>📍 Your Location</p>
                  <p style={{ color: '#9ca3af' }}>
                    {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                  </p>
                  {position.speed !== null && position.speed > 0 && (
                    <p style={{ color: '#9ca3af' }}>
                      Speed: {(position.speed * 3.6).toFixed(1)} km/h
                    </p>
                  )}
                  <p style={{ color: '#6b7280', fontSize: '11px' }}>
                    Accuracy: ±{position.accuracy?.toFixed(0)}m
                  </p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Tracking trail */}
        {trailPositions.length > 1 && (
          <Polyline
            positions={trailPositions}
            pathOptions={{
              color: markerColor,
              weight: 3,
              opacity: 0.6,
              dashArray: '8, 6',
              lineCap: 'round',
            }}
          />
        )}

        {/* ── Other connected users ── */}
        {otherUsers.map((user) => (
          <Marker
            key={user.socketId}
            position={[user.position.lat, user.position.lng]}
            icon={createOtherUserIcon(user.role)}
          >
            <Popup className="dark-popup">
              <div style={{ color: '#e5e7eb', fontSize: '12px' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                  {user.role === 'driver' ? '🚗' : '👤'} {user.name}
                </p>
                <p style={{ color: '#9ca3af', textTransform: 'capitalize' }}>
                  {user.role}
                </p>
                {user.position.speed > 0 && (
                  <p style={{ color: '#9ca3af' }}>
                    Speed: {(user.position.speed * 3.6).toFixed(1)} km/h
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Additional layers from parent */}
        {children}
      </MapContainer>

      {/* Follow user toggle button */}
      {position && (
        <button
          onClick={() => {
            setFollowUser(!followUser);
            if (!followUser && mapRef.current) {
              const map = mapRef.current;
              map.setView([position.lat, position.lng], map.getZoom(), {
                animate: true,
              });
            }
          }}
          className={`
            absolute bottom-4 right-4 z-[1000]
            w-10 h-10 rounded-xl flex items-center justify-center
            transition-all duration-200 cursor-pointer
            ${
              followUser
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }
          `}
          title={followUser ? 'Stop following' : 'Follow my location'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L12 6" />
            <path d="M12 18L12 22" />
            <path d="M2 12L6 12" />
            <path d="M18 12L22 12" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </button>
      )}

      {/* GPS status indicator */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
            backdrop-blur-md
            ${
              isTracking
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border border-white/10 text-gray-500'
            }
          `}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'
            }`}
          />
          {isTracking ? 'GPS Active' : 'GPS Inactive'}
        </div>
      </div>

      {/* Online users count */}
      {otherUsers.length > 0 && (
        <div className="absolute top-4 left-32 z-[1000]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            {otherUsers.length} online
          </div>
        </div>
      )}
    </div>
  );
}
