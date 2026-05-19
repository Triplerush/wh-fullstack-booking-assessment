# Wind Homes — Fullstack Booking Assessment

Plataforma editorial de alquileres curados. Implementación fullstack con
Django REST en el backend y React (Vite, JavaScript) en el frontend. Catálogo
bilingüe (ES/EN), autenticación JWT, reservas con protección anti-doble-booking
y email de confirmación vía Brevo (HTTPS API).

## Arquitectura

```mermaid
flowchart LR
  subgraph Client["Cliente (browser)"]
    UI["React 18 + Vite (JS)<br/>TanStack Query · RHF · Zod<br/>react-i18next · Bootstrap"]
  end
  subgraph API["API"]
    DRF["Django 5 · DRF · SimpleJWT<br/>django-filter · anymail<br/>Pillow (WebP, 1200px)"]
  end
  subgraph Data["Persistencia"]
    DB[("PostgreSQL 15")]
    Media["Media local / Volumen"]
  end
  Mail["Brevo HTTPS API<br/>(django-anymail)"]

  UI -- "/api/v1 · Bearer JWT · ?lang=es|en" --> DRF
  DRF -- "psycopg" --> DB
  DRF -- "WebP" --> Media
  DRF -. "post_commit" .-> Mail
```

Versiones fijadas en `backend/requirements.txt` y `frontend/package.json`.

## Setup local

Requisitos: Python 3.11+, Node 20+, Docker, OTF de fuentes en
`frontend/src/assets/fonts/` (`Acumin.otf`, `Helvetica.otf`).

```bash
# 1. Postgres
docker compose -f docker-compose.dev.yml up -d postgres

# 2. Backend
cd backend
cp .env.example .env
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py createsuperuser
.venv/bin/python manage.py seed_data --reset --properties 24
.venv/bin/python manage.py runserver 8000

# 3. Frontend (nueva terminal)
cd frontend
npm install
npm run dev   # http://localhost:5173
```

El frontend espera `VITE_API_BASE_URL=http://localhost:8000/api/v1` (valor por
defecto). Para cambiarlo crea `frontend/.env.local`.

## Comandos útiles

```bash
# Backend
cd backend
.venv/bin/pytest                                 # suite completa
.venv/bin/python manage.py seed_data --reset --properties 24   # catálogo con fotos temáticas (Unsplash → picsum → placeholder)
.venv/bin/python manage.py createsuperuser       # admin/staff
.venv/bin/python manage.py runserver 8000

# Frontend
cd frontend
npm run dev      # servidor de desarrollo
npm run build    # bundle de producción
npm run preview  # sirve el build localmente
```

## Variables de entorno (backend)

`backend/.env.example` documenta cada variable. Las clave son:

```dotenv
DJANGO_SETTINGS_MODULE=config.settings.dev   # o config.settings.prod
SECRET_KEY=...
DATABASE_URL=postgres://wind:wind@localhost:5432/wind
ALLOWED_HOSTS=localhost,127.0.0.1
SITE_URL=                                    # https://api.tu-dominio en prod (URLs absolutas en email)

# Email
EMAIL_PROVIDER=console                       # console | brevo | smtp
BREVO_API_KEY=                               # solo si EMAIL_PROVIDER=brevo
DEFAULT_FROM_EMAIL=Wind Homes <sender@tu-dominio>
```

`dev.py` carga por defecto el backend de consola para que no haya que
configurar credenciales en local. Cambiando `EMAIL_PROVIDER=brevo` el mismo
código envía correo real a través de la API HTTPS de Brevo (recomendado en
hosts como DigitalOcean que bloquean SMTP).

## Backend

### Dominios

| App          | Responsabilidad                                       | Modelos                                                  |
| ------------ | ----------------------------------------------------- | -------------------------------------------------------- |
| `accounts`   | Identidad + sesión JWT (login por email)              | `User` (`AbstractUser`, sin `username`)                  |
| `properties` | Catálogo bilingüe + búsqueda/filtros + imágenes WebP  | `Location`, `Amenity`, `Property`, `PropertyImage`       |
| `bookings`   | Reservas con concurrencia + email de confirmación     | `Booking` (`pending` / `confirmed` / `cancelled`)        |
| `common`     | Utilidades transversales                              | `LocalizedField`, `optimize_image`, validators           |

