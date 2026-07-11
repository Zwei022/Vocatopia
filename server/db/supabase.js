const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Node.js < 22 沒有原生 WebSocket，@supabase/supabase-js 的 Realtime 模組在偵測不到時
// 會直接拋出未捕捉例外讓整個 process 當機（曾在 Railway 建置到 Node 18 時實際發生過）。
// 明確提供 ws 當作 transport，不管日後建置環境拿到哪個 Node 版本都不會再因此當機。
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { realtime: { transport: ws } }
);

module.exports = supabase;
