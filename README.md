# Wind Homes — Fullstack Booking Assessment

Implementación con Django REST + React (Vite + TypeScript). Las especificaciones completas se encuentran
bajo `docs/` (enlace simbólico a `~/works/wh_fullstack/docs/`).

Iteración actual: **0 — Bootstrap**. Ver `docs/iterations.md`.

## Inicio rápido para desarrollo local

```bash
# 1. Postgres
docker compose -f docker-compose.dev.yml up -d postgres

# 2. Backend
cd backend
cp .env.example .env                  
python3 -m venv .venv                 
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver 8000

# 3. Frontend (nueva terminal)
cd frontend
npm install
npm run dev                           
```

## Comandos útiles

```bash
# Tests del Backend
cd backend && .venv/bin/pytest

# Build / verificación de tipos del Frontend
cd frontend && npm run build
cd frontend && npm run typecheck
```

## Estructura

```text
backend/        Django + DRF (configuración dividida: base/dev/prod)
frontend/       Vite + React 18 + TS
docs/           Manual de especificaciones (enlace simbólico)
docker-compose.dev.yml   Solo Postgres local
fonts/          Acumin.otf + Helvetica.otf (del resumen, no redistribuido)
```

Decisiones y especificaciones completas: `docs/inferred/decisions.md` e
`docs/iterations.md`.