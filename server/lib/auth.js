const supabase = require('../db/supabase');

async function getUserId(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user?.id ?? null;
}

module.exports = { getUserId };