Cada modelo está registrado en `admin.py` de su app con `ModelAdmin` dedicado.

### Modelo de datos

```mermaid
erDiagram
  USER ||--o{ BOOKING : "reserva"
  PROPERTY ||--o{ BOOKING : "recibe"
  LOCATION ||--o{ PROPERTY : "agrupa"
  PROPERTY ||--o{ PROPERTYIMAGE : "muestra"
  PROPERTY }o--o{ AMENITY : "incluye"

  USER {
    int id PK
    string email "unique"
    string full_name
    string phone_country_code
    string phone_number
    date birth_date
  }
  LOCATION {
    int id PK
    string name_es
    string name_en
    string slug "unique"
    string country
  }
  PROPERTY {
    int id PK
    int location_id FK
    string title_es
    string title_en
    string slug "unique"
    decimal price_per_night
    string currency
    int max_guests
    int bedrooms
    int bathrooms
    bool is_active
    bool is_featured
  }
  PROPERTYIMAGE {
    int id PK
    int property_id FK
    image image "WebP, lado máx 1200px"
    int order
    bool is_cover
  }
  AMENITY {
    int id PK
    string name_es
    string name_en
    string slug "unique"
    string icon
  }
  BOOKING {
    int id PK
    int property_id FK
    int user_id FK
    string code "WH-YYYYMMDD-XXXXXX unique"
    date check_in
    date check_out
    int guests
    decimal total_price
    string status "pending|confirmed|cancelled"
    datetime email_sent_at
    string language "es|en"
  }
```

Reglas de integridad (a nivel DB):

- `Property`: `max_guests > 0`, `price_per_night >= 0`.
- `Booking`: `check_in < check_out`, `guests > 0`, `total_price >= 0`.
- El idioma se persiste por reserva para reproducir el email en el idioma vigente al momento de reservar.                                        |

### Flujo: creación de reserva

`bookings/services.py::create_booking` orquesta validación, concurrencia y
persistencia. El email se dispara fuera del lock vía `transaction.on_commit`.

```mermaid
sequenceDiagram
  participant FE as Frontend
  participant V as BookingViewSet.create
  participant S as create_booking()
  participant DB as Postgres
  participant E as Email worker

  FE->>V: POST /bookings/ {property_id, fechas, guests}
  V->>S: create_booking(...)
  S->>DB: BEGIN
  S->>DB: SELECT property FOR UPDATE
  S->>DB: SELECT bookings FOR UPDATE (overlap)
  alt Solape detectado
    S-->>V: ValidationError ("fechas no disponibles")
    V-->>FE: 400
  else Disponible
    S->>DB: INSERT booking (code = WH-YYYYMMDD-XXXXXX)
    S->>DB: COMMIT
    S-->>V: Booking
    V-->>FE: 201 BookingDetail
    Note over DB,E: post_save signal + on_commit
    DB->>E: send_booking_confirmation(id)
    E->>E: render plantilla es|en
    E-->>DB: UPDATE email_sent_at (idempotente)
  end
```

Garantías:

- `transaction.atomic()` + `select_for_update()` sobre `Property` y los bookings con
  solape: dos requests concurrentes con fechas iguales se serializan y la segunda recibe 400.
- El código `WH-YYYYMMDD-XXXXXX` se reintenta una vez ante colisión por `unique`.
- El email se envía con `transaction.on_commit`: nunca se manda si la reserva no se persistió.
- `email_sent_at` hace el envío idempotente: el signal nunca duplica un correo.

### i18n del API

`common/localization.LocalizedField("title")` proyecta `title_es` / `title_en` al campo
`title` del payload según el idioma resuelto. Aplica a `Location`, `Amenity`, `Property`
y `PropertyImage.alt`.

## Frontend

### Stack y capas

