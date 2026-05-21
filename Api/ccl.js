export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const r = await fetch('https://dolarapi.com/v1/dolares/contadoconliqui');
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'fetch failed' });
  }
}
