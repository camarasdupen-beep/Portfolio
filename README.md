# CEDEAR Dashboard 📊

Dashboard de inversiones en CEDEARs con precios en tiempo real.

## Features
- Precios en tiempo real via Yahoo Finance
- Tipo de cambio CCL via DolarAPI (actualizado cada 60s)
- Ratios oficiales de Comafi (~80 tickers)
- Valores en USD y ARS
- Peso % de cada posición en la cartera
- Filtro por sector, orden por valor/variación/nombre
- Soporte para ratios normales e inversos (ABEV, SAN, etc.)

## Setup

```bash
npm install
npm start
```

## Deploy (GitHub Pages)

```bash
npm install -D gh-pages
# Agregar en package.json: "homepage": "https://<usuario>.github.io/cedear-dashboard"
# Agregar scripts: "predeploy": "npm run build", "deploy": "gh-pages -d build"
npm run deploy
```

## Fuentes de datos
- **Precios**: Yahoo Finance (subyacente en USD)
- **CCL**: [DolarAPI](https://dolarapi.com)
- **Ratios**: [Comafi Custodia Global](https://www.comafi.com.ar/custodiaglobal/Programas-CEDEARs-2483.note.aspx)

> ⚠️ Solo referencial. No es asesoramiento financiero.
