# Usa imagen con Chrome ya instalado
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (sin descargar Chromium)
RUN npm ci --only=production --ignore-scripts

# Copiar el resto del código
COPY . .

# Exponer puerto (Render asigna dinámicamente)
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
```

---

## 📋 **Pasos para usarlo:**

### **1. Crear el archivo:**

En la raíz de tu proyecto (misma carpeta que `server.js`), crea un archivo llamado exactamente:
```
Dockerfile
```
(Sin extensión, sin .txt, solo "Dockerfile")

### **2. Copiar el contenido de arriba**

### **3. Crear `.dockerignore`:**
```
node_modules
.env
.git
.gitignore
npm-debug.log