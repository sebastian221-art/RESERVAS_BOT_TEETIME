# Usa la imagen oficial de Puppeteer como base
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=10000 \
    NODE_OPTIONS=--max_old_space_size=512 \
    DEBIAN_FRONTEND=noninteractive

# Cambia al usuario root
USER root

# Directorio de trabajo
WORKDIR /usr/src/app

# ✅ INSTALAR DEPENDENCIAS DEL SISTEMA (CORREGIDO)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        wget \
        gnupg \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# ✅ NO INSTALAR CHROME (ya viene en la imagen base de puppeteer)
# La imagen ghcr.io/puppeteer/puppeteer:21.6.1 YA trae Chrome instalado

# Copia archivos de dependencias
COPY package*.json ./

# Instala dependencias de Node.js
RUN npm ci --only=production --no-audit --no-fund --silent \
    && npm cache clean --force

# Copia el resto del código
COPY . .

# Ajustes de rendimiento
RUN npm prune --production

# Configura permisos
RUN chown -R pptruser:pptruser /usr/src/app

# Cambia al usuario de Puppeteer
USER pptruser

# Expone el puerto
EXPOSE 10000

# ✅ EJECUTAR SERVER.JS
CMD ["node", "--max_old_space_size=512", "server.js"]
