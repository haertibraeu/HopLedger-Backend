# HopLedger Backend

REST API backend for **HopLedger** — a micro-brewery inventory and accounting app for small brewing collectives.

## Features

- 🍺 Track beers, containers, and locations
- 👥 Manage multiple brewers with a shared ledger
- 💰 Automatic accounting on sales, self-consumption and container returns
- 🏷️ Categorised expense entries
- 📦 Public inventory endpoint (no auth required)

## API Key

Set the **API Key** field to a strong random secret. Configure the same value in the Android app under **Settings → API Key**. Leave empty to run without authentication (local/trusted networks only).

## After Installation

The backend applies database migrations automatically on startup. No manual setup required.

Public inventory is available (no auth) at:
```
http://<your-tipi-ip>:<port>/api/public/inventory
```