- **React 18 + Vite** (plain JavaScript, sin TypeScript).
- **TanStack Query** para fetching/caché (`staleTime: 60s`, sin refetch on focus).
- **react-hook-form + Zod** para formularios validados (`src/schemas/`).
- **react-i18next** con bundles `es.json` / `en.json` y switcher en el `Header`.
- **Axios** centralizado en `src/api/client.js`: inyecta `Authorization`, propaga `?lang`,
  refresca el `access` token y emite el evento `auth:expired` cuando el refresh falla.

### Árbol de rutas

```text
/                              HomePage                  público
/login                         LoginPage                 público
/register                      RegisterPage              público
/search                        SearchPage                público
/property/:slug                PropertyDetailPage        público
/checkout                      CheckoutPage              público (con login/registro inline)
/me/bookings                   MyBookingsPage            protegido (RequireAuth)
/booking/:id/confirmation      BookingConfirmationPage   protegido
```

`RequireAuth` redirige a `/login?next=...` cuando no hay token; el draft de la reserva
se preserva en `sessionStorage` (`utils/bookingDraft.js`) para sobrevivir al login inline.

### Flujo: checkout

```mermaid
sequenceDiagram
  participant U as Usuario
  participant D as PropertyDetailPage
  participant CK as CheckoutPage
  participant API as API

  U->>D: Selecciona fechas y huéspedes
  D->>API: POST /properties/{slug}/check-availability/
  API-->>D: {available, total_price, nights}
  D->>CK: Navega con bookingDraft (sessionStorage)
  alt No autenticado
    CK->>U: InlineLoginForm / InlineRegisterForm
    U->>API: POST /auth/login o /auth/register
    API-->>CK: access + refresh
  end
  CK->>API: POST /bookings/ (Bearer JWT)
  API-->>CK: 201 BookingDetail
  CK->>U: Redirige a /booking/:id/confirmation
```

### Estado y persistencia

- **`AuthContext`** (`src/context/AuthContext.jsx`): hidrata el perfil con `GET /auth/me/`,
  expone `login` / `register` / `logout` y reacciona a `auth:expired` (emitido por el cliente axios).
- **Tokens**: `wh.access` y `wh.refresh` en `localStorage`. Idioma en `wh.lang`.
- **Draft de reserva**: persistido en `sessionStorage` para sobrevivir al login inline.
- **Tostadas globales**: `components/ui/Toast` (errores de red/servidor en ES/EN).

## Estructura

```text
backend/
├── accounts/          User + JWT + register/login/me
├── properties/        Location, Property, PropertyImage, Amenity
├── bookings/          Booking + concurrencia + email de confirmación
├── common/            imaging, localization, validators
├── config/settings/   base.py · dev.py · prod.py (importaciones explícitas)
├── templates/emails/  booking_confirmation.{html,txt}
└── requirements.txt

frontend/
├── src/
│   ├── api/           axios client + endpoints
│   ├── components/    layout · property · booking · forms · ui
│   ├── context/       AuthContext
│   ├── i18n/          es.json · en.json
│   ├── pages/         Home · Search · Detail · Checkout · Confirmation · Login/Register · MyBookings
│   ├── routes/        AppRouter · RequireAuth
│   ├── schemas/       Zod schemas
│   ├── styles/        tokens · fonts · pages · global
│   └── utils/         apiErrors · bookingDraft · currency
└── package.json

docker-compose.dev.yml Postgres local
```

## Limitaciones conocidas

- No se persiste el pago (form de pago es mock UI). Solo se guarda la reserva.
- No se modelan `Coupon`, `Tax`, `BillingAddress`, `AdditionalService`,
  `RewardAccount`.
- Maps son un placeholder estilizado: las coordenadas se persisten pero no
  hay integración real con Google Maps / Mapbox.
- Tokens JWT viven en `localStorage`. El README de producción documentaría el
  trade-off frente a una cookie httpOnly.
- Calendarios de fechas usan el `<input type="date">` nativo; no hay
  date-picker custom.
- El Lighthouse mobile objetivo es ≥85; cualquier degradación se debe
  diagnosticar en `npm run build && npm run preview`.