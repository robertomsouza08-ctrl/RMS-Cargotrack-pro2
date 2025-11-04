
"use client";
import Image from "next/image";
import Link from "next/link";

export default function MobileHeader() {
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
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Image src="/logo.png" alt="RMS CargoTrack Pro" width={28} height={28} />
        <span style={{ fontWeight: 700 }}>RMS CargoTrack Pro</span>
      </div>
      <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
        <Link href="/admin">Admin</Link>
        <Link href="/tracking">Tracking</Link>
      </nav>
    </header>
  );
}
