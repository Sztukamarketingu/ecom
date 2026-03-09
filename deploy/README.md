# Deploy quizu e-commerce na subdomenę ecom

Subdomena: **ecom.aikuznia.cloud**

## Szybki start (Docker)

```bash
# Z katalogu projektu
cd deploy
docker compose up -d

# Aplikacja na http://localhost:3000
```

## Deploy na serwer

### 1. Skopiuj projekt na serwer

```bash
rsync -avz --exclude node_modules --exclude app/node_modules . user@serwer:/opt/ecom-quiz/
```

### 2. Na serwerze – build i uruchom

```bash
cd /opt/ecom-quiz/deploy
docker compose up -d --build
```

### 3. Nginx – subdomena ecom

Skopiuj konfigurację hosta:

```bash
sudo cp /opt/ecom-quiz/deploy/nginx-host.conf /etc/nginx/sites-available/ecom
sudo ln -sf /etc/nginx/sites-available/ecom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. DNS

Dodaj rekord A dla subdomeny:
```
ecom.aikuznia.cloud  →  IP twojego serwera
```

### 5. SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d ecom.aikuznia.cloud
```

## Zmienne środowiskowe (build)

Edytuj `deploy/docker-compose.yml` lub przekaż `--build-arg` przy `docker build`:

- `VITE_N8N_WEBHOOK_URL` – webhook n8n
- `VITE_LLM_PROXY_URL` – proxy LLM
- `VITE_TIDYCAL_PATH` – ścieżka TidyCal
- `VITE_REPORT_ONLY_MODE` – tryb raportu (true/false)

## Bez Docker (tylko static)

```bash
cd app
npm ci
npm run build

# Skopiuj app/dist na serwer i serwuj przez nginx
rsync -avz app/dist/ user@serwer:/var/www/ecom/
```

Użyj `deploy/nginx.conf` jako wzoru (root → `/var/www/ecom`).
