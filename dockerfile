# Usa la imagen oficial de Puppeteer como base
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Variables de entorno para optimización y seguridad
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS=--max_old_space_size=256 \
    DEBIAN_FRONTEND=noninteractive

# Cambia al usuario root para instalaciones
USER root

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Instala dependencias del sistema con método alternativo
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        wget \
        gnupg \
        ca-certificates \
        curl \
    && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" | tee /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        google-chrome-stable \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcairo2 \
        libcups2 \
        libdbus-1-3 \
        libexpat1 \
        libgbm1 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libx11-6 \
        libx11-xcb1 \
        libxcomposite1 \
        libxcursor1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxi6 \
        libxrandr2 \
        libxrender1 \
        libxss1 \
        libxtst6 \
        xdg-utils \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /var/cache/apt/archives/*

# Copia archivos de dependencias
COPY package*.json ./

# Instala dependencias de Node.js de forma ligera
RUN npm ci --only=production --no-audit --no-fund --silent \
    && npm cache clean --force

# Copia el resto del código de la aplicación
COPY . .

# Ajustes de rendimiento para Render
RUN npm prune --production

# Configura permisos
RUN chown -R pptruser:pptruser /usr/src/app

# Cambia al usuario de Puppeteer
USER pptruser

# Expone el puerto del servidor
EXPOSE 3000

# Comando de inicio para el servidor (ajustado a app.js según package.json)
CMD ["node", "--max_old_space_size=256", "app.js"]