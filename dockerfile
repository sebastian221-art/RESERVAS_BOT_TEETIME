FROM ghcr.io/puppeteer/puppeteer:21.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=10000

USER root

WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install --production && npm cache clean --force

COPY . .


RUN chown -R pptruser:pptruser /usr/src/app


USER pptruser

EXPOSE 10000

CMD ["node", "server.js"]