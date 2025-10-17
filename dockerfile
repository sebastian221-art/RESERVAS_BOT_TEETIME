# Usa la imagen oficial de Puppeteer que ya incluye Chrome estable
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

# Carpeta de trabajo
WORKDIR /usr/src/app

# Instala las dependencias del sistema necesarias para que Chrome funcione
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    gconf-service \
    libappindicator1 \
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
    wget \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Copia dependencias e instala solo producción
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copia el resto del código
COPY . .

# Expone el puerto del servidor
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
