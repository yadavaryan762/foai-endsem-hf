import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function ISSMap({ position, trajectory }) {
  if (!position) return <div className="h-full w-full bg-muted flex items-center justify-center rounded-lg animate-pulse">Loading Map...</div>;

  const center = [position.lat, position.lng];
  const polylinePositions = trajectory.map(t => [t.lat, t.lng]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
      <MapContainer center={center} zoom={3} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {trajectory.length > 1 && (
          <Polyline positions={polylinePositions} color="red" weight={3} opacity={0.7} />
        )}

        <Marker position={center} icon={issIcon}>
          <Popup>
            <div className="text-sm font-semibold">ISS Current Location</div>
            <div className="text-xs">Lat: {position.lat.toFixed(4)}</div>
            <div className="text-xs">Lng: {position.lng.toFixed(4)}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
