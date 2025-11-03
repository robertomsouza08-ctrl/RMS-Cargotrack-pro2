
"use client";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const sessionResult = useSession();
  const status = sessionResult?.status ?? "loading";
  if (status === "loading") return <div>Carregando...</div>;
  if (status === "unauthenticated") return <div>Faça login para continuar</div>;
  return <>{children}</>;
}
