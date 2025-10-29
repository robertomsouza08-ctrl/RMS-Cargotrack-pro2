
// Require DATABASE_URL in production; allow default only for local dev if set explicitly
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production')
  }
}
