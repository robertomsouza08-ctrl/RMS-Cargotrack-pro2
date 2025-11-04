
"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function MobileHeader() {
  const { data: session, status } = useSession();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="url(#grad1)"/>
          <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="16" cy="16" r="3" fill="white"/>
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#3b82f6"/>
              <stop offset="100%" stopColor="#1d4ed8"/>
            </linearGradient>
          </defs>
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>RMS CargoTrack</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>Pro</div>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 14 }}>
        {status === "loading" ? (
          <span style={{ color: "#94a3b8" }}>...</span>
        ) : session ? (
          <>
            <Link href="/tracking" style={{ color: "#475569", textDecoration: "none", fontWeight: 500 }}>
              Tracking
            </Link>
            {session.user?.email === "admin@rms.com" && (
              <Link href="/admin" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                background: "none",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 13,
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link href="/api/auth/signin" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}
