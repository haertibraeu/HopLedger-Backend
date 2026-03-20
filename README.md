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

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | see `.env.example` |
| `PORT` | Server port | `3000` |
| `API_KEY` | API key for protected endpoints (empty = no auth) | — |
| `SHOW_LOCATIONS` | Show locations in public inventory | `true` |

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + DB status |

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
