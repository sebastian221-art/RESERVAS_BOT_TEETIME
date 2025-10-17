// app_turbo.js - MODO COMPETITIVO ULTRA-RÁPIDO 🏁
// Bot optimizado para competir por el primer horario disponible
import 'dotenv/config';
import puppeteer from 'puppeteer';
import Twilio from 'twilio';
import os from 'os';

const isLinux = os.platform() === 'linux';


// Obtener usuario, contraseña y whatsapp de argumentos o .env
const USER_CLUB = process.argv[2] || process.env.USER_CLUB;
const PASS_CLUB = process.argv[3] || process.env.PASS_CLUB;
const TARGET_WHATSAPP = process.argv[4] || process.env.TARGET_WHATSAPP;

// Cargar resto de variables de entorno (Twilio)
const { TWILIO_SID, AUTH_TOKEN, TWILIO_WHATSAPP } = process.env;

// Validar credenciales
if (!USER_CLUB || !PASS_CLUB) {
  throw new Error('❌ Faltan credenciales del Club (usuario/contraseña)');
}
if (!TWILIO_SID || !AUTH_TOKEN || !TWILIO_WHATSAPP) {
  throw new Error('❌ Faltan credenciales Twilio en .env');
}
if (!TARGET_WHATSAPP) {
  throw new Error('❌ Falta número de WhatsApp destino');
}

const twClient = Twilio(TWILIO_SID, AUTH_TOKEN);

// ⚡ CONFIGURACIÓN MODO TURBO
const TURBO_CONFIG = {
  POLL_INTERVAL_MS: 250,           // Polling cada 250ms (ultra-rápido)
  CLICK_DELAY_MS: 50,              // Delay mínimo entre clicks
  MODAL_WAIT_MS: 300,              // Espera mínima para modal
  REFRESH_EVERY_N: 40,             // Refrescar cada 40 intentos (~10s)
  START_MINUTES_BEFORE: 2,         // Iniciar 2 minutos antes de las 2 PM
  TARGET_HOUR: 14,                 // 2 PM (hora de activación)
  TARGET_MINUTE: 0,                // Minuto 0
  MAX_RESERVATION_ATTEMPTS: 100    // Intentos máximos de reserva
};

