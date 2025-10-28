
'use client'
import React, { useEffect } from 'react'

type Props = {
  origin: { name: string; lat: number; lng: number }
  destination: { name: string; lat: number; lng: number }
  status: string
}

export default function ShipmentMap({ origin, destination, status }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const L = (window as any).L
    if (!L) {
      console.error('Leaflet not loaded')
      return
    }

    const map = L.map('map').setView([(origin.lat + destination.lat) / 2, (origin.lng + destination.lng) / 2], 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    const statusColors: Record<string, string> = {
      IN_TRANSIT: '#17A2A4',
      CHECKED_IN: '#FFC107',
      DELIVERED: '#2E7D32',
    }
    const color = statusColors[status] || '#666'

    const originIcon = L.divIcon({
      className: 'custom-icon',
      html: `<div style="background:${color}; width:24px; height:24px; border-radius:50%; border:3px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    const destIcon = L.divIcon({
      className: 'custom-icon',
      html: '<div style="background:#94a3b8; width:20px; height:20px; border-radius:50%; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })

    L.marker([origin.lat, origin.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<strong>Origem:</strong> ${origin.name}`)

    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(`<strong>Destino:</strong> ${destination.name}`)

    L.polyline([[origin.lat, origin.lng], [destination.lat, destination.lng]], {
      color,
      weight: 3,
      opacity: 0.6,
      dashArray: '10, 10'
    }).addTo(map)

    return () => {
      map.remove()
    }
  }, [origin, destination, status])

  return <div id="map" style={{ height: 400, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}></div>
}
