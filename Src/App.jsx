import { useState, useEffect, useCallback } from "react";

// Ratios oficiales de Comafi (https://www.comafi.com.ar/custodiaglobal/Programas-CEDEARs-2483.note.aspx)
// ratio = CEDEARs por 1 acción subyacente (ej: 20 significa que necesitás 20 CEDEARs para tener 1 AAPL)
// ratioInverse = true significa que 1 CEDEAR representa MÚLTIPLES acciones (ej: ABEV ratio:3 inverse = 1 CEDEAR = 3 acciones)
const CEDEAR_DB = {
  // Tecnología
  AAPL:  { ratio: 20,  name: "Apple",              emoji: "🍎", sector: "Tech" },
  MSFT:  { ratio: 8,   name: "Microsoft",           emoji: "🪟", sector: "Tech" },
  GOOGL: { ratio: 58,  name: "Alphabet",            emoji: "🔍", sector: "Tech" },
  AMZN:  { ratio: 144, name: "Amazon",              emoji: "📦", sector: "Tech" },
  META:  { ratio: 8,   name: "Meta",                emoji: "👓", sector: "Tech" },
  NVDA:  { ratio: 10,  name: "Nvidia",              emoji: "🎮", sector: "Tech" },
  AMD:   { ratio: 10,  name: "AMD",                 emoji: "💻", sector: "Tech" },
  INTC:  { ratio: 5,   name: "Intel",               emoji: "🔵", sector: "Tech" },
  ADBE:  { ratio: 44,  name: "Adobe",               emoji: "🎨", sector: "Tech" },
  AVGO:  { ratio: 39,  name: "Broadcom",            emoji: "📡", sector: "Tech" },
  AMAT:  { ratio: 5,   name: "Applied Materials",   emoji: "⚙️", sector: "Tech" },
  CSCO:  { ratio: 5,   name: "Cisco",               emoji: "🌐", sector: "Tech" },
  IBM:   { ratio: 15,  name: "IBM",                 emoji: "🔷", sector: "Tech" },
  ORCL:  { ratio: 15,  name: "Oracle",              emoji: "🔴", sector: "Tech" },
  CRM:   { ratio: 40,  name: "Salesforce",          emoji: "☁️", sector: "Tech" },
  ACN:   { ratio: 75,  name: "Accenture",           emoji: "📊", sector: "Tech" },
  DOCU:  { ratio: 22,  name: "DocuSign",            emoji: "📄", sector: "Tech" },
  ETSY:  { ratio: 16,  name: "Etsy",                emoji: "🎀", sector: "Tech" },
  XYZ:   { ratio: 20,  name: "Block Inc",           emoji: "🟦", sector: "Tech" },
  COIN:  { ratio: 27,  name: "Coinbase",            emoji: "🪙", sector: "Tech" },
  BB:    { ratio: 3,   name: "BlackBerry",          emoji: "📱", sector: "Tech" },
  GLOB:  { ratio: 18,  name: "Globant",             emoji: "🌎", sector: "Tech" },
  ARM:   { ratio: 27,  name: "ARM Holdings",        emoji: "🦾", sector: "Tech" },
  ISRG:  { ratio: 90,  name: "Intuitive Surgical",  emoji: "🤖", sector: "Tech" },
  // Autos / Transporte
  TSLA:  { ratio: 5,   name: "Tesla",               emoji: "⚡", sector: "Auto" },
  GM:    { ratio: 6,   name: "General Motors",      emoji: "🚗", sector: "Auto" },
  HOG:   { ratio: 3,   name: "Harley-Davidson",     emoji: "🏍️", sector: "Auto" },
  HMC:   { ratio: 1,   name: "Honda",               emoji: "🚙", sector: "Auto" },
  BA:    { ratio: 24,  name: "Boeing",              emoji: "✈️", sector: "Ind"  },
  GE:    { ratio: 8,   name: "GE Aerospace",        emoji: "🛫", sector: "Ind"  },
  DAL:   { ratio: 8,   name: "Delta Airlines",      emoji: "🛬", sector: "Ind"  },
  AAL:   { ratio: 2,   name: "American Airlines",   emoji: "🛩️", sector: "Ind"  },
  ERJ:   { ratio: 1,   name: "Embraer",             emoji: "🛸", sector: "Ind"  },
  // Finanzas
  JPM:   { ratio: 20,  name: "JPMorgan",            emoji: "🏦", sector: "Fin"  },
  BAC:   { ratio: 4,   name: "Bank of America",     emoji: "💰", sector: "Fin"  },
  GS:    { ratio: 13,  name: "Goldman Sachs",       emoji: "💹", sector: "Fin"  },
  AXP:   { ratio: 15,  name: "Amex",                emoji: "💳", sector: "Fin"  },
  C:     { ratio: 3,   name: "Citigroup",           emoji: "🌆", sector: "Fin"  },
  BK:    { ratio: 2,   name: "BNY Mellon",          emoji: "🏛️", sector: "Fin"  },
  AIG:   { ratio: 5,   name: "AIG",                 emoji: "🛡️", sector: "Fin"  },
  SCHW:  { ratio: 13,  name: "Charles Schwab",      emoji: "📈", sector: "Fin"  },
  BRKB:  { ratio: 22,  name: "Berkshire B",         emoji: "🎩", sector: "Fin"  },
  // Consumo / Retail
  WMT:   { ratio: 20,  name: "Walmart",             emoji: "🏪", sector: "Cons" },
  COST:  { ratio: 48,  name: "Costco",              emoji: "🛒", sector: "Cons" },
  HD:    { ratio: 32,  name: "Home Depot",          emoji: "🏠", sector: "Cons" },
  MCD:   { ratio: 10,  name: "McDonald's",          emoji: "🍔", sector: "Cons" },
  KO:    { ratio: 5,   name: "Coca-Cola",           emoji: "🥤", sector: "Cons" },
  PEP:   { ratio: 15,  name: "PepsiCo",             emoji: "🥛", sector: "Cons" },
  MO:    { ratio: 4,   name: "Altria",              emoji: "🚬", sector: "Cons" },
  CL:    { ratio: 3,   name: "Colgate",             emoji: "🦷", sector: "Cons" },
  // Salud / Farma
  JNJ:   { ratio: 15,  name: "Johnson & Johnson",   emoji: "💊", sector: "Hlth" },
  PFE:   { ratio: 3,   name: "Pfizer",              emoji: "💉", sector: "Hlth" },
  MRK:   { ratio: 10,  name: "Merck",               emoji: "🧬", sector: "Hlth" },
  LLY:   { ratio: 56,  name: "Eli Lilly",           emoji: "🔬", sector: "Hlth" },
  AMGN:  { ratio: 30,  name: "Amgen",               emoji: "🧪", sector: "Hlth" },
  ABBV:  { ratio: 10,  name: "AbbVie",              emoji: "💊", sector: "Hlth" },
  BMY:   { ratio: 3,   name: "Bristol-Myers",       emoji: "🏥", sector: "Hlth" },
  BIIB:  { ratio: 13,  name: "Biogen",              emoji: "🧫", sector: "Hlth" },
  GILD:  { ratio: 4,   name: "Gilead",              emoji: "💉", sector: "Hlth" },
  AZN:   { ratio: 2,   name: "AstraZeneca",         emoji: "🔭", sector: "Hlth" },
  GSK:   { ratio: 4,   name: "GSK",                 emoji: "🩺", sector: "Hlth" },
  CVS:   { ratio: 15,  name: "CVS Health",          emoji: "🏥", sector: "Hlth" },
  // Energía
  XOM:   { ratio: 10,  name: "ExxonMobil",          emoji: "🛢️", sector: "Enrg" },
  CVX:   { ratio: 16,  name: "Chevron",             emoji: "⛽", sector: "Enrg" },
  BP:    { ratio: 5,   name: "BP",                  emoji: "🌊", sector: "Enrg" },
  HAL:   { ratio: 2,   name: "Halliburton",         emoji: "🔧", sector: "Enrg" },
  BKR:   { ratio: 7,   name: "Baker Hughes",        emoji: "⛏️", sector: "Enrg" },
  FSLR:  { ratio: 18,  name: "First Solar",         emoji: "☀️", sector: "Enrg" },
  EQNR:  { ratio: 6,   name: "Equinor",             emoji: "🌿", sector: "Enrg" },
  // Materiales / Minería / Oro
  GOLD:  { ratio: 2,   name: "Barrick Gold",        emoji: "🥇", sector: "Mat"  },
  AEM:   { ratio: 6,   name: "Agnico Eagle",        emoji: "⛏️", sector: "Mat"  },
  GFI:   { ratio: 1,   name: "Gold Fields",         emoji: "🏅", sector: "Mat"  },
  HMY:   { ratio: 1,   name: "Harmony Gold",        emoji: "🌟", sector: "Mat"  },
  FCX:   { ratio: 3,   name: "Freeport-McMoRan",    emoji: "🔩", sector: "Mat"  },
  BHP:   { ratio: 2,   name: "BHP Group",           emoji: "⚒️", sector: "Mat"  },
  BAS:   { ratio: 2,   name: "BASF",                emoji: "🧴", sector: "Mat"  },
  DD:    { ratio: 5,   name: "DuPont",              emoji: "🧪", sector: "Mat"  },
  DOW:   { ratio: 6,   name: "Dow Inc",             emoji: "🏭", sector: "Mat"  },
  // Latam / Argentina
  MELI:  { ratio: 3,   name: "MercadoLibre",        emoji: "🛍️", sector: "LATM" },
  BABA:  { ratio: 9,   name: "Alibaba",             emoji: "🛒", sector: "LATM" },
  GLOB:  { ratio: 18,  name: "Globant",             emoji: "💻", sector: "LATM" },
  DESP:  { ratio: 1,   name: "Despegar",            emoji: "✈️", sector: "LATM" },
  BIOX:  { ratio: 1,   name: "Bioceres",            emoji: "🌱", sector: "LATM" },
  CAAP:  { ratio: 4,   name: "Corp America Airports",emoji:"🏢", sector: "LATM", ratioInverse: true },
  ARCO:  { ratio: 2,   name: "Arcos Dorados",       emoji: "🍟", sector: "LATM", ratioInverse: true },
  // ETFs
  SPY:   { ratio: 30,  name: "S&P 500 ETF",         emoji: "📊", sector: "ETF"  },
  QQQ:   { ratio: 35,  name: "Nasdaq 100 ETF",      emoji: "📈", sector: "ETF"  },
  IBIT:  { ratio: 10,  name: "iShares Bitcoin",     emoji: "₿",  sector: "ETF"  },
  FXI:   { ratio: 5,   name: "iShares China",       emoji: "🇨🇳", sector: "ETF"  },
  IBB:   { ratio: 27,  name: "Nasdaq Biotech ETF",  emoji: "🔬", sector: "ETF"  },
  // Otros populares con ratio inverso
  ABEV:  { ratio: 3,   name: "Ambev",               emoji: "🍺", sector: "LATM", ratioInverse: true },
  SAN:   { ratio: 4,   name: "Santander",           emoji: "🏦", sector: "Fin",  ratioInverse: true },
  BRFS:  { ratio: 3,   name: "BRF",                 emoji: "🍗", sector: "LATM", ratioInverse: true },
  GGB:   { ratio: 4,   name: "Gerdau",              emoji: "⚙️", sector: "LATM", ratioInverse: true },
  SBS:   { ratio: 2,   name: "Sabesp",              emoji: "💧", sector: "LATM", ratioInverse: true },
  SID:   { ratio: 8,   name: "CSN Siderúrgica",     emoji: "🔩", sector: "LATM", ratioInverse: true },
  EBR:   { ratio: 4,   name: "Eletrobras",          emoji: "⚡", sector: "LATM", ratioInverse: true },
  // Disn/Media
  DIS:   { ratio: 10,  name: "Disney",              emoji: "🏰", sector: "Med"  },
  NFLX:  { ratio: 15,  name: "Netflix",             emoji: "🎬", sector: "Med"  },
  BKNG:  { ratio: 700, name: "Booking Holdings",    emoji: "🏨", sector: "Med"  },
};

