# Usa la imagen oficial de Puppeteer como base
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Cambia al usuario root para realizar instalaciones
USER root

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Configura variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=3000

# Actualiza e instala dependencias del sistema con manejo de errores
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
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
    wget && \
    rm -rf /var/lib/apt/lists/*

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias de Node.js
RUN npm ci --only=production

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto del servidor
EXPOSE 3000

# Cambia de vuelta al usuario de Puppeteer
USER pptruser

# Comando de inicio para el servidor
CMD ["node", "server.js"]