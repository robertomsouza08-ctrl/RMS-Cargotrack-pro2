
"use client";

import dynamic from "next/dynamic";
import MobileHeader from "../components/MobileHeader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const MapClient = dynamic(() => import("../components/MapClient"), { ssr: false });

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redireciona para login se não autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}>
        <div style={{ color: "white", fontSize: 18 }}>Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = session.user?.email === "admin@rms.com";

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background pattern */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        opacity: 0.4,
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <MobileHeader />

        <section style={{ padding: "20px 16px", maxWidth: 1200, margin: "0 auto" }}>
          {/* Welcome card */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
              Bem-vindo, {session.user?.name || session.user?.email}
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Acompanhe suas entregas em tempo real com rastreamento GPS
            </p>
          </div>

          {/* Action cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isAdmin ? "repeat(auto-fit, minmax(140px, 1fr))" : "1fr",
            gap: 12,
            marginBottom: 20,
          }}>
            {isAdmin && (
              <a href="/admin" style={{
                display: "block",
                background: "rgba(59, 130, 246, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 12,
                padding: "16px",
                textDecoration: "none",
                color: "white",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Painel Admin</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>Gerenciar usuários</div>
              </a>
            )}
            <a href="/tracking" style={{
              display: "block",
              background: "rgba(16, 185, 129, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: 12,
              padding: "16px",
              textDecoration: "none",
              color: "white",
              boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Tracking</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Rastrear entregas</div>
            </a>
          </div>

          {/* Map section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                Sua Localização
              </h2>
            </div>
            <p style={{ marginBottom: 16, color: "#64748b", fontSize: 14 }}>
              Permita o acesso à sua localização para visualizar seu posicionamento em tempo real.
            </p>
            <MapClient height="60vh" sendPings={true} />
          </div>
        </section>
      </div>
    </main>
  );
}
