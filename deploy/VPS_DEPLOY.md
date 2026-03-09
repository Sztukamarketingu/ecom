# Deploy na Hostinger VPS (ecom.aikuznia.cloud)

## Status

- **VPS**: KVM 4, IP 46.202.191.52
- **VM ID**: 1174852
- **Hosting**: Brak – deploy przez VPS_createNewProjectV1
- **Domena**: aikuznia.cloud

## Krok 1: Push na GitHub

```bash
cd /Users/tomaszszwecki/n8n/Vibecoding/ecommerceapp
git add -A
git commit -m "Quiz e-commerce"
git branch -M main
git remote add origin https://github.com/TWOJ_USER/ecommerceapp.git
git push -u origin main
```

*(Zamień TWOJ_USER na swój GitHub username)*

## Krok 2: DNS – subdomena ecom

W panelu DNS dla **aikuznia.cloud** dodaj rekord A:
- **Nazwa**: ecom
- **Typ**: A
- **Wartość**: 46.202.191.52

## Krok 3: Deploy przez MCP

Gdy repo jest na GitHub, poproś asystenta:

> "Zdeployuj ecom-quiz na VPS Hostinger – VPS_createNewProjectV1, virtualMachineId 1174852, project_name ecom-quiz, content = URL repo GitHub"

Parametry:
- **virtualMachineId**: 1174852
- **project_name**: ecom-quiz
- **content**: https://github.com/TWOJ_USER/ecommerceapp

## Krok 4: Reverse proxy (Traefik na VPS)

Na VPS jest Traefik. Skonfiguruj routing dla `ecom.aikuznia.cloud` → `localhost:3000` (kontener ecom-quiz). Albo użyj Caddy/nginx z auto-SSL.

## Alternatywa: hosting shared

Jeśli wykupisz hosting shared w Hostingerze, można użyć `hosting_deployStaticWebsite` z archiwum ZIP – bez VPS i bez GitHub.
