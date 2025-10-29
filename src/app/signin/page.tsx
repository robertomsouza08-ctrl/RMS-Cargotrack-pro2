'use client'
import { signIn } from 'next-auth/react'

export default function SignIn() {
  return (
    <div style={{maxWidth:400, margin:'0 auto', padding:24, background:'rgba(255,255,255,0.95)', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
      <h1 style={{marginTop:0}}>Entrar</h1>
      <p style={{color:'#6b7280', marginBottom:24}}>Escolha um provedor para autenticar:</p>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        <button onClick={() => signIn('github', { callbackUrl: '/' })} style={{padding:'12px 16px', background:'#24292e', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer'}}>
          Entrar com GitHub
        </button>
        <button onClick={() => signIn('google', { callbackUrl: '/' })} style={{padding:'12px 16px', background:'#4285f4', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer'}}>
          Entrar com Google
        </button>
      </div>
    </div>
  )
}
