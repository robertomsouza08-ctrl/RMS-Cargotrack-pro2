
"use client";

import dynamic from "next/dynamic";
import MobileHeader from "../components/MobileHeader";

// Carrega o mapa só no client
const MapClient = dynamic(() => import("../components/MapClient"), { ssr: false });

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <MobileHeader />
      <section style={{ padding: "12px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <a href="/admin" style={{
            flex: 1,
            display: "block",
            padding: "12px",
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#f8fafc",
            color: "#0f172a",
            textDecoration: "none"
          }}>
            Painel Admin
          </a>
          <a href="/tracking" style={{
            flex: 1,
            display: "block",
            padding: "12px",
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#f8fafc",
            color: "#0f172a",
            textDecoration: "none"
          }}>
            Tracking
          </a>
        </div>

        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Mapa e Localização</h1>
        <p style={{ marginBottom: 12, color: "#444" }}>
          Permita o acesso à sua localização para visualizar seu posicionamento em tempo real.
        </p>
        <MapClient height="70vh" sendPings={true} />
      </section>
    </main>
  );
}
