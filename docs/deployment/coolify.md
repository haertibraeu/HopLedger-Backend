# Deployment: Coolify

[Coolify](https://coolify.io) is an open-source, self-hosted PaaS (similar to Heroku / Vercel) that runs on any VPS or Raspberry Pi. It manages Docker containers, databases, and deployments for you.

## Prerequisites

- Coolify v4 installed on your server ([installation guide](https://coolify.io/docs/installation))
- Your server accessible via SSH from Coolify

## Deploy via Docker Compose

### 1. Create a new project

In the Coolify dashboard: **Projects → New Project** → give it a name (e.g. `hopledger`).

### 2. Add a new resource

Click **+ New Resource → Docker Compose**.

### 3. Configure the source

Choose **Raw Compose** and paste:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: hopledger
      POSTGRES_PASSWORD: ${DB_PASSWORD}
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
    environment:
      DATABASE_URL: postgresql://hopledger:${DB_PASSWORD}@db:5432/hopledger?schema=public
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

In the **Environment Variables** section add:

| Variable | Value |
|----------|-------|
| `DB_PASSWORD` | A strong database password |
| `API_KEY` | A strong secret (`openssl rand -hex 32`) |
| `SHOW_LOCATIONS` | `true` or `false` |

### 5. Configure the domain

In the **Domains** tab, set your domain or subdomain (e.g. `hopledger.example.com`). Coolify provisions a TLS certificate automatically via Let's Encrypt.

Set the **Port** to `3000`.

### 6. Deploy

Click **Deploy**. Coolify pulls the image, starts the containers, and configures the reverse proxy.

### 7. Verify

```bash
curl https://hopledger.example.com/api/health
```

## Auto-deploy on New Image

Enable **Webhooks** in the resource settings. Trigger a redeploy from your CI pipeline (e.g. GitHub Actions) after a new image is pushed:

```bash
curl -X GET "https://<coolify-host>/api/v1/deploy?uuid=<resource-uuid>&force=false" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"
```

## Seed Default Categories

Open **Containers → backend → Terminal** in Coolify and run:

```bash
npx tsx prisma/seed.ts
```
