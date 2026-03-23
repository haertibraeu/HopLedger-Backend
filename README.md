# HopLedger Backend

REST API for micro-brewery inventory management and split-bill accounting.

> ⚠️ **Warning: Opinionated & Over-Engineered**
>
> This project is **heavily opinionated**, **over-engineered**, and **vibe-coded**. It is **not localized** and **not safe for production use** at all. Use at your own risk!


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
| [RunTipi](docs/deployment/runtipi.md) | One-click install on a RunTipi homelab |
| [Coolify](docs/deployment/coolify.md) | Self-hosted PaaS (Raspberry Pi / VPS) |
| [Portainer](docs/deployment/portainer.md) | Docker GUI-based deployment |
| [Railway](docs/deployment/railway.md) | Managed cloud platform |
| [Fly.io](docs/deployment/fly-io.md) | Global edge cloud platform |
| [Bare Metal / VPS](docs/deployment/bare-metal.md) | Direct Node.js with systemd |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | see `.env.example` |
| `PORT` | Server port | `3000` |
| `API_KEY` | API key for protected endpoints (empty = no auth) | — |
| `SHOW_LOCATIONS` | Show locations in public inventory | `true` |

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
