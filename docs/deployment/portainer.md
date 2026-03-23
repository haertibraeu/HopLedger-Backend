# Deployment: Portainer

[Portainer](https://www.portainer.io) is a web-based Docker management UI. You can deploy HopLedger Backend using a Compose stack directly from the Portainer dashboard.

## Prerequisites

- Portainer CE or BE installed (connected to your Docker host)
- Access to the Portainer web UI

## Deploy as a Stack

### 1. Open Stacks

In the Portainer sidebar: **Stacks → Add stack**

### 2. Name the stack

Give it a name, e.g. `hopledger`.

### 3. Paste the Compose definition

Select **Web editor** and paste the following:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hopledger
      POSTGRES_PASSWORD: ${DB_PASSWORD:-hopledger}
      POSTGRES_DB: hopledger
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hopledger"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  backend:
    image: ghcr.io/haertibraeu/hopledger-backend:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://hopledger:${DB_PASSWORD:-hopledger}@db:5432/hopledger?schema=public
      PORT: 3000
      API_KEY: ${API_KEY}
      SHOW_LOCATIONS: ${SHOW_LOCATIONS:-true}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pgdata:
```

### 4. Set environment variables

Scroll down to **Environment variables** and add:

| Variable | Value |
|----------|-------|
| `API_KEY` | A strong secret (`openssl rand -hex 32`) |
| `DB_PASSWORD` | A strong database password |
| `SHOW_LOCATIONS` | `true` or `false` |

### 5. Deploy

Click **Deploy the stack**. Portainer pulls the image and starts both containers.

### 6. Verify

Open a browser and navigate to `http://<your-server-ip>:3000/api/health`.

## Updating

1. In Portainer, open the stack.
2. Click **Editor**, update the image tag if needed.
3. Click **Update the stack** → Portainer pulls and recreates the containers.

Alternatively, enable **Auto-update** (Portainer BE) to automatically pull new images on a schedule.

## Seed Default Categories

```bash
# From the Portainer console or via SSH
docker exec -it <backend-container-id> npx tsx prisma/seed.ts
```

You can also run this from **Containers → hopledger-backend → Console** in Portainer.
