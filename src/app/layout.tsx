import { getServerSession } from 'next-auth'
import Link from 'next/link'

export const metadata = {
  title: 'RMS CargoTrack Pro',
  description: 'Sistema de rastreamento de cargas',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  return (
    <html lang="pt-BR">
      <body style={{margin:0, fontFamily:'system-ui, sans-serif', background:'linear-gradient(135deg, #0B1B3B 0%, #17A2A4 100%)', minHeight:'100vh', padding:16}}>
        <header style={{maxWidth:1200, margin:'0 auto 24px', display:'flex', justifyContent:'space-between', alignItems:'center', padding:16, background:'rgba(255,255,255,0.95)', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
          <Link href="/" style={{fontSize:24, fontWeight:700, color:'#0B1B3B', textDecoration:'none'}}>RMS CargoTrack Pro</Link>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            {session ? (
              <>
                <span style={{color:'#0B1B3B'}}>Olá, {session.user?.name || session.user?.email}</span>
                <a href="/api/auth/signout" style={{color:'#17A2A4', fontWeight:600}}>Sair</a>
              </>
            ) : (
              <a href="/signin" style={{color:'#17A2A4', fontWeight:600}}>Entrar</a>
            )}
          </div>
        </header>
        <main style={{maxWidth:1200, margin:'0 auto'}}>{children}</main>
      </body>
    </html>
  )
}
