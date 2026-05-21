export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const API_KEY = '62190011d81042aca2086bc40914186f';

  // 1. Intentar Twelve Data
  try {
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${API_KEY}`
    );
    const data = await r.json();
    const isError = data?.code === 429 || data?.status === 'error' ||
      (typeof data === 'object' && Object.values(data).some(v => v?.code === 429 || v?.status === 'error'));
    if (!isError) return res.json({ source: 'twelvedata', data });
  } catch {}

  // 2. Fallback: Stooq
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://stooq.com/',
  };

  const symbolList = symbols.split(',');
  const result = {};

  await Promise.all(symbolList.map(async (sym) => {
    try {
      const stooqSym = sym === 'BTC/USD' ? 'btc.v' : `${sym.toLowerCase()}.us`;
      const r = await fetch(`https://stooq.com/q/l/?s=${stooqSym}&f=sd2t2ohlcv&h&e=csv`, { headers });
      const text = await r.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;
      // Remover \r de cada campo
      const cols = lines[1].replace(/\r/g, '').split(',');
      // Symbol,Date,Time,Open,High,Low,Close,Volume
      const close = parseFloat(cols[6]);
      const open  = parseFloat(cols[3]);
      if (!close || isNaN(close)) return;
      const change = open ? ((close - open) / open) * 100 : 0;
      result[sym] = { close: String(close), previous_close: String(open), change };
    } catch {}
  }));

  res.json({ source: 'stooq', data: result });
}
