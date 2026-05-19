# Etapa 1: Build con Node.
FROM node:22-alpine AS build

# VITE_API_BASE_URL relativo => mismas origins, sin CORS. El nginx de la
# etapa 2 reenvía /api/* al backend dentro de la red privada del compose.
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Etapa 2: Servir el bundle estático con nginx.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
