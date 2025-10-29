
'use client'
import React from 'react'
import { useSession } from 'next-auth/react'

export function CreateForm({ action }: { action: (formData: FormData) => void }){
  const { status } = useSession()
  if (status !== 'authenticated') return null
  return (
    <form action={action} style={{display:'flex', gap:8, flexWrap:'wrap', margin:'16px 0', padding:12, background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12}}>
      <input name="code" placeholder="Código" required style={inp()} />
      <input name="origin" placeholder="Origem" required style={inp()} />
      <input name="destination" placeholder="Destino" required style={inp()} />
      <input name="eta" type="datetime-local" placeholder="ETA" style={inp()} />
      <button type="submit" style={{background:'#17A2A4', color:'#0B1B3B', fontWeight:700, padding:'8px 12px', borderRadius:8, border:'none', cursor:'pointer'}}>Criar</button>
    </form>
  )
}

function inp(): React.CSSProperties {
  return { padding:'8px 10px', border:'1px solid #cbd5e1', borderRadius:8, minWidth:180 }
}
