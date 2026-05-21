export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const API_KEY = '62190011d81042aca2086bc40914186f';

  // 1. Twelve Data
  try {
    const r = await fetch(`https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${API_KEY}`);
    const data = await r.json();
    const vals = Object.values(data);
    const bad = data?.code === 429 || data?.status === 'error' || vals.some(v => v?.code === 429);
    if (!bad) return res.json({ source: 'twelvedata', data });
  } catch {}

  // 2. Stooq - una request por ticker
  const list = symbols.split(',');
  const result = {};

  for (const sym of list) {
    try {
      const s = sym === 'BTC/USD' ? 'btc.v' : sym.toLowerCase() + '.us';
      const r = await fetch(`https://stooq.com/q/l/?s=${s}&f=sd2t2ohlcv&h&e=csv`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const txt = await r.text();
      // txt example: "Symbol,Date,...\r\nSPY.US,2026-05-21,...,737.73,...\r\n"
      const row = txt.split('\n')[1];
      if (!row) continue;
      const c = row.replace(/\r/g, '').split(',');
      // cols: 0=Symbol 1=Date 2=Time 3=Open 4=High 5=Low 6=Close 7=Volume
      const close = +c[6], open = +c[3];
      if (isNaN(close) || close === 0) continue;
      result[sym] = {
        close: String(close),
        previous_close: String(open),
        change: open ? ((close - open) / open) * 100 : 0
      };
    } catch {}
  }

  return res.json({ source: 'stooq', data: result });
}
