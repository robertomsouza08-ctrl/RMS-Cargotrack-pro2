
import { NextResponse } from 'next/server'

type Shipment = { id: string; code: string; origin: string; destination: string; status: string; eta?: string }

const seed: Shipment[] = [
  { id: '1', code: 'CTP-001', origin: 'São Paulo', destination: 'Rio de Janeiro', status: 'in_transit', eta: new Date(Date.now()+3*86400000).toISOString() },
  { id: '2', code: 'CTP-002', origin: 'Campinas', destination: 'Curitiba', status: 'checked_in', eta: new Date(Date.now()+2*86400000).toISOString() },
  { id: '3', code: 'CTP-003', origin: 'Santos', destination: 'Belo Horizonte', status: 'delivered', eta: new Date(Date.now()-2*86400000).toISOString() },
]

export async function GET(){
  return NextResponse.json(seed)
}
