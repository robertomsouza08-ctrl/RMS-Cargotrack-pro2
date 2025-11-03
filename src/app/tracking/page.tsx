
"use client";
import { useSession } from "next-auth/react";

export default function TrackingPage() {
  const sessionResult = useSession();
  const status = sessionResult?.status ?? "loading";
  const session = sessionResult?.data ?? null;

  if (status === "loading") return <div>Carregando...</div>;
  if (status === "unauthenticated") return <div>Faça login para acessar o tracking.</div>;

  return (
    <div>
      <h1>RMS CargoTrack Pro - Tracking</h1>
      <p>Usuário: {session?.user?.email}</p>
      {/* o restante da página permanece igual */}
    </div>
  );
}
