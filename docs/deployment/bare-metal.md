# Deployment: Bare Metal / VPS

Deploy directly on a Linux server (VPS, Raspberry Pi OS, Ubuntu, etc.) without Docker. The application is managed by `systemd` and connects to a locally installed PostgreSQL instance.

## Prerequisites

- A Linux server with `sudo` access
- Node.js 20+ installed ([nodesource setup](https://github.com/nodesource/distributions))
- PostgreSQL 14+ installed

## Steps

### 1. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Set up PostgreSQL

```bash
sudo apt-get install -y postgresql
sudo -u postgres psql <<EOF
CREATE USER hopledger WITH PASSWORD 'changeme';
CREATE DATABASE hopledger OWNER hopledger;
EOF
```

### 3. Clone and build the application

```bash
cd /opt
sudo git clone https://github.com/HAERTIBRAEU/HopLedger-Backend.git hopledger
sudo chown -R $USER:$USER /opt/hopledger
cd /opt/hopledger

npm ci --omit=dev
npm run build
```

### 4. Create the environment file

```bash
cp .env.example .env
```

Edit `/opt/hopledger/.env`:

```env
DATABASE_URL=postgresql://hopledger:changeme@localhost:5432/hopledger?schema=public
PORT=3000
API_KEY=your-strong-secret
SHOW_LOCATIONS=true
```

### 5. Run database migrations

```bash
npx prisma migrate deploy
```

### 6. Create a systemd service

```bash
sudo nano /etc/systemd/system/hopledger.service
```

Paste:

```ini
[Unit]
Description=HopLedger Backend
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/hopledger
EnvironmentFile=/opt/hopledger/.env
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 7. Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable hopledger
sudo systemctl start hopledger
```

### 8. Verify

```bash
sudo systemctl status hopledger
curl http://localhost:3000/api/health
```

## Reverse Proxy with Nginx (optional)

Install Nginx and create a site config:

```bash
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/hopledger
```

```nginx
server {
    listen 80;
    server_name hopledger.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hopledger /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Add TLS with Certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d hopledger.example.com
```

## Seed Default Categories

```bash
cd /opt/hopledger && npx tsx prisma/seed.ts
```

## Updating

```bash
cd /opt/hopledger
git pull
npm ci --omit=dev
npm run build
npx prisma migrate deploy
sudo systemctl restart hopledger
```
