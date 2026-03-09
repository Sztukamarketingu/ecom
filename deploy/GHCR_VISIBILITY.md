# Widoczność obrazu ghcr.io/sztukamarketingu/ecom

## Automatycznie (workflow)

Workflow próbuje ustawić pakiet jako publiczny po pushu. Jeśli to nie zadziała (np. ograniczenia API dla org), zrób to ręcznie.

## Ręcznie – ustaw pakiet jako publiczny

1. Wejdź na: **https://github.com/orgs/Sztukamarketingu/packages**
2. Znajdź pakiet **ecom** (obraz kontenera)
3. Kliknij w pakiet → **Package settings**
4. W sekcji **Danger Zone** → **Change visibility** → wybierz **Public**

## Alternatywa: PAT do pull (jeśli pakiet zostanie prywatny)

Jeśli obraz ma zostać prywatny, w Docker Managerze na VPS dodaj logowanie do ghcr.io:

1. Utwórz PAT: GitHub → Settings → Developer settings → Personal access tokens
2. Uprawnienia: `read:packages`
3. Na VPS: `docker login ghcr.io -u Sztukamarketingu -p <PAT>`
