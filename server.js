// server-v2.js - CON SISTEMA DE RE-INTENTOS
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

let botProcess = null;
let currentConfig = null; // Guardar config actual para re-intentos

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado al servidor de logs');
  
  // Manejar re-intento de login
  socket.on('retry-login', (data) => {
    console.log('🔄 Re-intento de login recibido');
    if (currentConfig) {
      currentConfig.usuario = data.usuario;
      currentConfig.password = data.password;
      restartBotWithConfig(currentConfig);
    }
  });
  
  // Manejar re-intento de códigos
  socket.on('retry-codigos', (data) => {
    console.log('🔄 Re-intento de códigos recibido');
    if (currentConfig) {
      currentConfig.codigo1 = data.codigo1;
      currentConfig.codigo2 = data.codigo2;
      restartBotWithConfig(currentConfig);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado');
  });
});

function sendLog(message, type = 'info') {
  console.log(message);
  io.emit('bot-log', { message, type });
}

function sendStatus(status) {
  io.emit('bot-status', { status });
}

function requestLoginRetry() {
  console.log('📢 Solicitando re-intento de login al cliente');
  io.emit('request-login-retry');
}

function requestCodigosRetry(message) {
  console.log('📢 Solicitando re-intento de códigos al cliente');
  io.emit('request-codigos-retry', { message });
}

function restartBotWithConfig(config) {
  console.log('🔄 Reiniciando bot con nueva configuración...');
  
  // Detener bot actual si existe
  if (botProcess) {
    try {
      botProcess.kill('SIGTERM');
      botProcess = null;
    } catch (e) {
      console.error('Error deteniendo bot anterior:', e);
    }
  }
  
  // Esperar un momento antes de reiniciar
  setTimeout(() => {
    startBot(config);
  }, 1000);
}

function startBot(config) {
  const { usuario, password, codigo1, codigo2, minHour, minMinute } = config;
  
  sendLog('🚀 Iniciando bot...', 'info');
  sendStatus('running');

  try {
    const args = [
      'app.js', // Usando versión de prueba sin espera
      usuario,
      password,
      codigo1,
      codigo2,
      minHour.toString(),
      minMinute.toString()
    ];

    console.log('📋 Argumentos:', args);

    botProcess = spawn('node', args, {
      cwd: __dirname,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log('✅ Proceso spawn iniciado - PID:', botProcess.pid);

    let lastOutput = '';

    botProcess.stdout.on('data', (data) => {
      const output = data.toString();
      lastOutput = output;
      console.log('📤 STDOUT:', output);
      
      const lines = output.split('\n');
      lines.forEach(line => {
        if (!line.trim()) return;
        
        let type = 'info';
        if (line.includes('✅') || line.includes('✔️')) type = 'success';
        else if (line.includes('❌') || line.includes('ERROR')) type = 'error';
        else if (line.includes('⚠️') || line.includes('WARNING')) type = 'warning';
        
        // Detectar error de login
        if (line.includes('Login fallido') || line.includes('credenciales incorrectas') || 
            line.includes('Error de autenticación') || line.includes('usuario o contraseña incorrectos')) {
          sendLog('❌ Error de autenticación detectado', 'error');
          requestLoginRetry();
          return;
        }
        
        // Detectar error de códigos
        if (line.includes('Código de socio no encontrado') || 
            line.includes('no se encontró') ||
            line.includes('código inválido') ||
            (line.includes('⚠️') && line.includes('Socio'))) {
          sendLog('❌ Error en códigos de socios detectado', 'error');
          requestCodigosRetry(line);
          return;
        }
        
        sendLog(line, type);
      });
    });

    botProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('📛 STDERR:', error);
      
      // Detectar errores de login en stderr
      if (error.toLowerCase().includes('login') || 
          error.toLowerCase().includes('authentication') ||
          error.toLowerCase().includes('credenciales')) {
        sendLog('❌ Error de autenticación', 'error');
        requestLoginRetry();
        return;
      }
      
      sendLog(error, 'error');
    });

    botProcess.on('close', (code, signal) => {
      console.log(`\n🏁 Proceso cerrado - Código: ${code}, Signal: ${signal}`);
      
      if (code === 0) {
        sendLog('✅ Bot finalizado correctamente', 'success');
        sendStatus('completed');
        currentConfig = null;
      } else if (signal === 'SIGTERM') {
        sendLog('🛑 Bot detenido por el usuario', 'warning');
        sendStatus('stopped');
        currentConfig = null;
      } else {
        // No limpiar currentConfig para permitir re-intentos
        sendLog(`⚠️ Bot finalizado con código: ${code}`, 'warning');
        sendStatus('error');
      }
      
      botProcess = null;
    });

    botProcess.on('error', (error) => {
      console.error('❌ ERROR en spawn:', error);
      sendLog(`❌ Error: ${error.message}`, 'error');
      sendStatus('error');
      botProcess = null;
    });

  } catch (error) {
    console.error('❌ CATCH ERROR:', error);
    sendLog(`❌ Error: ${error.message}`, 'error');
    sendStatus('error');
    botProcess = null;
  }
}

