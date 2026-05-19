# Etapa 1: Builder — instala dependencias en un venv aislado.
FROM python:3.11-slim AS builder

WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Etapa 2: Runtime — imagen final con el venv + el código.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    DJANGO_SETTINGS_MODULE=config.settings.prod

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv

# Copia el código (excluye .venv, media, etc. por .dockerignore).
COPY . .

# Recopila estáticos en build-time; whitenoise los sirve después.
# SECRET_KEY dummy es válido aquí porque collectstatic no lo usa.
RUN SECRET_KEY=build-time-only \
    DATABASE_URL=sqlite:///tmp/build.sqlite3 \
    python manage.py collectstatic --noinput

# Carpetas que el runtime espera escribir (montadas como volúmenes en compose).
RUN mkdir -p /app/media /app/staticfiles

EXPOSE 8000

# CMD por defecto: solo gunicorn. La migración corre desde docker-compose
# vía `command:` (sh -c "migrate && gunicorn ..."), que tiene precedencia.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-", "--error-logfile", "-"]
