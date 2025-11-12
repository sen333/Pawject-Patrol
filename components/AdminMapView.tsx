"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";

// Fix default marker icon issue with Leaflet + Webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterButton({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  const handleRecenter = () => {
    map.setView([latitude, longitude], 15, {
      animate: true,
    });
  };

  return (
    <button
      onClick={handleRecenter}
      className="absolute top-3 right-3 z-[1000] px-3 py-1.5 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-700 shadow-md hover:bg-gray-50"
      title="Recenter map to original location"
    >
      ⟲ Recenter
    </button>
  );
}

export default function AdminMapView({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-lg border overflow-hidden">
      <MapContainer
        key={`${latitude}-${longitude}`}
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={icon} />
        <RecenterButton latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  );
}
