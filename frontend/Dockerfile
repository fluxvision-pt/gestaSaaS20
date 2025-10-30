# Etapa 1: Build do frontend
FROM node:22-alpine AS build
WORKDIR /frontend

# Args com HTTPS (evita Mixed Content)
ARG VITE_API_URL=https://api.fluxvision.cloud/api
ARG VITE_ENVIRONMENT=production
ARG VITE_APP_NAME=gestaSaaS
ARG VITE_APP_VERSION=1.0.0
ARG VITE_ENABLE_ANALYTICS=true
ARG VITE_ENABLE_DEBUG=false

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS
ENV VITE_ENABLE_DEBUG=$VITE_ENABLE_DEBUG

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Nginx
FROM nginx:1.27-alpine
RUN apk add --no-cache curl

COPY --from=build /frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# REMOVE o arquivo default.conf padrão (muito importante!)
RUN rm /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/index.html || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
