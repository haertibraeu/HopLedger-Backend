# Deployment: Railway

[Railway](https://railway.app) is a managed cloud platform that can deploy Docker images and provision a PostgreSQL database with minimal configuration.

## Prerequisites

- A Railway account ([railway.app](https://railway.app))
- The Docker image published to GHCR: `ghcr.io/haertibraeu/hopledger-backend:latest`

## Steps

### 1. Create a new project

In the Railway dashboard: **New Project → Empty project**.

### 2. Add a PostgreSQL database

Click **+ New → Database → PostgreSQL**. Railway provisions a managed Postgres instance and exposes `DATABASE_URL` as a variable automatically.

### 3. Add the backend service

Click **+ New → Docker Image** and enter:

```
ghcr.io/haertibraeu/hopledger-backend:latest
```

### 4. Set environment variables

In the backend service: **Variables** tab → add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Reference the Postgres service: `${{Postgres.DATABASE_URL}}` |
| `PORT` | `3000` |
| `API_KEY` | A strong secret (`openssl rand -hex 32`) |
| `SHOW_LOCATIONS` | `true` or `false` |

### 5. Configure networking

In the backend service: **Settings → Networking** → click **Generate Domain**. Railway creates a public HTTPS URL for your service.

Set the **Port** to `3000`.

### 6. Deploy

Click **Deploy**. Railway pulls the image, injects the environment variables, and starts the container.

### 7. Verify

```bash
curl https://<your-service>.up.railway.app/api/health
```

## Auto-deploy

Enable **Auto-deploy** in the service settings so Railway pulls and redeploys whenever the Docker image is updated.

To trigger redeployments from GitHub Actions after a new image push, use the Railway CLI or the redeploy webhook found under **Settings → Webhooks**.

## Seed Default Categories

Open **Service → Shell** in the Railway dashboard and run:

```bash
npx tsx prisma/seed.ts
```

## Cost

Railway offers a free trial tier. After that, usage is billed by resource consumption. For a low-traffic homelab app, costs are typically a few dollars per month.
