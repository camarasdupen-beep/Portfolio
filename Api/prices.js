export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols required' });

  const API_KEY = '62190011d81042aca2086bc40914186f';

  try {
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${API_KEY}`
    );
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
}
