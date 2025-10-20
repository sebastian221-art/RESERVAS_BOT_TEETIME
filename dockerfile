# Usa la imagen oficial de Puppeteer
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=10000

# Directorio de trabajo
WORKDIR /usr/src/app

# Copia package files
COPY package*.json ./

# Instala dependencias (CORREGIDO)
RUN npm ci --omit=dev && npm cache clean --force

# Copia el código
COPY . .

# Expone puerto
EXPOSE 10000

# Usuario no-root
USER pptruser

# Inicia el servidor
CMD ["node", "server.js"]