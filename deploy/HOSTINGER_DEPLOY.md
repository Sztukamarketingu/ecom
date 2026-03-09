# Deploy na Hostinger (MCP)

## 1. Konfiguracja Hostinger MCP

### Instalacja
```bash
npm install -g hostinger-api-mcp
```

### Token API
1. Zaloguj się do [hPanel Hostinger](https://hpanel.hostinger.com)
2. Ustawienia → API → Wygeneruj token
3. Skopiuj token

### Konfiguracja Cursor
W pliku `.cursor/mcp.json` (w projekcie lub globalnie `~/.cursor/mcp.json`) zamień `YOUR_HOSTINGER_API_TOKEN` na swój token:

```json
{
  "mcpServers": {
    "hostinger-api": {
      "command": "hostinger-api-mcp",
      "env": {
        "API_TOKEN": "TWÓJ_TOKEN_TUTAJ"
      }
    }
  }
}
```

**Restart Cursor** po zmianie konfiguracji.

## 2. Wymagania przed deployem

- **Domena**: ecom.aikuznia.cloud – musi być w Hostinger
- **Hosting**: Konto hostingowe z utworzoną stroną dla tej domeny

## 3. Deploy przez MCP

Gdy Hostinger MCP jest skonfigurowany, możesz poprosić asystenta:

> "Zdeployuj quiz e-commerce na Hostinger używając hosting_deployStaticWebsite"

Asystent użyje:
- **Archiwum**: `deploy/ecom-quiz-static.zip` (build z `app/dist`)
- **Domena**: ecom.aikuznia.cloud
- **Order ID**: z Twojego konta Hostinger

## 4. Ręczny build i archiwum

```bash
cd app
npm run build

cd dist
zip -r ../../deploy/ecom-quiz-static.zip .
```

## 5. Parametry hosting_deployStaticWebsite

Narzędzie wymaga m.in.:
- `domain` – domena (np. ecom.sztukamarketingu.pl)
- `orderId` – ID zamówienia hostingowego
- `archivePath` lub `archive` – ścieżka do pliku ZIP

Szczegóły: `hosting_listWebsitesV1` → lista stron i order IDs.
