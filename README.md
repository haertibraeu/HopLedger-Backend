# HopLedger Backend

REST API for micro-brewery inventory management and split-bill accounting.

> ⚠️ **Warning: Opinionated & Over-Engineered**
>
> This project is **heavily opinionated**, **over-engineered**, and **vibe-coded**. It is **not localized** and **not safe for production use** at all. Use at your own risk!

## Design Philosophy

HopLedger is **container-centric**: the physical container (bottle, keg, etc.) is the central unit of work, not the beer inside it. This has a few important consequences:

- **Prices live on `ContainerType`, not on `Beer`.** A "0.5 L Bottle" has a fixed selling price, internal (self-consumption) price, and deposit fee — regardless of which beer is inside. This reflects how a small brewery actually operates: the bottle format determines the price, not the recipe.
- **Actions operate on containers.** Selling, self-consuming, and returning are all container operations that move, empty, and account for a container in a single transaction.
- **Split-the-bills accounting, not double-entry.** Brewer balances are relative to the group average — like Splid or Splitwise. This keeps things simple for a small group of brewers sharing costs and revenue.
- **No local database on the Android app.** All state lives on the backend. The app is a thin client that fetches everything from the API and persists only the backend URL and API key.


## Tech Stack

- **Runtime:** Node.js + Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Simple API key (`X-API-Key` header)

## Local Development

```bash
# 1. Copy env file and adjust values
cp .env.example .env

# 2. Start PostgreSQL
docker compose up -d db

# 3. Install dependencies
npm install

# 4. Run migrations
npx prisma migrate dev

# 5. Start dev server
npm run dev
```

The server runs at `http://localhost:3000`. Check health: `GET /api/health`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled server |
| `npm test` | Run tests |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |

## Deployment

A multi-arch Docker image (`linux/amd64` + `linux/arm64`) is automatically built and published to GitHub Container Registry on every push to `main`:

```
ghcr.io/haertibraeu/hopledger-backend:latest
```

Choose a deployment method:

| Guide | Description |
|-------|-------------|
| [Docker Compose](docs/deployment/docker-compose.md) | Single-server, full stack via Compose |
| [Runtipi](docs/deployment/runtipi.md) | One-click install on a Runtipi homelab |
| [Bare Metal / VPS](docs/deployment/bare-metal.md) | Direct Node.js with systemd |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | see `.env.example` |
| `PORT` | Server port | `3000` |
| `API_KEY` | API key for protected endpoints (empty = no auth) | — |
| `SHOW_LOCATIONS` | Show locations in public inventory | `true` |
| `WEBDAV_URL` | WebDAV server URL for daily backups (optional) | — |
| `WEBDAV_USER` | WebDAV username (optional) | — |
| `WEBDAV_PASS` | WebDAV password (optional) | — |

## Authentication

The backend validates the `X-API-Key` HTTP header on all protected endpoints. Set `API_KEY` to a strong secret (e.g. `openssl rand -hex 32`). Leave it empty to disable authentication entirely (dev / trusted-network only).

## API Endpoints

### Public (no auth required)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + DB status |
| `GET` | `/api/public/inventory` | Available inventory (for website/display) |

### Brewers
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/brewers` | List all brewers |
| `GET` | `/api/brewers/:id` | Get brewer by ID |
| `POST` | `/api/brewers` | Create brewer |
| `PUT` | `/api/brewers/:id` | Update brewer |
| `DELETE` | `/api/brewers/:id` | Delete brewer |

### Beers
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/beers` | List all beers |
| `GET` | `/api/beers/:id` | Get beer by ID |
| `POST` | `/api/beers` | Create beer |
| `PUT` | `/api/beers/:id` | Update beer |
| `DELETE` | `/api/beers/:id` | Delete beer |

### Locations
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/locations` | List all (filter: `?type=customer`) |
| `GET` | `/api/locations/:id` | Get location by ID |
| `POST` | `/api/locations` | Create location |
| `PUT` | `/api/locations/:id` | Update location |
| `DELETE` | `/api/locations/:id` | Delete location |

### Container Types
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/container-types` | List all container types |
| `GET` | `/api/container-types/:id` | Get container type by ID |
| `POST` | `/api/container-types` | Create container type |
| `PUT` | `/api/container-types/:id` | Update container type |
| `DELETE` | `/api/container-types/:id` | Delete container type |

### Containers (Inventory)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/containers` | List (filter: `?locationId=&beerId=&isEmpty=&isReserved=`) |
| `GET` | `/api/containers/:id` | Get container by ID |
| `POST` | `/api/containers` | Create container |
| `DELETE` | `/api/containers/:id` | Delete container |
| `POST` | `/api/containers/:id/move` | Move to new location |
| `POST` | `/api/containers/:id/fill` | Fill with beer |
| `POST` | `/api/containers/:id/destroy-beer` | Mark as empty (beer went bad) |
| `POST` | `/api/containers/:id/reserve` | Reserve for customer |
| `POST` | `/api/containers/:id/unreserve` | Remove reservation |
| `POST` | `/api/containers/batch-fill` | Fill multiple containers at once |

### Accounting
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/accounting/balances` | Net balance per brewer |
| `GET` | `/api/accounting/entries` | List entries (filter: `?brewerId=&page=&limit=`) |
| `POST` | `/api/accounting/entries` | Create manual entry |
| `GET` | `/api/accounting/settlements` | Settlement suggestions |

### Categories
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/categories` | List all categories |
| `GET` | `/api/categories/:id` | Get category by ID |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |

### Combined Actions
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/actions/sell` | Sell container to customer |
| `POST` | `/api/actions/self-consume` | Brewer self-consumes container |
| `POST` | `/api/actions/container-return` | Customer returns container |

### Backup
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/backup/export` | Download full database as `.sqlite` file |
| `POST` | `/api/backup/import` | Restore database from `.sqlite` file (field: `backup`) |
