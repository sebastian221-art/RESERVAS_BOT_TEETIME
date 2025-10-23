// server.js - VERSIÓN SIN WHATSAPP/TWILIOOO
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado al servidor de logs');
  
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

app.post('/start-bot', (req, res) => {
  const { usuario, password, codigo1, codigo2 } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  if (!codigo1 || !codigo2) {
    return res.status(400).json({ error: 'Los 2 códigos de socios son requeridos' });
  }

  // ✅ VALIDAR QUE NO HAYA OTRO BOT CORRIENDO
  if (botProcess) {
    return res.status(400).json({ error: 'Ya hay un bot ejecutándose. Deténlo primero.' });
  }

  console.log('\n' + '='.repeat(50));
  console.log('🚀 INICIANDO BOT');
  console.log('='.repeat(50));
  console.log('Usuario:', usuario);
  console.log('Password:', password ? '***' : 'NO DEFINIDO');
  console.log('Código 1:', codigo1);
  console.log('Código 2:', codigo2);
  console.log('CWD:', __dirname);
  console.log('Archivo:', path.join(__dirname, 'app.js'));
  console.log('='.repeat(50) + '\n');

  sendLog('🚀 Iniciando bot...', 'info');
  sendStatus('running');

  try {
    const args = [
      'app.js',
      usuario,
      password,
      codigo1,
      codigo2
    ];

    console.log('📋 Argumentos del spawn:', JSON.stringify(args, null, 2));
    console.log('');

    botProcess = spawn('node', args, {
      cwd: __dirname,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    console.log('✅ Spawn ejecutado');
    console.log('   PID:', botProcess.pid);
    console.log('   Spawn args:', botProcess.spawnargs);
    console.log('');

    let receivedOutput = false;

    botProcess.stdout.on('data', (data) => {
      receivedOutput = true;
      const output = data.toString();
      console.log('📤 STDOUT:', output);
      
      const lines = output.split('\n');
      lines.forEach(line => {
        if (!line.trim()) return;
        
        let type = 'info';
        if (line.includes('✅') || line.includes('✔️')) type = 'success';
        else if (line.includes('❌') || line.includes('ERROR')) type = 'error';
        else if (line.includes('⚠️') || line.includes('WARNING')) type = 'warning';
        
        sendLog(line, type);
      });
    });

    botProcess.stderr.on('data', (data) => {
      receivedOutput = true;
      const error = data.toString();
      console.error('📛 STDERR:', error);
      sendLog(error, 'error');
    });

    botProcess.on('spawn', () => {
      console.log('✅ Evento "spawn" - Proceso iniciado correctamente');
    });

    botProcess.on('close', (code, signal) => {
      console.log(`\n🏁 Proceso cerrado - Código: ${code}, Signal: ${signal}`);
      console.log('   ¿Recibió output?:', receivedOutput);
      console.log('');
      
      if (code === 0) {
        sendLog('✅ Bot finalizado correctamente', 'success');
        sendStatus('completed');
      } else if (signal === 'SIGTERM') {
        sendLog('🛑 Bot detenido por el usuario', 'warning');
        sendStatus('stopped');
      } else {
        sendLog(`❌ Bot finalizado con código: ${code}`, 'error');
        sendStatus('error');
      }
      
      botProcess = null;
    });

    botProcess.on('error', (error) => {
      console.error('❌ ERROR en spawn:', error);
      console.error('   Tipo:', error.code);
      console.error('   Mensaje:', error.message);
      console.error('   Stack:', error.stack);
      sendLog(`❌ Error: ${error.message}`, 'error');
      sendStatus('error');
      botProcess = null;
    });

    setTimeout(() => {
      if (!receivedOutput) {
        console.warn('⚠️  WARNING: No se recibió output del bot en 5 segundos');
        console.warn('   El proceso puede estar bloqueado o no se está ejecutando');
      }
    }, 5000);

    res.json({ 
      success: true, 
      message: 'Bot iniciado',
      pid: botProcess.pid
    });

  } catch (error) {
    console.error('❌ CATCH ERROR:', error);
    console.error('   Stack:', error.stack);
    sendLog(`❌ Error: ${error.message}`, 'error');
    sendStatus('error');
    botProcess = null;
    res.status(500).json({ error: error.message });
  }
});

// ✅ ENDPOINT PARA DETENER EL BOT
app.post('/stop-bot', (req, res) => {
  console.log('\n🛑 Solicitud para detener el bot recibida');
  
  if (botProcess) {
    console.log('   PID del proceso:', botProcess.pid);
    console.log('   Enviando señal SIGTERM...');
    
    try {
      // Enviar señal para terminar el proceso
      botProcess.kill('SIGTERM');
      
      // Timeout de seguridad: si no termina en 5 segundos, forzar cierre
      setTimeout(() => {
        if (botProcess) {
          console.log('   ⚠️  Proceso no terminó, forzando cierre con SIGKILL');
          botProcess.kill('SIGKILL');
          botProcess = null;
        }
      }, 5000);
      
      sendLog('🛑 Bot detenido manualmente', 'warning');
      sendStatus('stopped');
      
      console.log('   ✅ Señal enviada correctamente\n');
      
      res.json({ 
        success: true, 
        message: 'Bot detenido correctamente' 
      });
      
    } catch (error) {
      console.error('   ❌ Error al detener:', error);
      botProcess = null;
      
      res.json({ 
        success: true, 
        message: 'Proceso finalizado (con error pero limpiado)' 
      });
    }
  } else {
    console.log('   ℹ️  No hay bot ejecutándose\n');
    
    res.json({ 
      success: false, 
      message: 'No hay bot ejecutándose' 
    });
  }
});

// ✅ ENDPOINT PARA VERIFICAR ESTADO
app.get('/bot-status', (req, res) => {
  res.json({
    running: botProcess !== null,
    pid: botProcess ? botProcess.pid : null
  });
});

httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🏌️‍♂️  Bot Tee Time - Server Ready  🏌️‍♂️   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n✅ Servidor: http://localhost:${PORT}`);
  console.log(`✅ Socket.io activo`);
  console.log(`\n🔧 Endpoints disponibles:`);
  console.log(`   POST /start-bot  - Iniciar bot`);
  console.log(`   POST /stop-bot   - Detener bot`);
  console.log(`   GET  /bot-status - Estado del bot`);
  console.log(`\n🔧 Listo para recibir comandos\n`);
});