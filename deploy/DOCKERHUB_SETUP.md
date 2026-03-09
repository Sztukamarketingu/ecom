# Deploy przez Docker Hub (obrazy publiczne)

## Krok 1: Konto Docker Hub

1. Załóż konto na https://hub.docker.com (jeśli nie masz)
2. Utwórz Access Token: Account Settings → Security → New Access Token
   - Uprawnienia: **Read, Write, Delete**
   - Skopiuj token (pokazuje się tylko raz)

## Krok 2: Sekrety w GitHub

1. Repo: https://github.com/Sztukamarketingu/ecom
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** – dodaj:
   - `DOCKERHUB_USERNAME` = twoja nazwa użytkownika Docker Hub (np. sztukamarketingu)
   - `DOCKERHUB_TOKEN` = token z kroku 1

## Krok 3: Uruchom workflow

- Zrób pusty commit i push, albo: **Actions** → **Build and push to Docker Hub** → **Run workflow**

## Krok 4: Compose na VPS

Po zakończeniu buildu użyj w Docker Managerze (zamień `TWOJ_USER` na DOCKERHUB_USERNAME):

```yaml
services:
  ecom:
    image: TWOJ_USER/ecom:latest
    restart: unless-stopped
    networks:
      - root_default
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ecom.rule=Host(`ecom.aikuznia.cloud`)"
      - "traefik.http.routers.ecom.entrypoints=websecure"
      - "traefik.http.routers.ecom.tls=true"
      - "traefik.http.routers.ecom.tls.certresolver=mytlschallenge"
      - "traefik.http.services.ecom.loadbalancer.server.port=80"
      - "traefik.docker.network=root_default"

networks:
  root_default:
    external: true
```

Obrazy na Docker Hub są publiczne – nie trzeba loginować się na VPS.
