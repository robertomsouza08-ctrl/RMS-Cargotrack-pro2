
import React from 'react'

export const metadata = {
  title: 'RMS CargoTrack Pro',
  description: 'Simplificado — UI + API embutida',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{margin:0, fontFamily:'Inter, system-ui, Arial'}}>
        <header style={{background:'#0B1B3B', color:'#fff', padding:'12px 16px'}}>RMS CargoTrack Pro</header>
        <main style={{padding:'16px'}}>{children}</main>
        <footer style={{padding:'12px 16px', color:'#666', fontSize:12}}>© {new Date().getFullYear()} RMS CargoTrack Pro</footer>
      </body>
    </html>
  )
}
