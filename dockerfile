# Usa la imagen oficial de Puppeteer que ya incluye Chromium
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

# Carpeta de trabajo
WORKDIR /usr/src/app

# Copia dependencias e instala solo producción
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copia el resto del código
COPY . .

# Expone el puerto de tu servidor
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
