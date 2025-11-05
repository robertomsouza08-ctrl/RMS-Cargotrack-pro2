
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import MobileHeader from "../../components/MobileHeader";

const TrackingMap = dynamic(() => import("../../components/TrackingMap"), { ssr: false });

type Delivery = {
  id: string;
  trackingCode: string;
  origin: string;
  destination: string;
  status: string;
  currentLat?: number;
  currentLng?: number;
  lastUpdate?: string;
};

export default function TrackingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDeliveries();
      const interval = setInterval(fetchDeliveries, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchDeliveries = async () => {
    try {
      const res = await fetch("/api/deliveries/active");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries || []);
        if (data.deliveries?.length > 0 && !selectedDelivery) {
          setSelectedDelivery(data.deliveries[0]);
        }
      }
    } catch (e) {
      console.error("Erro ao buscar entregas:", e);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
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

  if (!session) return null;

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
    }}>
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

        <section style={{ padding: "20px 16px", maxWidth: 1400, margin: "0 auto" }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: "20px",
            marginBottom: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>📦</span>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Rastreamento de Cargas
              </h1>
            </div>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Acompanhe suas entregas em tempo real
            </p>
          </div>

          {deliveries.length === 0 ? (
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: 16,
              padding: "40px 20px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>
                Nenhuma entrega ativa
              </h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Não há entregas em andamento no momento.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(280px, 1fr) 2fr",
              gap: 20,
            }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                maxHeight: "70vh",
                overflowY: "auto",
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: "#0f172a" }}>
                  Entregas Ativas ({deliveries.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      onClick={() => setSelectedDelivery(delivery)}
                      style={{
                        padding: "12px",
                        borderRadius: 10,
                        border: selectedDelivery?.id === delivery.id
                          ? "2px solid #3b82f6"
                          : "1px solid #e2e8f0",
                        background: selectedDelivery?.id === delivery.id
                          ? "rgba(59, 130, 246, 0.05)"
                          : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
                        {delivery.trackingCode}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                        {delivery.origin} → {delivery.destination}
                      </div>
                      <div style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        background: delivery.status === "EM_TRANSITO" ? "#dcfce7" : "#fef3c7",
                        color: delivery.status === "EM_TRANSITO" ? "#166534" : "#92400e",
                      }}>
                        {delivery.status === "EM_TRANSITO" ? "Em Trânsito" : delivery.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: "20px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              }}>
                {selectedDelivery ? (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
                        {selectedDelivery.trackingCode}
                      </h2>
                      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>Origem:</span> {selectedDelivery.origin}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600 }}>Destino:</span> {selectedDelivery.destination}
                        </div>
                      </div>
                      {selectedDelivery.lastUpdate && (
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                          Última atualização: {new Date(selectedDelivery.lastUpdate).toLocaleString("pt-BR")}
                        </div>
                      )}
                    </div>

                    {selectedDelivery.currentLat && selectedDelivery.currentLng ? (
                      <TrackingMap
                        lat={selectedDelivery.currentLat}
                        lng={selectedDelivery.currentLng}
                        trackingCode={selectedDelivery.trackingCode}
                        height="55vh"
                      />
                    ) : (
                      <div style={{
                        height: "55vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8fafc",
                        borderRadius: 12,
                        color: "#64748b",
                      }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
                          <div>Aguardando localização...</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                  }}>
                    Selecione uma entrega para visualizar
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
