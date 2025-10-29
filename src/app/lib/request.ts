
export async function readJson(req: Request){
  try { return await req.json() } catch { return null }
}