const PROXY = "https://api.allorigins.win/get?url=";

async function fetchPrice(ticker) {
  try {
    const url = encodeURIComponent(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
    );
    const res = await fetch(`${PROXY}${url}`);
    const outer = await res.json();
    const data = JSON.parse(outer.contents);
    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    const change = ((price - prev) / prev) * 100;
    return { price, change };
  } catch {
    return null;
  }
}

async function fetchDolarCCL() {
  try {
    const url = encodeURIComponent("https://dolarapi.com/v1/dolares/contadoconliqui");
    const res = await fetch(`${PROXY}${url}`);
    const outer = await res.json();
    const data = JSON.parse(outer.contents);
    return data.venta || data.compra || 1200;
  } catch {
    return null;
  }
}

const SECTOR_COLORS = {
  Tech: "#4da6ff", Auto: "#ffd700", Fin: "#00c896", Cons: "#ff9f43",
  Hlth: "#ff6b9d", Enrg: "#f8b739", Mat: "#c8a96e", LATM: "#48dbfb",
  ETF: "#a29bfe", Med: "#fd79a8", Ind: "#81ecec",
};

export default function CEDEARDashboard() {
  const [holdings, setHoldings] = useState({});
  const [prices, setPrices] = useState({});
  const [dolarCCL, setDolarCCL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [editTicker, setEditTicker] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [newTicker, setNewTicker] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [customRatio, setCustomRatio] = useState("");
  const [customName, setCustomName] = useState("");
  const [extraTickers, setExtraTickers] = useState({});
  const [sortBy, setSortBy] = useState("value");
  const [currency, setCurrency] = useState("both");
  const [filterSector, setFilterSector] = useState("ALL");

  const allDB = { ...CEDEAR_DB, ...extraTickers };

  const getInfo = (ticker) => allDB[ticker] || { ratio: 1, name: ticker, emoji: "📈", sector: "?" };

  // Cálculo correcto según si el ratio es normal o inverso
  // Normal (ej AAPL ratio:20): 1 acción = 20 CEDEARs → valor = (qty / ratio) * price
  // Inverso (ej ABEV ratio:3): 1 CEDEAR = 3 acciones → valor = qty * ratio * price  
  const getValueUSD = (ticker) => {
    const info = getInfo(ticker);
    const qty = holdings[ticker] || 0;
    const price = prices[ticker]?.price || 0;
    if (info.ratioInverse) return qty * info.ratio * price;
    return (qty / info.ratio) * price;
  };

  const getValueARS = (ticker) => getValueUSD(ticker) * (dolarCCL || 0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const tickers = Object.keys(holdings);
    if (tickers.length === 0) { setLoading(false); return; }
    const [ccl, ...priceResults] = await Promise.all([
      fetchDolarCCL(),
      ...tickers.map(t => fetchPrice(t))
    ]);
    if (ccl) setDolarCCL(ccl);
    const newPrices = {};
    tickers.forEach((t, i) => { if (priceResults[i]) newPrices[t] = priceResults[i]; });
    setPrices(newPrices);
    setLastUpdate(new Date());
    setLoading(false);
  }, [holdings]);

  useEffect(() => { if (Object.keys(holdings).length > 0) fetchAll(); }, [holdings]);
  useEffect(() => { const iv = setInterval(fetchAll, 60000); return () => clearInterval(iv); }, [fetchAll]);

  const totalUSD = Object.keys(holdings).reduce((s, t) => s + getValueUSD(t), 0);
  const totalARS = totalUSD * (dolarCCL || 0);
  const totalChange = Object.keys(holdings).reduce((s, t) => {
    const w = totalUSD > 0 ? getValueUSD(t) / totalUSD : 0;
    return s + (prices[t]?.change || 0) * w;
  }, 0);

  const sectors = [...new Set(Object.keys(holdings).map(t => getInfo(t).sector))].filter(Boolean);

  const filteredHoldings = Object.keys(holdings).filter(t =>
    filterSector === "ALL" || getInfo(t).sector === filterSector
  );

  const sortedHoldings = filteredHoldings.sort((a, b) => {
    if (sortBy === "value") return getValueUSD(b) - getValueUSD(a);
    if (sortBy === "change") return (prices[b]?.change || 0) - (prices[a]?.change || 0);
    if (sortBy === "name") return a.localeCompare(b);
    return 0;
  });

  const handleAdd = () => {
    const ticker = newTicker.toUpperCase().trim();
    if (!ticker || !newAmount || Number(newAmount) <= 0) return;
    if (!allDB[ticker] && customRatio) {
      setExtraTickers(prev => ({
        ...prev,
        [ticker]: { ratio: Number(customRatio), name: customName || ticker, emoji: "📈", sector: "?" }
      }));
    }
    setHoldings(prev => ({ ...prev, [ticker]: Number(newAmount) }));
    setNewTicker(""); setNewAmount(""); setCustomRatio(""); setCustomName(""); setAddMode(false);
  };

  const handleEdit = (ticker) => {
    setHoldings(prev => ({ ...prev, [ticker]: Number(editAmount) }));
    setEditTicker(null);
  };

  const handleRemove = (ticker) => setHoldings(prev => { const n = { ...prev }; delete n[ticker]; return n; });

  const fmtUSD = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtARS = (n) => `$${Math.round(n).toLocaleString("es-AR")}`;
  const fmtPct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
  const pctColor = (n) => n >= 0 ? "#00c896" : "#ff4d6d";

  const matchedTicker = newTicker && allDB[newTicker.toUpperCase()];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070b14",
      fontFamily: "'Courier New', monospace",
      color: "#c8d8f0",
      backgroundImage: "radial-gradient(ellipse at 15% 40%, rgba(0,80,200,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 15%, rgba(0,200,150,0.04) 0%, transparent 55%)",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(0,200,150,0.15)",
        padding: "18px 24px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#00c896", marginBottom: 2, textTransform: "uppercase" }}>◆ Comafi Ratios · DolarAPI CCL</div>
          <div style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 2, color: "#e0f0ff" }}>CEDEAR Dashboard</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {lastUpdate && <div style={{ fontSize: 9, color: "#3a4a6a", letterSpacing: 1 }}>
            SYNC {lastUpdate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </div>}
          <button onClick={fetchAll} disabled={loading || Object.keys(holdings).length === 0}
            style={{
              background: "rgba(0,200,150,0.12)", border: "1px solid rgba(0,200,150,0.35)",
              color: loading ? "#2a6a5a" : "#00c896", padding: "5px 14px", cursor: "pointer",
              fontSize: 10, letterSpacing: 2, borderRadius: 2,
            }}>
            {loading ? "···" : "↺ SYNC"}
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 24px", maxWidth: 920, margin: "0 auto" }}>

        {/* Totals strip */}
        {Object.keys(holdings).length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "TOTAL USD", value: fmtUSD(totalUSD), color: "#00c896" },
              { label: "TOTAL ARS", value: fmtARS(totalARS), color: "#4da6ff" },
              { label: "PERF HOY", value: fmtPct(totalChange), color: pctColor(totalChange) },
              { label: "CCL VENTA", value: dolarCCL ? fmtARS(dolarCCL) : "—", color: "#ffd700" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.025)", border: `1px solid ${color}18`,
                borderTop: `2px solid ${color}`, padding: "12px 14px", borderRadius: 2,
              }}>
                <div style={{ fontSize: 8, letterSpacing: 3, color: "#3a4a6a", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: "bold", color, letterSpacing: 1 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {Object.keys(holdings).length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 8, color: "#2a3a5a", letterSpacing: 2 }}>ORDEN</span>
            {["value", "change", "name"].map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                background: sortBy === s ? "rgba(0,200,150,0.12)" : "transparent",
                border: `1px solid ${sortBy === s ? "rgba(0,200,150,0.4)" : "rgba(255,255,255,0.06)"}`,
                color: sortBy === s ? "#00c896" : "#3a4a6a", padding: "2px 9px",
                cursor: "pointer", fontSize: 8, letterSpacing: 2, borderRadius: 2,
              }}>{s.toUpperCase()}</button>
            ))}
            <span style={{ fontSize: 8, color: "#2a3a5a", letterSpacing: 2, marginLeft: 6 }}>VER</span>
            {["both", "usd", "ars"].map(c => (
              <button key={c} onClick={() => setCurrency(c)} style={{
                background: currency === c ? "rgba(77,166,255,0.12)" : "transparent",
                border: `1px solid ${currency === c ? "rgba(77,166,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                color: currency === c ? "#4da6ff" : "#3a4a6a", padding: "2px 9px",
                cursor: "pointer", fontSize: 8, letterSpacing: 2, borderRadius: 2,
              }}>{c.toUpperCase()}</button>
            ))}
            {sectors.length > 1 && <>
              <span style={{ fontSize: 8, color: "#2a3a5a", letterSpacing: 2, marginLeft: 6 }}>SECTOR</span>
              <button onClick={() => setFilterSector("ALL")} style={{
                background: filterSector === "ALL" ? "rgba(255,255,255,0.08)" : "transparent",
                border: `1px solid ${filterSector === "ALL" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                color: filterSector === "ALL" ? "#c8d8f0" : "#3a4a6a", padding: "2px 9px",
                cursor: "pointer", fontSize: 8, letterSpacing: 2, borderRadius: 2,
              }}>ALL</button>
              {sectors.map(s => (
                <button key={s} onClick={() => setFilterSector(s)} style={{
                  background: filterSector === s ? `${SECTOR_COLORS[s]}18` : "transparent",
                  border: `1px solid ${filterSector === s ? `${SECTOR_COLORS[s]}55` : "rgba(255,255,255,0.06)"}`,
                  color: filterSector === s ? SECTOR_COLORS[s] : "#3a4a6a", padding: "2px 9px",
                  cursor: "pointer", fontSize: 8, letterSpacing: 2, borderRadius: 2,
                }}>{s}</button>
              ))}
            </>}
          </div>
        )}

        {/* Holdings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {sortedHoldings.map(ticker => {
            const info = getInfo(ticker);
            const qty = holdings[ticker];
            const priceData = prices[ticker];
            const valueUSD = getValueUSD(ticker);
            const valueARS = getValueARS(ticker);
            const chg = priceData?.change || 0;
            const chgColor = pctColor(chg);
            const weight = totalUSD > 0 ? (valueUSD / totalUSD) * 100 : 0;
            const sectorColor = SECTOR_COLORS[info.sector] || "#5a6a8a";

            return (
              <div key={ticker} style={{
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderLeft: `3px solid ${chg >= 0 ? "#00c896" : "#ff4d6d"}`,
                padding: "13px 15px",
                borderRadius: 2,
                position: "relative", overflow: "hidden",
              }}>
                {/* weight bar */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0,
                  width: `${weight}%`, height: 2,
                  background: `${sectorColor}44`, transition: "width 0.6s ease",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                  {/* Left */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
                    <span style={{ fontSize: 18 }}>{info.emoji}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: "bold", color: "#e0f0ff", letterSpacing: 1 }}>{ticker}</span>
                        <span style={{
                          fontSize: 7, color: sectorColor, border: `1px solid ${sectorColor}44`,
                          padding: "1px 5px", borderRadius: 2, letterSpacing: 1,
                        }}>{info.sector}</span>
                      </div>
                      <div style={{ fontSize: 9, color: "#3a4a6a", marginTop: 1 }}>{info.name}</div>
                    </div>
                  </div>

                  {/* Center: qty, ratio, price */}
                  <div style={{ textAlign: "center", flex: 1 }}>
                    {editTicker === ticker ? (
                      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                        <input autoFocus type="number" value={editAmount}
                          onChange={e => setEditAmount(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleEdit(ticker)}
                          style={{
                            width: 70, background: "rgba(0,0,0,0.6)", border: "1px solid #4da6ff",
                            color: "#e0f0ff", padding: "3px 6px", fontSize: 11, borderRadius: 2, fontFamily: "inherit",
                          }}
                        />
                        <button onClick={() => handleEdit(ticker)} style={{ background: "rgba(0,200,150,0.2)", border: "1px solid #00c896", color: "#00c896", padding: "3px 7px", cursor: "pointer", fontSize: 9, borderRadius: 2 }}>✓</button>
                        <button onClick={() => setEditTicker(null)} style={{ background: "transparent", border: "1px solid #3a4a6a", color: "#3a4a6a", padding: "3px 7px", cursor: "pointer", fontSize: 9, borderRadius: 2 }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 11, color: "#5a7a9a" }}>{qty} CEDs</div>
                        <div style={{ fontSize: 8, color: "#2a3a5a" }}>
                          {info.ratioInverse ? `1 CED = ${info.ratio} acc` : `${info.ratio} CEDs = 1 acc`}
                        </div>
                        {priceData && (
                          <div style={{ fontSize: 9, color: "#2a4a6a" }}>
                            ${priceData.price.toFixed(2)} <span style={{ color: chgColor }}>{fmtPct(chg)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right: values + weight */}
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    {priceData ? (<>
                      {(currency === "usd" || currency === "both") && (
                        <div style={{ fontSize: 14, fontWeight: "bold", color: "#00c896", letterSpacing: 1 }}>
                          {fmtUSD(valueUSD)}
                        </div>
                      )}
                      {(currency === "ars" || currency === "both") && (
                        <div style={{ fontSize: currency === "both" ? 10 : 14, color: currency === "both" ? "#2a4a6a" : "#4da6ff", fontWeight: currency === "ars" ? "bold" : "normal" }}>
                          {fmtARS(valueARS)}
                        </div>
                      )}
                      <div style={{
                        fontSize: 9, color: sectorColor, marginTop: 2,
                        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4,
                      }}>
                        <div style={{ width: 28, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(weight, 100)}%`, height: "100%", background: sectorColor, borderRadius: 2 }} />
                        </div>
                        {weight.toFixed(1)}%
                      </div>
                    </>) : (
                      <div style={{ fontSize: 9, color: "#1a2a4a" }}>sin precio</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 3, marginLeft: 8 }}>
                    <button onClick={() => { setEditTicker(ticker); setEditAmount(String(qty)); }}
                      style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "#3a4a6a", padding: "4px 7px", cursor: "pointer", fontSize: 9, borderRadius: 2 }}>✎</button>
                    <button onClick={() => handleRemove(ticker)}
                      style={{ background: "transparent", border: "1px solid rgba(255,60,80,0.15)", color: "#5a2a3a", padding: "4px 7px", cursor: "pointer", fontSize: 9, borderRadius: 2 }}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add form */}
        {addMode ? (
          <div style={{
            marginTop: 10, background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(0,200,150,0.25)", padding: 16, borderRadius: 2,
          }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: "#00c896", marginBottom: 12 }}>+ AGREGAR CEDEAR</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 8, color: "#3a4a6a", marginBottom: 4, letterSpacing: 1 }}>TICKER</div>
                <input list="cedear-list" placeholder="AAPL, TSLA…"
                  value={newTicker} onChange={e => setNewTicker(e.target.value.toUpperCase())}
                  style={{ width: 110, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0f0ff", padding: "6px 10px", fontSize: 12, borderRadius: 2, fontFamily: "inherit" }}
                />
                <datalist id="cedear-list">
                  {Object.entries(CEDEAR_DB).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                </datalist>
              </div>
              <div>
                <div style={{ fontSize: 8, color: "#3a4a6a", marginBottom: 4, letterSpacing: 1 }}>NOMINALES</div>
                <input type="number" placeholder="100" value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  style={{ width: 90, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0f0ff", padding: "6px 10px", fontSize: 12, borderRadius: 2, fontFamily: "inherit" }}
                />
              </div>
              {newTicker && !matchedTicker && (
                <>
                  <div>
                    <div style={{ fontSize: 8, color: "#ffd700", marginBottom: 4, letterSpacing: 1 }}>RATIO</div>
                    <input type="number" placeholder="10" value={customRatio} onChange={e => setCustomRatio(e.target.value)}
                      style={{ width: 70, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,215,0,0.3)", color: "#e0f0ff", padding: "6px 10px", fontSize: 12, borderRadius: 2, fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: "#ffd700", marginBottom: 4, letterSpacing: 1 }}>NOMBRE</div>
                    <input placeholder="Empresa" value={customName} onChange={e => setCustomName(e.target.value)}
                      style={{ width: 110, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,215,0,0.3)", color: "#e0f0ff", padding: "6px 10px", fontSize: 12, borderRadius: 2, fontFamily: "inherit" }}
                    />
                  </div>
                </>
              )}
              <button onClick={handleAdd} style={{ background: "rgba(0,200,150,0.15)", border: "1px solid rgba(0,200,150,0.45)", color: "#00c896", padding: "7px 18px", cursor: "pointer", fontSize: 10, letterSpacing: 2, borderRadius: 2 }}>AGREGAR</button>
              <button onClick={() => { setAddMode(false); setNewTicker(""); setNewAmount(""); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#3a4a6a", padding: "7px 14px", cursor: "pointer", fontSize: 10, borderRadius: 2 }}>cancelar</button>
            </div>
            {matchedTicker && (
              <div style={{ fontSize: 8, color: "#00c896", marginTop: 8, letterSpacing: 1 }}>
                ✓ {matchedTicker.name} · {matchedTicker.ratioInverse ? `1 CEDEAR = ${matchedTicker.ratio} acciones` : `${matchedTicker.ratio} CEDEARs = 1 acción`} · Fuente: Comafi
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setAddMode(true)} style={{
            marginTop: 10, width: "100%", background: "rgba(255,255,255,0.015)",
            border: "1px dashed rgba(0,200,150,0.15)", color: "#1a3a2a",
            padding: "11px", cursor: "pointer", fontSize: 10, letterSpacing: 3, borderRadius: 2,
          }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(0,200,150,0.4)"; e.target.style.color = "#00c896"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(0,200,150,0.15)"; e.target.style.color = "#1a3a2a"; }}
          >+ AGREGAR CEDEAR</button>
        )}

        {Object.keys(holdings).length === 0 && !addMode && (
          <div style={{ textAlign: "center", padding: "52px 0", color: "#1a2a4a" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
            <div style={{ fontSize: 10, letterSpacing: 3 }}>AGREGÁ TUS CEDEARs PARA EMPEZAR</div>
            <div style={{ fontSize: 8, color: "#0f1a2a", marginTop: 6, letterSpacing: 1 }}>+200 tickers disponibles · ratios oficiales Comafi</div>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.03)", fontSize: 8, color: "#0f1a2a", letterSpacing: 1, textAlign: "center" }}>
          PRECIOS: YAHOO FINANCE · CCL: DOLARAPI · RATIOS: COMAFI 2025 · ACTUALIZA CADA 60s · SOLO REFERENCIAL
        </div>
      </div>
    </div>
  );
}
