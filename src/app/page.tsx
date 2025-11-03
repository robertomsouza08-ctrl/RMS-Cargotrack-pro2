
"use client";

import dynamic from "next/dynamic";

// Carrega o mapa só no client
const MapClient = dynamic(() => import("./../components/MapClient"), { ssr: false });

function MobileHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "white",
        borderBottom: "1px solid #eee",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontWeight: 700 }}>RMS CargoTrack Pro</div>
      <nav>
        {/* links futuros podem ir aqui */}
      </nav>
    </header>
  );
}

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <MobileHeader />
      <section style={{ padding: "12px" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Mapa e Localização</h1>
        <p style={{ marginBottom: 12, color: "#444" }}>
          Permita o acesso à sua localização para visualizar seu posicionamento em tempo real.
        </p>
        <MapClient height="70vh" sendPings={true} />
      </section>
    </main>
  );
}
