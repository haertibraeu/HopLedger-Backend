# HopLedger Backend

REST API for micro-brewery inventory management and split-bill accounting.

## Tech Stack

- **Runtime:** Node.js + Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Simple API key (`X-API-Key` header)
- **Deployment:** Docker Compose

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d db

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env

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

## Docker

```bash
# Full stack (backend + database)
docker compose up -d

# Just the database (for local dev)
docker compose up -d db
```

## Production Deployment (RunTipi on Raspberry Pi)

Every push to `main` automatically builds and publishes a multi-arch Docker image (`linux/amd64` + `linux/arm64`) to GitHub Container Registry via GitHub Actions:

```
ghcr.io/haertibraeu/hopledger-backend:latest
```

> **After the first CI run**, make the package public:  
> GitHub → your profile → Packages → `hopledger-backend` → Package settings → Change visibility → **Public**

### Adding to RunTipi

1. **Add this repo as a custom app store** in RunTipi:  
   Settings → App Stores → Add Store → `https://github.com/HAERTIBRAEU/HopLedger-Backend`

2. **Install the app** from App Store → Custom → HopLedger Backend.  
   Fill in the form fields:
   - **API Key** — a strong secret (e.g. `openssl rand -hex 32`). Leave empty to disable auth.
   - **Show Locations** — whether the public inventory endpoint includes location names.
   - The database password is auto-generated.

3. The container applies database migrations automatically on startup — no manual setup needed.

### API Key

The backend validates the `X-API-Key` HTTP header on all protected endpoints.  
The `API_KEY` environment variable (set via the RunTipi install form) holds the expected value.

- **RunTipi**: set once in the install form; update via app settings if you need to rotate it.
- **Android app**: enter the same secret under Settings → API Key.
- **Empty `API_KEY`**: disables authentication entirely (dev/trusted-network mode only).

### Categories seed

Default expense categories are not seeded automatically in production. Run once after first deploy if needed:

```bash
docker exec -it hopledger-backend npx tsx prisma/seed.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | see `.env.example` |
| `PORT` | Server port | `3000` |
| `API_KEY` | API key for protected endpoints (empty = no auth) | — |
| `SHOW_LOCATIONS` | Show locations in public inventory | `true` |

## API Endpoints

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

### Public (no auth required)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + DB status |
| `GET` | `/api/public/inventory` | Available inventory (for website/display) |
