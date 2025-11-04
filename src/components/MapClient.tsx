
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

type GeoState = {
  coords?: { lat: number; lng: number; accuracy?: number };
  permission: "prompt" | "granted" | "denied" | "unsupported";
  lastUpdate?: string;
  error?: string;
};

function makeUserIcon() {
  return L.divIcon({
    className: "user-marker",
    html: `<div style="
      width: 18px; height: 18px; border-radius: 50%;
      background: #2563eb; border: 2px solid white; box-shadow: 0 0 0 2px #2563eb33;
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Componente interno que será carregado dinamicamente junto com o mapa
function MapContent({
  center,
  zoom,
  position,
  userIcon,
  state,
}: {
  center: [number, number];
  zoom: number;
  position: { lat: number; lng: number; accuracy?: number } | null;
  userIcon: L.DivIcon;
  state: GeoState;
}) {
  // Agora podemos importar diretamente porque este componente só roda no client
  const { MapContainer, TileLayer, Marker, Popup, useMap } = require("react-leaflet");

  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: "100%", height: "100%", borderRadius: 8, overflow: "hidden" }}
    >
      <MapUpdater center={center} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <Marker position={[position.lat, position.lng]} icon={userIcon}>
          <Popup>
            <div style={{ fontSize: 12 }}>
              <div><strong>Você</strong></div>
              {position.accuracy ? <div>Acurácia: {Math.round(position.accuracy)} m</div> : null}
              {state.lastUpdate ? <div>Atualizado: {new Date(state.lastUpdate).toLocaleTimeString()}</div> : null}
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

// Carrega o MapContent dinamicamente
const DynamicMapContent = dynamic(() => Promise.resolve(MapContent), { ssr: false });

export default function MapClient({
  initialCenter = { lat: -23.55052, lng: -46.633308 },
  height = "70vh",
  zoom = 15,
  sendPings = true,
}: {
  initialCenter?: { lat: number; lng: number };
  height?: string;
  zoom?: number;
  sendPings?: boolean;
}) {
  const [state, setState] = useState<GeoState>({ permission: "prompt" });
  const [center, setCenter] = useState<[number, number]>([initialCenter.lat, initialCenter.lng]);
  const userIcon = useMemo(() => makeUserIcon(), []);
  const hasCenteredOnFirstFix = useRef(false);
  const watchIdRef = useRef<number | null>(null);
  const lastPingAtRef = useRef<number>(0);

  // Carrega CSS do Leaflet (apenas no client)
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

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState(s => ({ ...s, permission: "unsupported", error: "Geolocalização não suportada" }));
      return;
    }

    const sendPing = async (lat: number, lng: number, accuracy?: number) => {
      if (!sendPings) return;
      const now = Date.now();
      if (now - lastPingAtRef.current < 8000) return;
      lastPingAtRef.current = now;
      try {
        await fetch("/api/location/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng, accuracy, source: "home-map" }),
        });
      } catch (e) {
        console.error("Falha ao enviar ping:", e);
      }
    };

    const opts: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 };
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        const nowIso = new Date().toISOString();
        setState(s => ({
          ...s,
          permission: "granted",
          coords: { lat: latitude, lng: longitude, accuracy },
          lastUpdate: nowIso,
          error: undefined,
        }));
        if (!hasCenteredOnFirstFix.current) {
          setCenter([latitude, longitude]);
          hasCenteredOnFirstFix.current = true;
        }
        void sendPing(latitude, longitude, accuracy);
      },
      err => {
        setState(s => ({
          ...s,
          error: err.message,
          permission: err.code === err.PERMISSION_DENIED ? "denied" : s.permission,
        }));
      },
      opts
    );
    watchIdRef.current = watchId as unknown as number;

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [sendPings]);

  const position = state.coords ?? null;

  return (
    <div style={{ width: "100%", height }}>
      <DynamicMapContent
        center={center}
        zoom={zoom}
        position={position}
        userIcon={userIcon}
        state={state}
      />

      <div style={{ padding: "8px 4px", fontSize: 12 }}>
        {state.permission === "unsupported" && (
          <div style={{ color: "#b91c1c" }}>Geolocalização não é suportada neste dispositivo/navegador.</div>
        )}
        {state.permission === "denied" && (
          <div style={{ color: "#b91c1c" }}>
            Permissão de localização negada. Ative nas configurações para visualizar sua posição no mapa.
          </div>
        )}
        {!position && state.permission !== "denied" && (
          <div>Obtendo sua localização…</div>
        )}
      </div>
    </div>
  );
}
