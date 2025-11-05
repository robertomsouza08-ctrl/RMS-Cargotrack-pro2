
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MobileHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header style={{
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      padding: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 28 }}>📦</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              RMS CargoTrack Pro
            </div>
            {session?.user?.email && (
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {session.user.email}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            🏠 Home
          </button>
          <button
            onClick={() => router.push("/tracking")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            📍 Tracking
          </button>
          {session?.user?.role === "ADMIN" && (
            <button
              onClick={() => router.push("/admin")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#0f172a",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              ⚙️ Admin
            </button>
          )}
          <button
            onClick={() => signOut()}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#ef4444",
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            🚪 Sair
          </button>
        </div>
      </div>
    </header>
  );
}