app.post('/start-bot', (req, res) => {
  const { usuario, password, codigo1, codigo2, minHour, minMinute } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  if (!codigo1 || !codigo2) {
    return res.status(400).json({ error: 'Los 2 códigos de socios son requeridos' });
  }

  if (minHour === undefined || minMinute === undefined) {
    return res.status(400).json({ error: 'Hora mínima es requerida' });
  }

  if (botProcess) {
    return res.status(400).json({ error: 'Ya hay un bot ejecutándose' });
  }

  // Guardar configuración para re-intentos
  currentConfig = { usuario, password, codigo1, codigo2, minHour, minMinute };

  console.log('\n' + '='.repeat(50));
  console.log('🚀 INICIANDO BOT');
  console.log('='.repeat(50));
  console.log('Usuario:', usuario);
  console.log('Códigos:', codigo1, codigo2);
  console.log('Hora mínima:', `${minHour}:${minMinute.toString().padStart(2, '0')}`);
  console.log('='.repeat(50) + '\n');

  startBot(currentConfig);

  res.json({ 
    success: true, 
    message: 'Bot iniciado',
    pid: botProcess ? botProcess.pid : null
  });
});

app.post('/stop-bot', (req, res) => {
  console.log('\n🛑 Solicitud para detener el bot');
  
  if (botProcess) {
    try {
      botProcess.kill('SIGTERM');
      
      setTimeout(() => {
        if (botProcess) {
          console.log('   ⚠️  Forzando cierre');
          botProcess.kill('SIGKILL');
          botProcess = null;
        }
      }, 5000);
      
      sendLog('🛑 Bot detenido manualmente', 'warning');
      sendStatus('stopped');
      currentConfig = null;
      
      res.json({ success: true, message: 'Bot detenido' });
    } catch (error) {
      console.error('Error al detener:', error);
      botProcess = null;
      currentConfig = null;
      res.json({ success: true, message: 'Proceso finalizado' });
    }
  } else {
    res.json({ success: false, message: 'No hay bot ejecutándose' });
  }
});

app.get('/bot-status', (req, res) => {
  res.json({
    running: botProcess !== null,
    pid: botProcess ? botProcess.pid : null
  });
});

httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🏌️‍♂️  Bot Tee Time v2.1 - Ready  🏌️‍♂️    ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n✅ Servidor: http://localhost:${PORT}`);
  console.log(`✅ Sistema de re-intentos activo`);
  console.log(`\n🔧 Endpoints:`);
  console.log(`   POST /start-bot  - Iniciar bot`);
  console.log(`   POST /stop-bot   - Detener bot`);
  console.log(`   GET  /bot-status - Estado`);
  console.log(`\n🚀 Listo para recibir comandos\n`);
});