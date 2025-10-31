# RMS CargoTrack Pro - v5.6

Sistema de rastreamento de cargas com autenticação e painel administrativo.

## Novidades v5.6

✅ **Sistema de Administrador**
- Painel admin em `/admin`
- Criar usuários com email/senha
- Definir roles (USER ou ADMIN)
- Excluir usuários

✅ **Autenticação por Email/Senha**
- Login com credenciais além de GitHub/Google
- Senhas criptografadas com bcrypt
- Suporte a múltiplos métodos de autenticação

✅ **Controle de Acesso**
- Roles: USER e ADMIN
- Apenas ADMIN pode acessar `/admin`
- Link "Admin" aparece no header para admins

## Credenciais Padrão

Após rodar o seed:
- **Email:** admin@rmscargotrack.com
- **Senha:** admin123

## Deploy Railway

1. Faça deploy normalmente
2. Após primeiro deploy, rode:
   ```bash
   npm run prisma:seed
   ```
3. Acesse `/admin` com as credenciais padrão
4. Crie novos usuários conforme necessário

## Estrutura de Roles

- **USER**: Pode visualizar e criar shipments
- **ADMIN**: Pode fazer tudo + gerenciar usuários no `/admin`

## Dependências Novas

- bcryptjs: Criptografia de senhas
- @types/bcryptjs: Tipos TypeScript
