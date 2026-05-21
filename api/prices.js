export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const API_KEY = '62190011d81042aca2086bc40914186f';

  // Intentar Twelve Data primero
  try {
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${API_KEY}`
    );
    const data = await r.json();

    // Verificar si hay error de créditos agotados
    const isMulti = symbols.includes(',');
    const firstVal = isMulti ? Object.values(data)[0] : data;
    const hasCreditsError = firstVal?.code === 429 || firstVal?.status === 'error';

    if (!hasCreditsError) {
      return res.json({ source: 'twelvedata', data });
    }
  } catch {}

  // Fallback: Stooq (EOD, sin límite)
  const symbolList = symbols.split(',');
  const result = {};

  await Promise.all(symbolList.map(async (sym) => {
    try {
      const stooqSym = sym === 'BTC/USD' ? 'btc.v' : `${sym.toLowerCase()}.us`;
      const r = await fetch(`https://stooq.com/q/l/?s=${stooqSym}&f=sd2t2ohlcv&h&e=csv`);
      const text = await r.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;
      const cols = lines[1].split(',');
      const close = parseFloat(cols[6]);
      const open  = parseFloat(cols[3]);
      const prev  = parseFloat(cols[5]); // Low como referencia si no hay prev close
      if (!close || isNaN(close)) return;
      const change = open ? ((close - open) / open) * 100 : 0;
      result[sym] = { close: String(close), previous_close: String(open), change };
    } catch {}
  }));

  res.json({ source: 'stooq', data: result });
}
