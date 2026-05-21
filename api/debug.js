export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://stooq.com/',
  };

  const url = `https://stooq.com/q/l/?s=spy.us&f=sd2t2ohlcv&h&e=csv`;
  try {
    const r = await fetch(url, { headers });
    const text = await r.text();
    res.json({ status: r.status, text, lines: text.split('\n') });
  } catch(e) {
    res.json({ error: e.message });
  }
}
