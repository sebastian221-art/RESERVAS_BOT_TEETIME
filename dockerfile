# Usa la imagen oficial de Puppeteer como base
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Variables de entorno para optimización
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS=--max_old_space_size=256

# Cambia al usuario root para instalaciones
USER root

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Instala dependencias del sistema y Chrome
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
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
    google-chrome-stable \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists /var/cache/apt/archives

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

# Comando de inicio para el servidor
CMD ["node", "--max_old_space_size=256", "server.js"]