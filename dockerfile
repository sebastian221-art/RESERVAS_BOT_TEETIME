# Usa la imagen oficial de Puppeteer (ya tiene Chrome y todo lo necesario)
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

# Instala dependencias de Node.js
RUN npm ci --only=production --silent && npm cache clean --force

# Copia el código
COPY . .

# Expone puerto
EXPOSE 10000

# Usuario no-root (ya existe en la imagen base)
USER pptruser

# Inicia el servidor
CMD ["node", "server.js"]