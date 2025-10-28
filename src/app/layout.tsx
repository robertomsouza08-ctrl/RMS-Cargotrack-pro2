
import React from 'react'

export const metadata = {
  title: 'RMS CargoTrack Pro',
  description: 'Rastreamento de cargas em tempo real',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: 'RMS CargoTrack Pro',
    description: 'Rastreamento de cargas em tempo real',
    url: '/',
    siteName: 'RMS CargoTrack Pro',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/logo.svg',
        width: 120,
        height: 120,
        alt: 'RMS CargoTrack Pro',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'RMS CargoTrack Pro',
    description: 'Rastreamento de cargas em tempo real',
    images: ['/logo.svg'],
  },
  themeColor: '#0B1B3B',
}

const styles = {
  header: {
    background: 'linear-gradient(90deg, #0B1B3B 0%, #0F274F 50%, #0B1B3B 100%)',
    color: '#fff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '3px solid #17A2A4'
  } as React.CSSProperties,
  brand: { display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  brandText: { fontWeight: 700, letterSpacing: 0.4 } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    background: '#FFC107',
    color: '#0B1B3B',
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    marginLeft: 8
  } as React.CSSProperties,
  container: { maxWidth: 980, margin: '0 auto', padding: '16px' } as React.CSSProperties,
  footer: { padding: '12px 16px', color: '#666', fontSize: 12, borderTop: '1px solid #eee', textAlign: 'center' } as React.CSSProperties,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{margin:0, fontFamily:'Inter, system-ui, Arial', background:'#f6f8fb'}}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <img src="/logo.svg" alt="RMS" width={32} height={32} />
            <span style={styles.brandText}>RMS CargoTrack Pro</span>
            <span style={styles.badge}>Pro</span>
          </div>
          <nav>
            <a href="/" style={{color:'#BFE3E4', textDecoration:'none', marginRight:16}}>Início</a>
            <a href="/health" style={{color:'#BFE3E4', textDecoration:'none'}}>Health</a>
          </nav>
        </header>
        <main style={styles.container}>{children}</main>
        <footer style={styles.footer}>© {new Date().getFullYear()} RMS CargoTrack Pro</footer>
      </body>
    </html>
  )
}
