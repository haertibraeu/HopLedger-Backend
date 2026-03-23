# Deployment: Docker Compose

Runs the backend and a PostgreSQL database together on any machine with Docker installed.

## Prerequisites

- Docker and Docker Compose v2

## Steps

### 1. Clone the repository

```bash
git clone https://github.com/HAERTIBRAEU/HopLedger-Backend.git
cd HopLedger-Backend
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at least:

```env
API_KEY=your-strong-secret          # leave empty to disable auth
SHOW_LOCATIONS=true
```

### 3. Start the stack

```bash
docker compose up -d
```

This starts two containers:

| Container | Image | Port |
|-----------|-------|------|
| `db` | `postgres:16-alpine` | `5432` |
| `backend` | built from `Dockerfile` | `3000` |

Database migrations run automatically on startup.

### 4. Verify

```bash
curl http://localhost:3000/api/health
```

## Useful Commands

```bash
# View logs
docker compose logs -f backend

# Stop the stack
docker compose down

# Stop and remove volumes (wipes database!)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

## Seed Default Categories

Run once after the first deploy if you need default expense categories:

```bash
docker exec -it hopledger-backend npx tsx prisma/seed.ts
```

## Updating

```bash
docker compose pull        # pull latest images (if using a registry image)
docker compose up -d       # recreate containers
```

Or if building locally:

```bash
docker compose up -d --build
```
