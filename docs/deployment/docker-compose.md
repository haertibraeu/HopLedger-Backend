# Deployment: Docker Compose

Runs the backend and a PostgreSQL database together on any machine with Docker installed.  
The backend container can either be built locally or pulled from GitHubs registry.

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
DB_PASSWORD=your-password
API_KEY=your-strong-secret          # leave empty to disable auth
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

If you don't want to build the container image locally, but you want to pull from the GitHub registry:
Comment out "build" and uncomment "image", in the docker-compose.yml.
```yaml
  backend:
    #build: .
    image: ghcr.io/haertibraeu/hopledger-backend:latest
```

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

## Seed Test Data

Run once after the first deploy if you need some dummy data:

```bash
docker exec -it hopledger-backend npx tsx prisma/test_data.ts
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
