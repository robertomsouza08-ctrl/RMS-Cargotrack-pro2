
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

type LocationPing = {
  lat: number;
  lng: number;
  timestamp: string;
};

function TrackingMapContent({
  lat,
  lng,
  trackingCode,
  height,
}: {
  lat: number;
  lng: number;
  trackingCode: string;
  height: string;
}) {
  const { MapContainer, TileLayer, Marker, Popup, Polyline } = require("react-leaflet");
  const [history, setHistory] = useState<LocationPing[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/location/history?trackingCode=${trackingCode}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.pings || []);
        }
      } catch (e) {
        console.error("Erro ao buscar histórico:", e);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [trackingCode]);

  const cargoIcon = L.divIcon({
    className: "cargo-marker",
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: #10b981; border: 3px solid white; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
      display: flex; align-items: center; justify-content: center; font-size: 12px;
    ">📦</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const pathCoords: [number, number][] = history.map(p => [p.lat, p.lng]);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      style={{ width: "100%", height, borderRadius: 12, overflow: "hidden" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pathCoords.length > 1 && (
        <Polyline positions={pathCoords} color="#3b82f6" weight={3} opacity={0.6} />
      )}
      <Marker position={[lat, lng]} icon={cargoIcon}>
        <Popup>
          <div style={{ fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{trackingCode}</div>
            <div>Lat: {lat.toFixed(6)}</div>
            <div>Lng: {lng.toFixed(6)}</div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

const DynamicTrackingMapContent = dynamic(() => Promise.resolve(TrackingMapContent), { ssr: false });

export default function TrackingMap({
  lat,
  lng,
  trackingCode,
  height = "60vh",
}: {
  lat: number;
  lng: number;
  trackingCode: string;
  height?: string;
}) {
  useEffect(() => {
    const id = "leaflet-css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <DynamicTrackingMapContent
      lat={lat}
      lng={lng}
      trackingCode={trackingCode}
      height={height}
    />
  );
}