async function sendWhats(msg) {
  try {
    await twClient.messages.create({
      from: TWILIO_WHATSAPP,
      to: TARGET_WHATSAPP,
      body: msg
    });
    console.log('✅ WhatsApp enviado');
  } catch (e) {
    console.error('❌ Error WhatsApp:', e.message);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sincroniza el inicio del bot con el horario objetivo
 */
async function waitUntilStartTime() {
  const now = new Date();
  const target = new Date();
  
  // Configurar hora objetivo (X minutos antes de las 2 PM)
  target.setHours(
    TURBO_CONFIG.TARGET_HOUR, 
    TURBO_CONFIG.TARGET_MINUTE - TURBO_CONFIG.START_MINUTES_BEFORE, 
    50, // Segundos (50s antes del minuto)
    0
  );
  
  // Si ya pasó la hora, configurar para mañana
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const waitMs = target - now;
  
  if (waitMs > 60000) { // Si falta más de 1 minuto
    const minutes = Math.floor(waitMs / 60000);
    const seconds = Math.floor((waitMs % 60000) / 1000);
    console.log(`⏰ Esperando hasta ${target.toLocaleTimeString('es-CO')}`);
    console.log(`   (Faltan ${minutes} min ${seconds} seg)\n`);
    await sleep(waitMs);
  }
}

async function startBotTurbo() {
  console.log('🏁 MODO COMPETITIVO ULTRA-RÁPIDO ACTIVADO');
  console.log('⚡ Configuración:');
  console.log(`   - Polling: cada ${TURBO_CONFIG.POLL_INTERVAL_MS}ms`);
  console.log(`   - Inicio: ${TURBO_CONFIG.START_MINUTES_BEFORE} min antes`);
  console.log(`   - Hora objetivo: ${TURBO_CONFIG.TARGET_HOUR}:${String(TURBO_CONFIG.TARGET_MINUTE).padStart(2, '0')} PM\n`);
const browser = await puppeteer.launch({
  headless: "new",
  defaultViewport: null,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-software-rasterizer',
    '--disable-extensions',
    '--no-zygote',
    '--single-process'
  ],
  executablePath: isLinux
    ? '/usr/bin/chromium' // Render
    : puppeteer.executablePath(), // Windows local
  timeout: 0
});

  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  
  // Ocultar que es un bot
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    // ========================================
    // 1) LOGIN
    // ========================================
    console.log('🌐 Iniciando sesión...');
    await page.goto('https://clubcampestrebucaramanga.com/empresa/login', {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('#txtEmail', { timeout: 20000 });
    await page.type('#txtEmail', USER_CLUB.toString(), { delay: 30 });
    await page.type('#txtPassword', PASS_CLUB.toString(), { delay: 30 });

    await page.evaluate(() => {
      const btn = document.querySelector("button.btn-success[type='submit'], button.btn-success");
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    console.log('✔️ Login OK\n');

    // ========================================
    // 2) CLICK TEE TIME
    // ========================================
    console.log('📋 Accediendo a Tee Time...');
    
    await page.waitForFunction(() => {
      const links = Array.from(document.querySelectorAll('nav a.nav-link'));
      return links.some(link => link.querySelector('p')?.textContent.trim() === 'Tee Time');
    }, { timeout: 45000 });

    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a.nav-link'));
      const teeTimeLink = links.find(link => 
        link.querySelector('p')?.textContent.trim() === 'Tee Time'
      );
      if (teeTimeLink) teeTimeLink.click();
    });
    
    console.log('✔️ Click ejecutado');
    await sleep(10000);

    // ========================================
    // 3) ACCEDER AL IFRAME
    // ========================================
    console.log('🖼️ Buscando iframe...');
    
    let iframeFound = false;
    for (let i = 0; i < 5; i++) {
      const frameExists = await page.$('#milframe, iframe[src*="appxajax"]');
      if (frameExists) {
        iframeFound = true;
        break;
      }
      await sleep(3000);
    }

    if (!iframeFound) throw new Error('Iframe no encontrado');
    
    await sleep(5000);
    
    let frame = null;
    let attempts = 0;
    
    while (!frame && attempts < 15) {
      const frames = page.frames();
      frame = frames.find(f => 
        f.url().includes('appxajax') && f.url().includes('teetime')
      );
      
      if (!frame) {
        frame = frames.find(f => f.url().includes('teetime'));
      }
      
      if (!frame) {
        attempts++;
        await sleep(2000);
      }
    }
    
    if (!frame) throw new Error('Frame no accesible');
    
    console.log('✔️ Frame OK\n');

    // ========================================
    // 4) ESPERAR TABLA
    // ========================================
    console.log('📅 Cargando tabla de días...');
    
    await frame.waitForSelector('#contenido', { timeout: 60000 });
    await sleep(8000);
    
    await frame.waitForFunction(() => {
      const table = document.querySelector('table.mitabla');
      const rows = table?.querySelectorAll('tbody tr.mitabla');
      const secondRow = rows ? rows[1] : null;
      return secondRow?.querySelector('a[onclick*="teeTimeFecha"]') !== null;
    }, { timeout: 90000 });
    
    console.log('✔️ Tabla OK\n');

    // ========================================
    // 5) CLICK EN SEGUNDO DÍA
    // ========================================
    console.log('📆 Seleccionando día de mañana...');
    
    const secondDayInfo = await frame.evaluate(() => {
      const table = document.querySelector('table.mitabla');
      const rows = table.querySelectorAll('tbody tr.mitabla');
      const secondRow = rows[1];
      
      const firstCell = secondRow.querySelector('td');
      const dayText = firstCell ? firstCell.textContent.trim() : 'Desconocido';
      const link = secondRow.querySelector('a[onclick*="teeTimeFecha"]');
      const onclick = link ? link.getAttribute('onclick') : null;
      
      return { dayText, onclick };
    });

    if (!secondDayInfo?.onclick) throw new Error('Onclick del día no encontrado');

    console.log('📅 Día:', secondDayInfo.dayText);
    
    await frame.evaluate(oc => {
      try { eval(oc); } catch(e) {
        const table = document.querySelector('table.mitabla');
        const secondRow = table.querySelectorAll('tbody tr.mitabla')[1];
        secondRow?.querySelector('a[onclick*="teeTimeFecha"]')?.click();
      }
    }, secondDayInfo.onclick);

    console.log('✔️ Click ejecutado');
    await sleep(10000);

    // ========================================
    // 6) ESPERAR HORARIOS
    // ========================================
    console.log('⏳ Cargando horarios...');
    await frame.waitForSelector('#tee-time', { timeout: 60000 });
    console.log('✔️ Horarios cargados\n');

    // ========================================
    // 7) SINCRONIZACIÓN Y POLLING TURBO
    // ========================================
    console.log('🕐 Sincronizando con horario de activación...');
    await waitUntilStartTime();
    
    console.log('⚡ MODO TURBO ACTIVADO - Polling ultra-rápido iniciado');
    console.log(`   Verificando cada ${TURBO_CONFIG.POLL_INTERVAL_MS}ms\n`);

    const isInactive = async () => {
      try {
        const text = await frame.evaluate(() => document.body.innerText.toUpperCase());
        return text.includes('INACTIVO');
      } catch (e) {
        return true;
      }
    };

    let pollCount = 0;
    const pollStart = Date.now();
    
    // POLLING ULTRA-RÁPIDO
    while (Date.now() - pollStart < 30 * 60 * 1000) { // Máx 30 min
      const inactive = await isInactive();
      
      if (!inactive) {
        console.log('\n🚨 ¡DÍA ACTIVO DETECTADO!');
        console.log('⚡ INICIANDO RESERVA INMEDIATA...\n');
        break;
      }

      pollCount++;
      
      // Log cada 20 segundos (~80 iteraciones)
      if (pollCount % 80 === 0) {
        const ahora = new Date().toLocaleTimeString('es-CO');
        const segs = Math.floor((Date.now() - pollStart) / 1000);
        console.log(`⏳ [${ahora}] Esperando... (${segs}s | ${pollCount} checks)`);
      }

      // Refrescar periódicamente
      if (pollCount % TURBO_CONFIG.REFRESH_EVERY_N === 0) {
        await frame.evaluate(() => {
          document.querySelector("a.refresh")?.click();
        }).catch(() => {});
      }

      await sleep(TURBO_CONFIG.POLL_INTERVAL_MS);
    }

    // ========================================
    // 8) RESERVA ULTRA-RÁPIDA
    // ========================================
    console.log('🎯 MODO RESERVA RÁPIDA');
    
    const successKeywords = [
      'RESERVADO', 'RESERVA REALIZADA', 'RESERVA EXITOSA',
      'RESERVADO CON ÉXITO', 'RESERVA CONFIRMADA'
    ];

    let reserved = false;

    for (let attempt = 1; attempt <= TURBO_CONFIG.MAX_RESERVATION_ATTEMPTS && !reserved; attempt++) {
      // Buscar slots disponibles
      const candidates = await frame.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#tee-time div[id^="btn_"] a[onclick*="teeReservado"]'));
        return buttons.map(btn => {
          const parentDiv = btn.closest('div[id^="btn_"]');
          const onclick = btn.getAttribute('onclick');
          const text = (btn.querySelector('div')?.innerText || btn.innerText).trim();
          const isReserved = text.toUpperCase().includes('RESERVADO');
          
          return {
            id: parentDiv?.id || '',
            onclick: onclick,
            text: text.replace(/\s+/g, ' '),
            isReserved: isReserved
          };
        });
      });

      const available = candidates.filter(c => !c.isReserved);

      if (available.length > 0) {
        const target = available[0];
        console.log(`🎯 Intento ${attempt}: ${target.text}`);

        // CLICK INMEDIATO
        const clicked = await frame.evaluate((targetOnclick) => {
          const buttons = Array.from(document.querySelectorAll('#tee-time a[onclick*="teeReservado"]'));
          const targetBtn = buttons.find(btn => btn.getAttribute('onclick') === targetOnclick);
          if (targetBtn) {
            targetBtn.click();
            return true;
          }
          return false;
        }, target.onclick);

        if (!clicked) {
          console.log('   ⚠️ Click falló');
          await sleep(TURBO_CONFIG.CLICK_DELAY_MS);
          continue;
        }

        // Espera mínima para modal
        await sleep(TURBO_CONFIG.MODAL_WAIT_MS);

        // Confirmar inmediatamente
        await frame.evaluate(() => {
          const modal = document.querySelector('#openModal, .modalDialog');
          if (!modal) return;
          
          const buttons = modal.querySelectorAll('button, a.btn, input[type="button"]');
          for (const btn of buttons) {
            const text = (btn.innerText || btn.value || '').toUpperCase();
            if (text.includes('CONFIRM') || text.includes('ACEPTAR') || 
                text.includes('RESERVAR') || text.includes('OK')) {
              btn.click();
              return;
            }
          }
        });

        await sleep(2000);

        // Verificar éxito
        const bodyText = await frame.evaluate(() => document.body.innerText || '');
        const success = successKeywords.some(k => bodyText.toUpperCase().includes(k));

        if (success) {
          reserved = true;
          const totalTime = ((Date.now() - pollStart) / 1000).toFixed(2);
          console.log('\n🎉 ¡RESERVA EXITOSA!');
          console.log(`⚡ Tiempo total: ${totalTime}s`);
          console.log(`📅 Día: ${secondDayInfo.dayText}`);
          console.log(`⏰ Horario: ${target.text}\n`);
          
          await sendWhats(
            `✅ ¡RESERVA EXITOSA! 🏌️‍♂️\n\n` +
            `📅 ${secondDayInfo.dayText}\n` +
            `⏰ ${target.text}\n` +
            `⚡ Tiempo: ${totalTime}s\n\n` +
            `Revisa tu panel del Club.`
          );
          break;
        }

        // Verificar si cambió a RESERVADO
        await sleep(1000);
        const nowReserved = await frame.evaluate((targetId) => {
          const btn = document.querySelector(`#${targetId}`);
          return btn ? btn.innerText.toUpperCase().includes('RESERVADO') : false;
        }, target.id);

        if (nowReserved) {
          reserved = true;
          console.log('\n✅ Reserva confirmada (slot cambió a RESERVADO)');
          await sendWhats(
            `✅ Reserva realizada! 🏌️‍♂️\n\n` +
            `📅 ${secondDayInfo.dayText}\n` +
            `⏰ ${target.text}`
          );
          break;
        }

      } else {
        if (attempt === 1) {
          console.log('🔴 No hay slots disponibles');
        }
      }

      // Refrescar cada 10 intentos
      if (attempt % 10 === 0) {
        await frame.evaluate(() => {
          document.querySelector("a.refresh")?.click();
        }).catch(() => {});
        await sleep(1500);
      } else {
        await sleep(TURBO_CONFIG.CLICK_DELAY_MS);
      }
    }

    if (!reserved) {
      console.log('\n❌ No se logró reservar');
      await sendWhats('⚠️ El bot no pudo reservar. Verifica manualmente.');
    }

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    await sendWhats(`❌ Error: ${err.message}`);
  } finally {
    console.log('\n🛑 Bot finalizado');
    // await browser.close();
  }
}

// EJECUTAR
startBotTurbo();