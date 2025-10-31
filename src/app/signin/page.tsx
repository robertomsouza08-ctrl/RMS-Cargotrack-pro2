'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Email ou senha inválidos')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{maxWidth:400, margin:'0 auto', padding:24, background:'rgba(255,255,255,0.95)', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
      <h1 style={{marginTop:0}}>Entrar</h1>

      <form onSubmit={handleCredentialsSignIn} style={{marginBottom:24}}>
        <p style={{color:'#6b7280', marginBottom:16}}>Entre com email e senha:</p>
        {error && (
          <div style={{padding:12, background:'#fee2e2', border:'1px solid #ef4444', borderRadius:8, marginBottom:12, color:'#991b1b'}}>
            {error}
          </div>
        )}
        <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:16}}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{padding:'12px 16px', border:'1px solid #cbd5e1', borderRadius:8}}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{padding:'12px 16px', border:'1px solid #cbd5e1', borderRadius:8}}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{width:'100%', padding:'12px 16px', background:'#17A2A4', color:'#0B1B3B', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', opacity: loading ? 0.5 : 1}}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div style={{borderTop:'1px solid #e5e7eb', paddingTop:24}}>
        <p style={{color:'#6b7280', marginBottom:12, textAlign:'center'}}>Ou entre com:</p>
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <button onClick={() => signIn('github', { callbackUrl: '/' })} style={{padding:'12px 16px', background:'#24292e', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer'}}>
            GitHub
          </button>
          <button onClick={() => signIn('google', { callbackUrl: '/' })} style={{padding:'12px 16px', background:'#4285f4', color:'#fff', border:'none', borderRadius:8, fontWeight:600, cursor:'pointer'}}>
            Google
          </button>
        </div>
      </div>
    </div>
  )
}
