"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in Leaflet with Next.js
const icon = L.icon({
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
	const map = useMap();
	useEffect(() => {
		map.setView([lat, lng], map.getZoom());
	}, [lat, lng, map]);
	return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
	useMapEvents({
		click(e) {
			onLocationSelect(e.latlng.lat, e.latlng.lng);
		},
	});
	return null;
}

interface MapViewProps {
	latitude: number;
	longitude: number;
	onLocationSelect?: (lat: number, lng: number) => void;
	className?: string;
}

export default function MapView({ latitude, longitude, onLocationSelect, className = "" }: MapViewProps) {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return (
			<div className="h-full w-full grid place-items-center bg-gray-100">
				<span className="text-sm text-gray-500">Loading map...</span>
			</div>
		);
	}

	return (
		<MapContainer
			key={`${latitude}-${longitude}`}
			center={[latitude, longitude]}
			zoom={15}
			className={className}
			style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
			scrollWheelZoom={true}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<Marker position={[latitude, longitude]} icon={icon}>
				<Popup>
					Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
				</Popup>
			</Marker>
			<RecenterMap lat={latitude} lng={longitude} />
			{onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}
		</MapContainer>
	);
}
