export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  // Stooq usa .us para acciones/ETFs americanos, /usd para crypto
  // symbols viene como "SPY,ACWI,BTC/USD" → convertir a stooq format
  const symbolList = symbols.split(',');
  const result = {};

  await Promise.all(symbolList.map(async (sym) => {
    try {
      const stooqSym = sym === 'BTC/USD' ? 'btc.v' : `${sym.toLowerCase()}.us`;
      const url = `https://stooq.com/q/l/?s=${stooqSym}&f=sd2t2ohlcv&h&e=csv`;
      const r = await fetch(url);
      const text = await r.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;
      const cols = lines[1].split(',');
      // CSV: Symbol,Date,Time,Open,High,Low,Close,Volume
      const close = parseFloat(cols[6]);
      const open  = parseFloat(cols[3]);
      if (!close || isNaN(close)) return;
      const change = ((close - open) / open) * 100;
      result[sym] = { price: close, change };
    } catch {}
  }));

  res.json(result);
}
