FROM ghcr.io/puppeteer/puppeteer:21.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=10000

WORKDIR /usr/src/app

COPY package*.json ./

# Usar npm install en lugar de npm ci
RUN npm install --production && npm cache clean --force

COPY . .

EXPOSE 10000

USER pptruser

CMD ["node", "server.js"]