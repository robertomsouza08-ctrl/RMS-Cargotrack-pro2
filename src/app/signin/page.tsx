
'use client'
import React from 'react'
import { signIn } from 'next-auth/react'

export default function SignInPage(){
  return (
    <div style={{maxWidth:420, margin:'40px auto', background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, padding:24}}>
      <h1 style={{marginTop:0}}>Entrar</h1>
      <p style={{color:'#475569', marginBottom:16}}>Escolha um provedor para autenticar:</p>
      <div style={{display:'grid', gap:12}}>
        <button onClick={() => signIn('github')} style={btn('#0B1B3B','#fff')}>Entrar com GitHub</button>
        <button onClick={() => signIn('google')} style={btn('#DB4437','#fff')}>Entrar com Google</button>
      </div>
    </div>
  )
}

function btn(bg:string, color:string): React.CSSProperties {
  return { background:bg, color, padding:'10px 12px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700 }
}
