// server.js - Servidor con logs en tiempo real usando Socket.io
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Variable global para el proceso del bot
let botProcess = null;

// Servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Conexión Socket.io
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado al servidor de logs');
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado');
  });
});

// Función para enviar logs a todos los clientes conectados
function sendLog(message, type = 'info') {
  console.log(message);
  io.emit('bot-log', { message, type });
}

function sendStatus(status) {
  io.emit('bot-status', { status });
}

// Ruta para iniciar el bot
app.post('/start-bot', (req, res) => {
  const { usuario, password, whatsapp, codigo1, codigo2 } = req.body;

  // Validaciones
  if (!usuario || !password || !whatsapp) {
    return res.status(400).json({ error: 'Usuario, contraseña y WhatsApp son requeridos' });
  }

  if (!codigo1 || !codigo2) {
    return res.status(400).json({ error: 'Los 2 códigos de socios son requeridos' });
  }

  // Formatear WhatsApp para Twilio
  let formattedWhatsapp = whatsapp.trim();
  if (!formattedWhatsapp.startsWith('whatsapp:')) {
    formattedWhatsapp = 'whatsapp:' + formattedWhatsapp;
  }

  console.log('\n🚀 Iniciando bot en MODO TURBO ULTRA-RÁPIDO:');
  console.log(`   Usuario: ${usuario}`);
  console.log(`   WhatsApp: ${formattedWhatsapp}`);
  console.log(`   Códigos: ${codigo1}, ${codigo2}`);
  console.log(`   Polling: 250ms | Sync: 2 min antes\n`);

  sendLog('🚀 Iniciando bot en modo TURBO ULTRA-RÁPIDO...', 'info');
  sendLog(`Usuario: ${usuario}`, 'info');
  sendLog(`WhatsApp: ${formattedWhatsapp}`, 'info');
  sendLog(`Códigos socios: ${codigo1}, ${codigo2}`, 'info');
  sendStatus('running');

  try {
    // Ejecutar app.js
    botProcess = spawn('node', [
      'app.js', 
      usuario, 
      password, 
      formattedWhatsapp,
      codigo1,
      codigo2
    ], {
      cwd: __dirname,
      env: process.env
    });

    // Capturar output del bot (stdout)
    botProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      const lines = output.split('\n');
      
      lines.forEach(line => {
        if (!line) return;
        
        let type = 'info';
        if (line.includes('✅') || line.includes('✔️')) {
          type = 'success';
        } else if (line.includes('❌') || line.includes('ERROR')) {
          type = 'error';
        } else if (line.includes('⚠️') || line.includes('WARNING')) {
          type = 'warning';
        } else if (line.includes('⏳') || line.includes('Esperando')) {
          type = 'info';
          sendStatus('waiting');
        }
        
        sendLog(line, type);
      });
    });

    // Capturar errores del bot (stderr)
    botProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      sendLog(error, 'error');
      sendStatus('error');
    });

    // Cuando el bot termina
    botProcess.on('close', (code) => {
      if (code === 0) {
        sendLog('✅ Bot finalizado correctamente', 'success');
      } else {
        sendLog(`❌ Bot finalizado con código: ${code}`, 'error');
        sendStatus('error');
      }
      botProcess = null;
    });

    botProcess.on('error', (error) => {
      sendLog(`❌ Error al ejecutar bot: ${error.message}`, 'error');
      sendStatus('error');
    });

    console.log('✅ Bot iniciado correctamente\n');

    res.json({ 
      success: true, 
      message: 'Bot iniciado en modo turbo ultra-rápido',
      details: `Usuario: ${usuario}<br>WhatsApp: ${formattedWhatsapp}<br>Códigos: ${codigo1}, ${codigo2}<br><br>Logs en tiempo real activados.`
    });

  } catch (error) {
    console.error('❌ Error:', error);
    sendLog(`❌ Error al iniciar: ${error.message}`, 'error');
    sendStatus('error');
    res.status(500).json({ error: 'Error al iniciar el bot: ' + error.message });
  }
});

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🏌️‍♂️  Bot Tee Time - Modo Turbo    🏌️‍♂️   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`✅ Socket.io activo para logs en tiempo real`);
  console.log(`⚡ Modo: Ultra-rápido (250ms polling)\n`);
  console.log(`📋 Pasos:`);
  console.log(`   1. Asegúrate de tener Twilio configurado en .env`);
  console.log(`   2. Abre: http://localhost:${PORT}`);
  console.log(`   3. Ingresa credenciales y códigos de socios`);
  console.log(`   4. ¡El bot se sincronizará y reservará automáticamente!\n`);
});