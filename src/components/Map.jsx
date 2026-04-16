import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  CircleMarker,
  useMap,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Route colors for different ghost routes
const ROUTE_COLORS = [
  '#06b6d4', '#f59e0b', '#8b5cf6', '#ef4444',
  '#10b981', '#ec4899', '#f97316', '#6366f1',
];

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

// ── Other user marker ──
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

// ── Stop marker icon ──
const createStopIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="
        width:20px;height:20px;
        background:#f59e0b22;
        border:2px solid #f59e0b;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        font-size:10px;
      ">🚏</div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
};

// ── Auto-pan map ──
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

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

/**
 * Map component
 *
 * Props:
 *   position, trackingHistory, isTracking, markerColor — user GPS
 *   activeUsers — other connected users
 *   ghostRoutes — detected ghost routes from server
 */
export default function Map({
  position,
  trackingHistory = [],
  isTracking = false,
  markerColor = '#06b6d4',
  activeUsers = new Map(),
  ghostRoutes = [],
  className = '',
  children,
}) {
  const [followUser, setFollowUser] = useState(true);
  const mapRef = useRef(null);

  const defaultCenter = [28.5747, 77.2195]; // Delhi
  const center = position ? [position.lat, position.lng] : defaultCenter;
  const userIcon = createUserIcon(markerColor);
  const stopIcon = createStopIcon();

  const trailPositions = trackingHistory
    .filter((p) => p.lat && p.lng)
    .map((p) => [p.lat, p.lng]);

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapResizer />
        <MapFollower position={position} shouldFollow={followUser} />

        {/* ── Ghost Routes (polylines) ── */}
        {ghostRoutes.map((route, idx) => {
          const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
          const routeCoords = route.coordinates.map((c) => [c[0], c[1]]);

          return (
            <div key={route._id}>
              {/* Route polyline */}
              <Polyline
                positions={routeCoords}
                pathOptions={{
                  color,
                  weight: 4,
                  opacity: Math.min(0.9, 0.3 + route.confidence / 100),
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              >
                <Popup className="dark-popup">
                  <div style={{ color: '#e5e7eb', fontSize: '12px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px', color }}>
                      👻 {route.name}
                    </p>
                    <p style={{ color: '#9ca3af' }}>
                      Users: {route.userCount} | Confidence: {route.confidence}%
                    </p>
                    <p style={{ color: '#9ca3af' }}>
                      Stops: {route.stops?.length || 0}
                    </p>
                  </div>
                </Popup>
              </Polyline>

              {/* Start marker */}
              {routeCoords.length > 0 && (
                <CircleMarker
                  center={routeCoords[0]}
                  radius={6}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                >
                  <Popup className="dark-popup">
                    <div style={{ color: '#e5e7eb', fontSize: '12px' }}>
                      <p style={{ fontWeight: 600 }}>🟢 Start</p>
                      <p style={{ color: '#9ca3af' }}>{route.name}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )}

              {/* End marker */}
              {routeCoords.length > 1 && (
                <CircleMarker
                  center={routeCoords[routeCoords.length - 1]}
                  radius={6}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                >
                  <Popup className="dark-popup">
                    <div style={{ color: '#e5e7eb', fontSize: '12px' }}>
                      <p style={{ fontWeight: 600 }}>🔴 End</p>
                      <p style={{ color: '#9ca3af' }}>{route.name}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              )}

              {/* Stop markers */}
              {route.stops?.map((stop, sIdx) => {
                const coords = stop.location?.coordinates;
                if (!coords) return null;
                return (
                  <Marker
                    key={`stop-${route._id}-${sIdx}`}
                    position={[coords[1], coords[0]]}
                    icon={stopIcon}
                  >
                    <Popup className="dark-popup">
                      <div style={{ color: '#e5e7eb', fontSize: '12px' }}>
                        <p style={{ fontWeight: 600, marginBottom: '4px' }}>
                          🚏 {stop.name}
                        </p>
                        <p style={{ color: '#9ca3af' }}>
                          Avg dwell: {stop.avgDwellTime || 0}s
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </div>
          );
        })}

        {/* ── User position ── */}
        {position && (
          <>
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
            <Marker position={[position.lat, position.lng]} icon={userIcon}>
              <Popup className="dark-popup">
                <div style={{ color: '#e5e7eb', fontSize: '12px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>📍 You</p>
                  <p style={{ color: '#9ca3af' }}>
                    {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                  </p>
                  {position.speed > 0 && (
                    <p style={{ color: '#9ca3af' }}>
                      {(position.speed * 3.6).toFixed(1)} km/h
                    </p>
                  )}
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

        {/* Other users */}
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
              </div>
            </Popup>
          </Marker>
        ))}

        {children}
      </MapContainer>

      {/* Follow button */}
      {position && (
        <button
          onClick={() => {
            setFollowUser(!followUser);
            if (!followUser && mapRef.current) {
              mapRef.current.setView(
                [position.lat, position.lng],
                mapRef.current.getZoom(),
                { animate: true }
              );
            }
          }}
          className={`absolute bottom-4 right-4 z-[1000] w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            followUser
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
          }`}
          title={followUser ? 'Stop following' : 'Follow my location'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L12 6" /><path d="M12 18L12 22" />
            <path d="M2 12L6 12" /><path d="M18 12L22 12" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </button>
      )}

      {/* GPS status */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md ${
          isTracking
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            : 'bg-white/5 border border-white/10 text-gray-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
          {isTracking ? 'GPS Active' : 'GPS Inactive'}
        </div>
      </div>

      {/* Online + Routes count */}
      <div className="absolute top-4 left-32 z-[1000] flex gap-2">
        {otherUsers.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            {otherUsers.length} online
          </div>
        )}
        {ghostRoutes.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md bg-amber-500/15 border border-amber-500/30 text-amber-400">
            👻 {ghostRoutes.length} route{ghostRoutes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
