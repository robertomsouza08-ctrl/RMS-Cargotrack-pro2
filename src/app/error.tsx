'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{padding:24, background:'rgba(255,255,255,0.95)', borderRadius:12, border:'2px solid #ef4444', maxWidth:680, margin:'0 auto'}}>
      <h1 style={{color:'#ef4444', marginTop:0}}>Algo deu errado!</h1>
      <p><strong>Erro:</strong> {error.message}</p>
      {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
      <button
        onClick={() => reset()}
        style={{
          marginTop:16,
          padding:'10px 16px',
          background:'#17A2A4',
          color:'#0B1B3B',
          border:'none',
          borderRadius:8,
          fontWeight:700,
          cursor:'pointer'
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}