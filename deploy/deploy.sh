#!/bin/bash
# Deploy quiz e-commerce na subdomenę ecom
set -e

cd "$(dirname "$0")/.."

echo "🔨 Budowanie aplikacji..."
cd app
npm ci
npm run build
cd ..

echo "📦 Budowanie obrazu Docker..."
docker build -t ecom-quiz:latest \
  --build-arg VITE_N8N_WEBHOOK_URL=https://n8n.sztukaautomatyzacji.pl/webhook/ecommerce-quiz \
  --build-arg VITE_LLM_PROXY_URL=https://n8n.sztukaautomatyzacji.pl/webhook/ecommerce-llm-proxy \
  --build-arg VITE_TIDYCAL_PATH=sztukamarketingu/darmowa-sesja-doradcza \
  --build-arg VITE_APP_TITLE="Diagnoza E-commerce" \
  --build-arg VITE_REPORT_LANGUAGE=pl \
  --build-arg VITE_REPORT_ONLY_MODE=true \
  -f deploy/Dockerfile .

echo "✅ Gotowe. Uruchom:"
echo "   docker run -d -p 3000:80 --name ecom-quiz ecom-quiz:latest"
echo ""
echo "Lub użyj docker-compose:"
echo "   cd deploy && docker compose up -d"
