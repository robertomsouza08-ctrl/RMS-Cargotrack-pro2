import { getServerSession } from 'next-auth'
import { prisma } from '../../lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import bcrypt from 'bcryptjs'

export default async function AdminPage() {
  const session = await getServerSession()

  if (!session?.user?.email) {
    redirect('/signin')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{maxWidth:680, margin:'0 auto'}}>
        <p><Link href="/" style={{color:'#fff', fontWeight:600}}>← Voltar</Link></p>
        <div style={{padding:24, background:'rgba(255,255,255,0.95)', borderRadius:12, border:'2px solid #ef4444'}}>
          <h1 style={{color:'#ef4444', marginTop:0}}>Acesso Negado</h1>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
        <h1 style={{margin:0, color:'#fff'}}>Administração de Usuários</h1>
        <Link href="/" style={{color:'#fff', fontWeight:600}}>← Voltar</Link>
      </div>

      <div style={{background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginBottom:16}}>
        <h2 style={{marginTop:0}}>Criar Novo Usuário</h2>
        <form action={createUser} style={{display:'flex', flexDirection:'column', gap:12}}>
          <input name="name" placeholder="Nome" required style={inp()} />
          <input name="email" type="email" placeholder="Email" required style={inp()} />
          <input name="password" type="password" placeholder="Senha (mín. 6 caracteres)" required minLength={6} style={inp()} />
          <select name="role" style={inp()}>
            <option value="USER">Usuário</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <button type="submit" style={{background:'#17A2A4', color:'#0B1B3B', fontWeight:700, padding:'10px 16px', borderRadius:8, border:'none', cursor:'pointer'}}>
            Criar Usuário
          </button>
        </form>
      </div>

      <div style={{background:'rgba(255,255,255,0.95)', border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
        <h2 style={{marginTop:0}}>Usuários Cadastrados ({users.length})</h2>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #e5e7eb'}}>
                <th style={{padding:12, textAlign:'left'}}>Nome</th>
                <th style={{padding:12, textAlign:'left'}}>Email</th>
                <th style={{padding:12, textAlign:'left'}}>Role</th>
                <th style={{padding:12, textAlign:'left'}}>Tipo</th>
                <th style={{padding:12, textAlign:'left'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                  <td style={{padding:12}}>{u.name || '-'}</td>
                  <td style={{padding:12}}>{u.email}</td>
                  <td style={{padding:12}}>
                    <span style={{
                      padding:'4px 8px',
                      borderRadius:6,
                      fontSize:12,
                      fontWeight:700,
                      background: u.role === 'ADMIN' ? '#fef3c7' : '#e0e7ff',
                      color: u.role === 'ADMIN' ? '#92400e' : '#3730a3'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{padding:12}}>
                    {u.password ? 'Email/Senha' : 'OAuth'}
                  </td>
                  <td style={{padding:12}}>
                    {u.id !== user.id && (
                      <form action={deleteUser} style={{display:'inline'}}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" style={{color:'#ef4444', background:'none', border:'none', cursor:'pointer', fontWeight:600}}>
                          Excluir
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

async function createUser(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    }
  })

  redirect('/admin')
}

async function deleteUser(formData: FormData) {
  'use server'
  const id = formData.get('id') as string

  await prisma.user.delete({
    where: { id }
  })

  redirect('/admin')
}

function inp(): React.CSSProperties {
  return { padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8 }
}
