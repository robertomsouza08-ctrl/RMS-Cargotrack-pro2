
// Ensure DATABASE_URL exists for Prisma (SQLite default)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db'
}
