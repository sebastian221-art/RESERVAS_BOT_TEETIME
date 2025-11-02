// app.js - VERSIÓN DEFINITIVA - REFRESH A 1:59:59 = HORARIOS ACTIVOS A 2:00:00
import 'dotenv/config';
import puppeteer from 'puppeteer';

const USER_CLUB = process.argv[2] || process.env.USER_CLUB;
const PASS_CLUB = process.argv[3] || process.env.PASS_CLUB;
const CODIGO_SOCIO_1 = process.argv[4] || process.env.CODIGO_SOCIO_1;
const CODIGO_SOCIO_2 = process.argv[5] || process.env.CODIGO_SOCIO_2;
const MIN_HOUR = parseInt(process.argv[6]) || 6;
const MIN_MINUTE = parseInt(process.argv[7]) || 10;

if (!USER_CLUB || !PASS_CLUB || !CODIGO_SOCIO_1 || !CODIGO_SOCIO_2) {
  throw new Error('❌ Faltan credenciales');
}

const CODIGOS_SOCIOS = [CODIGO_SOCIO_1, CODIGO_SOCIO_2];

const TURBO_CONFIG = {
  MIN_HOUR: MIN_HOUR,
  MIN_MINUTE: MIN_MINUTE,
  REFRESH_HOUR: 13,        // 1:59:59 PM
  REFRESH_MINUTE: 59,
  REFRESH_SECOND: 58,
  ACTIVATION_DELAY: 800    // Tiempo que tarda el refresh en cargar (ajustable)
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilExactTime(targetHour, targetMinute, targetSecond = 0) {
  while (true) {
    const now = new Date();
    const nowColombia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
    
    const target = new Date(nowColombia);
    target.setHours(targetHour, targetMinute, targetSecond, 0);
    
    const waitMs = target - nowColombia;
    
    if (waitMs <= 0) {
      // Ya pasó la hora de hoy, calcular para mañana
      const tomorrow = new Date(nowColombia);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(targetHour, targetMinute, targetSecond, 0);
      
      const tomorrowWaitMs = tomorrow - nowColombia;
      
      if (waitMs > -300000) { // Si pasó hace menos de 5 minutos
        console.log('⚠️ Ya pasó la hora objetivo de hoy (2:00 PM hace poco)');
        console.log('   Para mañana, ejecuta el bot antes de las 2 PM\n');
      }
      
      const hours = Math.floor(tomorrowWaitMs / 3600000);
      const minutes = Math.floor((tomorrowWaitMs % 3600000) / 60000);
      const seconds = Math.floor((tomorrowWaitMs % 60000) / 1000);
      
      console.log(`🌎 Hora actual Colombia: ${nowColombia.toLocaleTimeString('es-CO')}`);
      console.log(`⏰ Esperando hasta MAÑANA ${tomorrow.toLocaleTimeString('es-CO')}`);
      console.log(`   (Faltan ${hours}h ${minutes}m ${seconds}s)\n`);
      
      await sleep(tomorrowWaitMs);
      return;
    } else {
      const hours = Math.floor(waitMs / 3600000);
      const minutes = Math.floor((waitMs % 3600000) / 60000);
      const seconds = Math.floor((waitMs % 60000) / 1000);
      
      console.log(`🌎 Hora actual Colombia: ${nowColombia.toLocaleTimeString('es-CO')}`);
      console.log(`🎯 Hora objetivo: ${target.toLocaleTimeString('es-CO')}`);
      
      if (hours > 0) {
        console.log(`⏰ Esperando ${hours}h ${minutes}m ${seconds}s hasta el refresh...\n`);
      } else if (minutes > 0) {
        console.log(`⏰ Esperando ${minutes}m ${seconds}s hasta el refresh...\n`);
      } else {
        console.log(`⏰ Esperando ${seconds}s hasta el refresh...\n`);
      }
      
      await sleep(waitMs);
      return;
    }
  }
}

function getTomorrowDate() {
  const now = new Date();
  const nowColombia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const tomorrow = new Date(nowColombia);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = tomorrow.getDate();
  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const month = monthNames[tomorrow.getMonth()];
  const year = tomorrow.getFullYear();
  return { day, month, year, fullDate: `${day} de ${month} de ${year}` };
}

async function startSpeedTest() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║ 🔥 BOT ULTRA-SPEED DEFINITIVO 🔥          ║');
  console.log('║    REFRESH 1:59:59 → CLICK 2:00:00        ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const tomorrow = getTomorrowDate();
  
  console.log('⚡ Configuración ULTRA-SPEED:');
  console.log(`   - Usuario: ${USER_CLUB}`);
  console.log(`   - Socios: ${CODIGOS_SOCIOS.join(', ')}`);
  console.log(`   - Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`   - Headless: ${isProduction ? 'SÍ' : 'NO'}`);
  console.log(`   - Sistema: Observer + RAF + Interval`);
  console.log(`   - Horario mínimo: ${MIN_HOUR}:${MIN_MINUTE.toString().padStart(2,'0')} AM`);
  console.log(`   - Refresh exacto: 1:59:59 PM`);
  console.log(`   - Activación clicker: ~2:00:00 PM (al terminar carga)`);
  console.log(`   - Día objetivo: ${tomorrow.fullDate}\n`);

  console.log('🤖 Bot iniciado - ULTRA-SPEED MODE\n');

  console.log('🌐 Iniciando navegador...');
  
  const browser = await puppeteer.launch({
  headless: isProduction ? 'new' : false,
  defaultViewport: null,
  args: [
    // ✅ Seguridad básica (NECESARIO para Render)
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    
    // ✅ Básicos (mantener)
    "--disable-gpu",
    "--start-maximized",
    "--disable-blink-features=AutomationControlled",
    
    // 🔥🔥🔥 ANTI-CACHE (CRÍTICO - AGREGAR ESTOS 5) 🔥🔥🔥
    "--disable-cache",
    "--disable-application-cache",
    "--disable-offline-load-stale-cache",
    "--disk-cache-size=0",
    "--aggressive-cache-discard",
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                  (process.platform === "linux"
                    ? "/usr/bin/google-chrome-stable"
                    : puppeteer.executablePath()),
  timeout: 0
});
  console.log('✅ Navegador iniciado\n');

  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    const startTime = Date.now();
    
    console.log('🔐 Iniciando sesión...');
    await page.goto('https://clubcampestrebucaramanga.com/empresa/login', {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('#txtEmail', { timeout: 20000 });
    await page.type('#txtEmail', USER_CLUB.toString(), { delay: 30 });
    await page.type('#txtPassword', PASS_CLUB.toString(), { delay: 30 });

    await page.evaluate(() => {
      const btn = document.querySelector("button.btn-success[type='submit']");
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    
    await sleep(2000);
    const hasAlert = await page.evaluate(() => {
      return document.querySelector('.swal2-popup.swal2-show') !== null;
    });
    
    if (hasAlert) {
      console.error('❌ Error de autenticación: Usuario o contraseña incorrectos');
      await page.evaluate(() => {
        const okBtn = document.querySelector('.swal2-confirm');
        if (okBtn) okBtn.click();
      });
      console.log('⏳ Navegador abierto. Presiona Ctrl+C para detener.');
      await new Promise(() => {});
    }
    
    console.log('✔️ Login OK\n');

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

    if (!iframeFound) {
      console.log('⚠️ Iframe no encontrado');
      await new Promise(() => {});
    }
    
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
    
    if (!frame) {
      console.log('⚠️ Frame no accesible');
      await new Promise(() => {});
    }
    
    console.log('✔️ Frame OK\n');

    console.log('📅 Cargando tabla de días...');
    
    await frame.waitForSelector('#contenido', { timeout: 60000 });
    await sleep(8000);
    
    await frame.waitForFunction(() => {
      const table = document.querySelector('table.mitabla');
      const rows = table?.querySelectorAll('tbody tr.mitabla');
      return rows && rows.length > 0;
    }, { timeout: 90000 });
    
    console.log('✔️ Tabla OK\n');

console.log(`📆 Buscando día: ${tomorrow.fullDate}...`);
    
    const dayInfo = await frame.evaluate((targetFullDate) => {
      const table = document.querySelector('table.mitabla');
      if (!table) {
        return { found: false, message: '❌ No se encontró la tabla de días' };
      }

      const rows = table.querySelectorAll('tbody tr.mitabla');
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const firstCell = row.querySelector('td');
        const dayText = firstCell ? firstCell.textContent.trim().toLowerCase() : '';
        
        if (dayText.includes(targetFullDate.toLowerCase())) {
          const link = row.querySelector('a[onclick*="teeTimeFecha"]');
          const onclick = link ? link.getAttribute('onclick') : null;
          
          return {
            found: true,
            dayText: dayText,
            onclick: onclick,
            rowIndex: i
          };
        }
      }

      return {
        found: false,
        availableDays: Array.from(rows)
          .map(r => r.querySelector('td')?.textContent.trim())
          .filter(Boolean),
        totalRows: rows.length
      };
    }, tomorrow.fullDate);

    if (!dayInfo.found) {
      console.log('⚠️  DÍA NO DISPONIBLE');
      console.log(`   Buscado: ${tomorrow.fullDate}`);
      console.log('⏳ Navegador permanece abierto.');
      await new Promise(() => {});
    }

console.log(`✅ Día encontrado: ${dayInfo.dayText}`);

await frame.evaluate(oc => {
  try { eval(oc); } catch(e) {}
}, dayInfo.onclick);
console.log('✔️ Click ejecutado');

// 🚀 Verificar que el contenedor de horarios existe
console.log('⚡ Verificando contenedor de horarios...');

await frame.waitForSelector('#tee-time', { timeout: 20000 }).catch(() => {
  console.log('❌ No se encontró el contenedor de horarios');
  throw new Error('Contenedor #tee-time no encontrado');
});
console.log('✔️ Contenedor listo\n');

// 🔥 LIMPIAR CACHE ANTES DE ESPERAR
console.log('🧹 Limpiando cache del navegador...');
await frame.evaluate(() => {
  // Limpiar cache
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Limpiar storage (por si acaso)
  try { localStorage.clear(); } catch(e) {}
  try { sessionStorage.clear(); } catch(e) {}
  
  console.log('✅ Cache y storage limpiados');
});

// 🚀 PRE-INYECCIÓN ANTES DE ESPERAR
console.log('╔════════════════════════════════════════════╗');
console.log('║  🚀 BOT LISTO - ESPERANDO 1:59:58 PM  🚀 ║');
console.log('╚════════════════════════════════════════════╝\n');

console.log('🚀 PRE-INYECTANDO Ultra-Speed Clicker V14 ULTRA-DEFINITIVO...');

await frame.evaluate((minHour, minMinute) => {
  window.__clickerActive = false;
  window.__clickerResult = null;
  window.__rafStartTime = 0;
  window.__rafCallCount = 0;
  window.__firstDetectionLogged = false;
  window.__detectionMethod = null;
  window.__buttonHistory = [];
  window.__activationDetected = false;
  window.__clickAttempts = [];
  window.__isVerifying = false;
  
  const MIN_TIME_MINUTES = minHour * 60 + minMinute;
  
  // 🔥 PRE-COMPILAR REGEX PARA MÁXIMA VELOCIDAD
  const timeRegex = /(\d{1,2}):(\d{2})\s*(am|pm)/i;
  
  window.__tryClick = (caller = 'unknown') => {
    if (!window.__clickerActive || window.__isVerifying) return false;
    
    window.__rafCallCount++;
    
    // 🔥 CRÍTICO: SIEMPRE buscar contenedor fresco (NO CACHE)
    const freshContainer = document.querySelector('#tee-time');
    if (!freshContainer) {
      console.log(`⚠️ [${Date.now()}] Contenedor desaparecido`);
      return false;
    }
    
    const buttons = freshContainer.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    
    if (window.__rafCallCount % 50 === 0) {
      console.log(`🔍 [${Date.now()}] RAF #${window.__rafCallCount} | Botones: ${buttons.length}`);
    }
    
    if (buttons.length > 0 && !window.__firstDetectionLogged) {
      console.log(`🎯 [${Date.now()}] ¡HORARIOS ACTIVADOS! ${buttons.length} botones`);
      console.log(`   - Detectado por: ${caller}`);
      console.log(`   - Tiempo: ${Date.now() - window.__rafStartTime}ms`);
      window.__firstDetectionLogged = true;
      window.__detectionMethod = caller;
      window.__activationDetected = true;
      
      window.__buttonHistory = Array.from(buttons).map(btn => {
        const div = btn.querySelector('div');
        return div ? div.innerText.trim() : 'N/A';
      });
      console.log(`   - Horarios:`, window.__buttonHistory);
    }
    
    if (buttons.length === 0) return false;

    const validSlots = [];
    const buttonsArray = Array.from(buttons);
    
    for (let i = 0; i < buttonsArray.length; i++) {
      const btn = buttonsArray[i];
      
      // 🔥 VALIDACIÓN #1: VERIFICAR QUE TIENE DIV
      const div = btn.querySelector('div');
      if (!div) continue;
      
      // 🔥 VALIDACIÓN #2: VERIFICAR QUE TIENE ONCLICK VÁLIDO
      const onclick = btn.getAttribute('onclick');
      if (!onclick || !onclick.includes('xajax_teeTimeDetalle')) {
        console.log(`⚠️ Botón ${i} sin onclick válido - IGNORANDO`);
        continue;
      }
      
      const text = div.innerText;
      
      // 🔥 VALIDACIÓN #3: VERIFICAR REGEX DE TIEMPO
      const match = text.match(timeRegex);
      if (!match) continue;
      
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const p = match[3].toLowerCase();
      
      if (p === 'pm' && h !== 12) h += 12;
      else if (p === 'am' && h === 12) h = 0;
      
      const totalMinutes = h * 60 + m;
      
      // 🔥 VALIDACIÓN #4: VERIFICAR HORARIO >= MIN_TIME
      if (totalMinutes >= MIN_TIME_MINUTES) {
        validSlots.push({
          index: i,
          button: btn,
          text: text.trim(),
          totalMinutes: totalMinutes,
          onclick: onclick
        });
      }
    }
    
    if (validSlots.length === 0) return false;
    
    let slotToTry = null;
    
    // 🔥🔥🔥 ESTRATEGIA ANTI-COMPETENCIA (CRÍTICO) 🔥🔥🔥
    // En el PRIMER intento, elegir ALEATORIO de los primeros 3 slots
    // Esto distribuye la carga y aumenta 33% probabilidad vs otros bots
    if (window.__clickAttempts.length === 0 && validSlots.length >= 3) {
      const topSlots = validSlots.slice(0, 3);
      const randomIndex = Math.floor(Math.random() * topSlots.length);
      slotToTry = topSlots[randomIndex];
      console.log(`🎲 Estrategia anti-competencia: slot ${randomIndex + 1}/3 (${slotToTry.text})`);
    } else {
      // Estrategia normal: elegir el primero no intentado
      for (let i = 0; i < validSlots.length; i++) {
        const slot = validSlots[i];
        const alreadyTried = window.__clickAttempts.some(a => a.text === slot.text && !a.success);
        if (!alreadyTried) {
          slotToTry = slot;
          break;
        }
      }
    }
    
    if (!slotToTry) {
      const failedAttempts = window.__clickAttempts.filter(a => !a.success);
      if (failedAttempts.length >= validSlots.length * 4) {
        console.log(`❌ [${Date.now()}] Todos ocupados después de 4 rondas`);
        window.__clickerActive = false;
        window.__clickerResult = {
          found: false,
          attempts: window.__clickAttempts.length,
          allAttempts: window.__clickAttempts,
          allButtons: window.__buttonHistory
        };
        return false;
      }
      console.log(`⚠️ [${Date.now()}] Ronda ${Math.floor(failedAttempts.length / validSlots.length) + 1}...`);
      slotToTry = validSlots[failedAttempts.length % validSlots.length];
    }
    
    const captureTime = Date.now();
    const rafElapsed = captureTime - window.__rafStartTime;
    
    console.log(`✅ [${captureTime}] ¡INTENTANDO HORARIO!`);
    console.log(`   - Horario: ${slotToTry.text}`);
    console.log(`   - Intento: ${window.__clickAttempts.length + 1}`);
    console.log(`   - Capturado por: ${caller}`);
    console.log(`   - Tiempo: ${rafElapsed}ms`);
    
    const attemptRecord = {
      text: slotToTry.text,
      timestamp: captureTime,
      caller: caller,
      success: false,
      totalSlots: buttons.length,
      verificationChecks: 0
    };
    window.__clickAttempts.push(attemptRecord);
    
    window.__isVerifying = true;
    
    // 🔥 VALIDACIÓN #5: RE-VERIFICAR QUE EL BOTÓN SIGUE EN EL DOM
    const stillExists = document.contains(slotToTry.button);
    if (!stillExists) {
      console.log(`⚠️ [${Date.now()}] Botón desaparecido antes de click - Buscando otro...`);
      window.__isVerifying = false;
      window.__tryClick(caller + '_retry');
      return true;
    }
    
    // 🔥 VALIDACIÓN #6: CLICK CON MANEJO DE ERRORES
    let clickSucceeded = false;
    try {
      slotToTry.button.click();
      clickSucceeded = true;
    } catch (e) {
      console.log(`⚠️ [${Date.now()}] Error en click: ${e.message}`);
    }
    
    // 🔥 SI CLICK FALLÓ, REINTENTAR CON EVAL (MÉTODO ALTERNATIVO)
    if (!clickSucceeded) {
      console.log(`🔄 Reintentando click con eval...`);
      try {
        eval(slotToTry.onclick);
        clickSucceeded = true;
      } catch (e) {
        console.log(`❌ Click alternativo también falló: ${e.message}`);
        window.__isVerifying = false;
        return false;
      }
    }
    
    let checkCount = 0;
    const maxChecks = 50; // 500ms máximo
    
    // ✅ CACHE DE SELECTORES PARA VELOCIDAD
    let cachedFormulario = null;
    let cachedDivContinuar = null;
    
    const rapidCheck = () => {
      checkCount++;
      attemptRecord.verificationChecks = checkCount;
      
      // Usar cache si ya lo encontramos
      if (!cachedFormulario) cachedFormulario = document.querySelector('#selJugadores');
      if (!cachedDivContinuar) cachedDivContinuar = document.querySelector('#divContinuar');
      
      const formulario = cachedFormulario;
      const divContinuar = cachedDivContinuar;
      const stillInSelection = document.querySelector('#tee-time') !== null;
      
      // ✅ VERIFICACIÓN CUÁDRUPLE (más robusta)
      const carritoSelector = document.querySelector('#carritos_alquiler0');
      const tituloReserva = document.body.innerText.includes('Reservar Tee Time') && !stillInSelection;
      
      if (formulario || 
          (divContinuar && divContinuar.style.display !== 'none') ||
          carritoSelector ||
          tituloReserva) {
        
        console.log(`✅ [${Date.now()}] ¡HORARIO CAPTURADO! (${checkCount} checks)`);
        
        attemptRecord.success = true;
        attemptRecord.verificationTime = Date.now();
        attemptRecord.verificationDelay = Date.now() - captureTime;
        
        window.__clickerActive = false;
        window.__isVerifying = false;
        window.__clickerResult = {
          found: true,
          text: slotToTry.text,
          count: buttons.length,
          timestamp: captureTime,
          rafCalls: window.__rafCallCount,
          rafElapsed: rafElapsed,
          detectionMethod: window.__detectionMethod,
          captureMethod: caller,
          allButtons: window.__buttonHistory,
          activationDetected: window.__activationDetected,
          attempts: window.__clickAttempts.length,
          allAttempts: window.__clickAttempts,
          verificationDelay: attemptRecord.verificationDelay,
          verificationChecks: checkCount
        };
        
        if (window.__observerInstance) window.__observerInstance.disconnect();
        if (window.__activationObserver) window.__activationObserver.disconnect();
        
        return;
      }
      
      if (!stillInSelection) {
        console.log(`⚠️ [${Date.now()}] Estado inesperado después de click`);
        window.__isVerifying = false;
        window.__clickerActive = true;
        requestAnimationFrame(window.__ultraPoll);
        return;
      }
      
      if (checkCount < maxChecks) {
        setTimeout(rapidCheck, 10);
      } else {
        // 🔥 VALIDACIÓN #7: VERIFICAR QUE NO ES ERROR DE SERVIDOR
        const serverError = document.body.innerText.match(/error|mantenimiento|no disponible/i);
        const stillHasButtons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]').length > 0;
        
        if (serverError) {
          console.log(`❌ ERROR DE SERVIDOR DETECTADO - DETENIENDO`);
          window.__clickerActive = false;
          window.__isVerifying = false;
          window.__clickerResult = {
            found: false,
            error: 'SERVER_ERROR',
            attempts: window.__clickAttempts.length,
            allAttempts: window.__clickAttempts
          };
          return;
        }
        
        if (!stillHasButtons) {
          console.log(`⚠️ Ya no hay botones disponibles - Todos tomados`);
          window.__clickerActive = false;
          window.__isVerifying = false;
          window.__clickerResult = {
            found: false,
            error: 'NO_BUTTONS',
            attempts: window.__clickAttempts.length,
            allAttempts: window.__clickAttempts
          };
          return;
        }
        
        console.log(`⚠️ [${Date.now()}] Click no funcionó (ocupado), probando siguiente...`);
        
        attemptRecord.success = false;
        attemptRecord.verificationTime = Date.now();
        attemptRecord.verificationDelay = Date.now() - captureTime;
        
        window.__isVerifying = false;
        
        const remainingSlots = validSlots.filter(s => 
          !window.__clickAttempts.some(a => a.text === s.text && !a.success)
        );
        
        if (remainingSlots.length > 0 || window.__clickAttempts.length < validSlots.length * 4) {
          window.__clickerActive = true;
          requestAnimationFrame(window.__ultraPoll);
        } else {
          console.log(`❌ [${Date.now()}] No hay más horarios para intentar`);
          window.__clickerActive = false;
          
          window.__clickerResult = {
            found: false,
            attempts: window.__clickAttempts.length,
            allAttempts: window.__clickAttempts,
            allButtons: window.__buttonHistory
          };
        }
      }
    };
    
    setTimeout(rapidCheck, 15);
    
    return true;
  };

  const teeTimeContainer = document.querySelector('#tee-time');
  if (teeTimeContainer) {
    window.__observerInstance = new MutationObserver((mutations) => {
      if (window.__clickerActive && !window.__isVerifying) {
        window.__tryClick('Observer');
      }
    });
  }
  
  console.log('✅ Código V14 ULTRA-DEFINITIVO inyectado');
  console.log('   - Validaciones: 7 críticas activas');
  console.log('   - Estrategia: Anti-competencia aleatoria');
  console.log('   - Verificación: 50 checks (500ms)');
  
  // ✅ RAF OPTIMIZADO con throttle
  let lastRafTime = 0;
  window.__ultraPoll = () => {
    if (!window.__clickerActive) return;
    
    const now = performance.now();
    if (now - lastRafTime >= 8) { // 125fps
      window.__tryClick('RAF');
      lastRafTime = now;
    }
    
    requestAnimationFrame(window.__ultraPoll);
  };
  
}, TURBO_CONFIG.MIN_HOUR, TURBO_CONFIG.MIN_MINUTE);

console.log('✅ Clicker V14 ULTRA-DEFINITIVO PRE-INYECTADO\n');

// 🔍 DIAGNÓSTICO PRE-REFRESH CON DETECCIÓN DE CACHE VIEJO
console.log('🔍 Diagnóstico pre-refresh...');
const preRefreshDiag = await frame.evaluate(() => {
  const container = document.querySelector('#tee-time');
  const buttons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
  const refreshBtn = document.querySelector('a.refresh');
  const statusText = document.body.innerText;
  const status = statusText.match(/Reservar entre.*?\((ACTIVO|INACTIVO)\)/)?.[1] || 'N/A';
  
  return {
    containerExists: container !== null,
    buttonsCount: buttons.length,
    refreshBtnExists: refreshBtn !== null,
    refreshOnclick: refreshBtn?.getAttribute('onclick') || 'N/A',
    status: status
  };
});

console.log(`   Contenedor: ${preRefreshDiag.containerExists ? '✅' : '❌'}`);
console.log(`   Botones: ${preRefreshDiag.buttonsCount}`);
console.log(`   Refresh btn: ${preRefreshDiag.refreshBtnExists ? '✅' : '❌'}`);
console.log(`   Estado: ${preRefreshDiag.status}`);

// 🔥 DETECTAR CACHE VIEJO
const now = new Date();
const nowColombia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
const currentHour = nowColombia.getHours();
const currentMinute = nowColombia.getMinutes();

// Si estamos ANTES de 2 PM y dice ACTIVO = CACHE VIEJO
if ((currentHour < 14 || (currentHour === 13 && currentMinute < 59)) && 
    preRefreshDiag.status === 'ACTIVO') {
  console.log('   ⚠️⚠️⚠️ ADVERTENCIA: Estado ACTIVO antes de 2 PM = CACHE VIEJO');
  console.log('   🔥 Forzando limpieza TOTAL del cache...');
  
  await frame.evaluate(() => {
    // Limpiar TODO
    if ('caches' in window) {
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
    }
    
    // Limpiar localStorage/sessionStorage
    try { localStorage.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}
    
    console.log('✅ Cache limpiado forzadamente');
  });
  
  console.log('   ✅ Limpieza completada, continuando...');
}

console.log('');

// ⏰ ESPERAR HASTA 1:59:58 PM
console.log('⏰ ESPERANDO HORA EXACTA (1:59:58 PM)...\n');
await waitUntilExactTime(
  TURBO_CONFIG.REFRESH_HOUR,
  TURBO_CONFIG.REFRESH_MINUTE,
  TURBO_CONFIG.REFRESH_SECOND
);

console.log('╔════════════════════════════════════════════╗');
console.log('║      🔥 ¡HORA EXACTA! EJECUTANDO 🔥       ║');
console.log('╚════════════════════════════════════════════╝\n');

const refreshStart = Date.now();
console.log(`⏰ [${refreshStart}] Inicio refresh\n`);

// 🔥 CONFIGURAR Y EJECUTAR REFRESH ANTI-CACHE CON VALIDACIÓN DE ESTADO
const refreshTiming = await frame.evaluate(() => {
  const startTime = Date.now();
  const teeTimeContainer = document.querySelector('#tee-time');
  const preRefreshButtonCount = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]').length;
  
  console.log(`📊 Pre-refresh: ${preRefreshButtonCount} botones`);
  
  window.__activateClicker = () => {
    if (window.__clickerActive) return;
    
    const detectionTime = Date.now();
    const currentButtons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    
    // 🔥🔥🔥 VALIDACIÓN CRÍTICA: VERIFICAR ESTADO ACTIVO 🔥🔥🔥
    const statusText = document.body.innerText;
    const isActive = statusText.match(/\(ACTIVO\)/i);
    
    // Si hay botones pero NO está activo = CACHE VIEJO
    if (currentButtons.length > 0 && !isActive) {
      console.log(`⚠️ [${detectionTime}] Botones detectados pero estado INACTIVO - IGNORANDO (cache viejo)`);
      return;  // ❌ NO ACTIVAR
    }
    
    console.log(`🎯 [${detectionTime}] ¡ACTIVANDO CLICKER!`);
    console.log(`   - Botones: ${currentButtons.length}`);
    console.log(`   - Estado: ACTIVO ✅`);
    console.log(`   - Desde refresh: ${detectionTime - startTime}ms`);
    
    window.__clickerActive = true;
    window.__rafStartTime = detectionTime;
    window.__activationDetected = true;
    window.__isVerifying = false;
    
    const freshContainer = document.querySelector('#tee-time');
    if (freshContainer && window.__observerInstance) {
      // 🔥 DESCONECTAR ANTES DE RECONECTAR (evita duplicados)
      try {
        window.__observerInstance.disconnect();
      } catch(e) {}
      
      try {
        window.__observerInstance.observe(freshContainer, {
          childList: true,
          subtree: true,
          attributes: true
        });
        console.log(`   ✅ Observer ACTIVADO y CONECTADO`);
      } catch(e) {
        console.log(`   ⚠️ Error al activar Observer: ${e.message}`);
      }
    }
    
    requestAnimationFrame(window.__ultraPoll);
    console.log(`   ✅ RAF ACTIVADO`);
    
    window.__tryClick('InitialActivation');
    
    if (window.__activationObserver) {
      window.__activationObserver.disconnect();
    }
  };
  
  window.__activationObserver = new MutationObserver((mutations) => {
    if (window.__clickerActive) return;
    
    const currentButtons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    
    if (currentButtons.length > 0) {
      // 🔥🔥🔥 VALIDAR ESTADO ANTES DE ACTIVAR 🔥🔥🔥
      const statusText = document.body.innerText;
      const isActive = statusText.match(/\(ACTIVO\)/i);
      
      if (!isActive) {
        console.log(`🔔 Observer: ${mutations.length} cambios pero INACTIVO - IGNORANDO`);
        return;  // ❌ Cache viejo
      }
      
      // 🔥 VALIDAR QUE HAY CAMBIO REAL (no solo mutaciones falsas)
      const hasChanged = currentButtons.length !== preRefreshButtonCount;
      const hasAttributeChanges = mutations.some(m => m.type === 'attributes');
      const hasMutations = mutations.length > 0;
      
      if (hasChanged || (hasAttributeChanges && hasMutations)) {
        console.log(`🔔 Observer: ${mutations.length} cambios detectados + ACTIVO ✅`);
        window.__activateClicker();
      }
    }
  });
  
  window.__activationObserver.observe(teeTimeContainer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'onclick'],
    characterData: true
  });
  
  console.log(`   ✅ Observer configurado (ultra-sensible + validación de estado)`);
  
  const preClick = Date.now();
  const refreshBtn = document.querySelector("a.refresh");
  
  if (refreshBtn) {
    console.log(`   🖱️  REFRESH NOW!`);
    console.log(`   🔧 Onclick: ${refreshBtn.getAttribute('onclick')}`);
    
    // ✅✅✅ CLICK CON ANTI-CACHE ✅✅✅
    refreshBtn.click();
    
    const postClick = Date.now();
    console.log(`   ✅ Click ejecutado: ${postClick - preClick}ms`);
    
    // 🔥 SISTEMA SÉXTUPLE HIPER-AGRESIVO CON VALIDACIÓN MEJORADA (50/100/200/400/800/1500ms)
    setTimeout(() => {
      if (!window.__clickerActive && !window.__isVerifying) {
        const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
        const hasChanged = b.length !== preRefreshButtonCount;
        console.log(`⚡⚡⚡⚡⚡ [${Date.now()}] ULTRA-BACKUP 50ms: ${b.length} botones (cambió: ${hasChanged})`);
        if (b.length > 0 && (hasChanged || preRefreshButtonCount === 0)) {
          window.__activateClicker();
        }
      }
    }, 50);
    
    setTimeout(() => {
      if (!window.__clickerActive && !window.__isVerifying) {
        const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
        const hasChanged = b.length !== preRefreshButtonCount;
        console.log(`⚡⚡⚡⚡ [${Date.now()}] BACKUP-1 100ms: ${b.length} botones (cambió: ${hasChanged})`);
        if (b.length > 0 && (hasChanged || preRefreshButtonCount === 0)) {
          window.__activateClicker();
        }
      }
    }, 100);
    
    setTimeout(() => {
      if (!window.__clickerActive && !window.__isVerifying) {
        const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
        const hasChanged = b.length !== preRefreshButtonCount;
        console.log(`⚡⚡⚡ [${Date.now()}] BACKUP-2 200ms: ${b.length} botones (cambió: ${hasChanged})`);
        if (b.length > 0 && (hasChanged || preRefreshButtonCount === 0)) {
          window.__activateClicker();
        }
      }
    }, 200);
    
    setTimeout(() => {
      if (!window.__clickerActive && !window.__isVerifying) {
        const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
        console.log(`⚡⚡ [${Date.now()}] BACKUP-3 400ms: ${b.length} botones`);
        if (b.length > 0) window.__activateClicker();
      }
    }, 400);
    
    setTimeout(() => {
      if (!window.__clickerActive && !window.__isVerifying) {
        const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
        console.log(`⚡ [${Date.now()}] BACKUP-4 800ms: ${b.length} botones`);
        if (b.length > 0) window.__activateClicker();
      }
    }, 800);
    
    setTimeout(() => {
      if (!window.__clickerActive && !window.__isVerifying) {
        const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
        console.log(`⚠️ [${Date.now()}] SAFETY 1500ms: ${b.length} botones`);
        if (b.length > 0) {
          window.__activateClicker();
        } else {
          console.log(`   ❌ CRÍTICO: Horarios NO activados - Posible cache o servidor inactivo`);
        }
      }
    }, 1500);
    
    return {
      started: startTime,
      clicked: postClick,
      duration: postClick - preClick,
      preRefreshButtons: preRefreshButtonCount
    };
  }
  
  return null;
});

console.log(`✔️ Refresh ejecutado: ${refreshTiming.duration}ms`);
console.log('⏳ Esperando captura de horario...\n');

// MONITOREO CON REACTIVACIÓN AUTOMÁTICA
let clicked = false;
let selectedTime = '';
let clickTime = 0;
let pollCount = 0;
const maxWait = 15000;
const pollStart = Date.now();

console.log('📊 MONITOREANDO (15 segundos)...\n');

while (!clicked && (Date.now() - pollStart) < maxWait) {
  pollCount++;
  
  const result = await frame.evaluate(() => window.__clickerResult);
  
  if (result) {
    if (result.found) {
      clicked = true;
      selectedTime = result.text;
      clickTime = result.timestamp;
      
const totalSpeed = clickTime - refreshStart;
      
      console.log('\n╔════════════════════════════════════════════╗');
      console.log('║      💥 ¡HORARIO CAPTURADO! 💥            ║');
      console.log('╚════════════════════════════════════════════╝\n');
      console.log(`⚡ VELOCIDAD:`);
      console.log(`   - Total: ${totalSpeed}ms (${(totalSpeed / 1000).toFixed(3)}s)`);
      console.log(`   - Verificación: ${result.verificationDelay}ms (${result.verificationChecks} checks)`);
      console.log(`   - Refresh: ${refreshTiming.duration}ms\n`);
      
      console.log(`🔬 DETALLE:`);
      console.log(`   - Activación: ${result.activationDetected ? '✅' : '❌'}`);
      console.log(`   - Detección: ${result.detectionMethod}`);
      console.log(`   - Captura: ${result.captureMethod}`);
      console.log(`   - Intentos: ${result.attempts}`);
      console.log(`   - RAF: ${result.rafCalls} llamadas\n`);
      
      if (result.allAttempts && result.allAttempts.length > 1) {
        console.log(`🔄 INTENTOS:`);
        result.allAttempts.forEach((a, i) => {
          console.log(`   ${i + 1}. ${a.text} - ${a.success ? '✅' : '❌'} - ${a.verificationDelay || 'N/A'}ms`);
        });
        console.log('');
      }
      
      console.log(`📅 Día: ${dayInfo.dayText}`);
      console.log(`⏰ Horario: ${result.text}`);
      console.log(`📊 Slots: ${result.count}`);
      console.log('');
      
      break;
    } else if (result.attempts > 0) {
      console.log('\n⚠️  TODOS LOS HORARIOS OCUPADOS\n');
      console.log(`   Intentos: ${result.attempts}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.allAttempts) {
        result.allAttempts.forEach((a, i) => {
          console.log(`   ${i + 1}. ${a.text} - ${a.verificationDelay || 'N/A'}ms`);
        });
      }
      clicked = true;
      break;
    }
  }

  if (pollCount % 100 === 0) {
    const elapsed = Date.now() - pollStart;
    const status = await frame.evaluate(() => ({
      calls: window.__rafCallCount,
      active: window.__clickerActive,
      verifying: window.__isVerifying,
      activation: window.__activationDetected,
      buttons: document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]').length,
      attempts: window.__clickAttempts?.length || 0
    }));
    
    console.log(`⏳ ${(elapsed/1000).toFixed(1)}s | RAF: ${status.calls} | Botones: ${status.buttons} | Intentos: ${status.attempts}`);
    
    // 🔥🔥🔥 DETECTAR DESACTIVACIÓN PREMATURA Y REACTIVAR 🔥🔥🔥
    if (status.buttons > 0 && !status.active && !status.verifying && !result) {
      console.log('⚠️⚠️⚠️ CLICKER DESACTIVADO PREMATURAMENTE - REACTIVANDO...');
      
      await frame.evaluate(() => {
        // Validar estado antes de reactivar
        const statusText = document.body.innerText;
        const isActive = statusText.match(/\(ACTIVO\)/i);
        
        if (isActive) {
          window.__clickerActive = true;
          window.__isVerifying = false;
          window.__rafStartTime = Date.now();
          requestAnimationFrame(window.__ultraPoll);
          window.__tryClick('ManualReactivation');
          console.log('✅ Clicker REACTIVADO');
        } else {
          console.log('⚠️ No se reactivó: estado INACTIVO');
        }
      });
    }
  }

  await new Promise(resolve => setTimeout(resolve, 10));
}

await frame.evaluate(() => {
  window.__clickerActive = false;
  window.__isVerifying = false;
  if (window.__observerInstance) window.__observerInstance.disconnect();
  if (window.__activationObserver) window.__activationObserver.disconnect();
});

if (!clicked) {
  console.log('\n⚠️  NO SE CAPTURÓ HORARIO\n');
  
  const finalStatus = await frame.evaluate(() => {
    const buttons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    const statusText = document.body.innerText;
    const status = statusText.match(/Reservar entre.*?\((ACTIVO|INACTIVO)\)/)?.[1] || 'N/A';
    
    return {
      status: status,
      activationDetected: window.__activationDetected,
      buttonsCount: buttons.length,
      attempts: window.__clickAttempts?.length || 0,
      allAttempts: window.__clickAttempts || [],
      htmlSample: document.body.innerText.substring(0, 1000)
    };
  });
  
  console.log(`   Estado: ${finalStatus.status}`);
  console.log(`   Botones: ${finalStatus.buttonsCount}`);
  console.log(`   Intentos: ${finalStatus.attempts}`);
  console.log(`   Activación: ${finalStatus.activationDetected ? 'SÍ' : 'NO'}`);
  
  if (finalStatus.attempts > 0) {
    console.log('   Horarios intentados:');
    finalStatus.allAttempts.forEach(a => console.log(`      - ${a.text}`));
  }
  
  console.log('\n⏳ Navegador abierto para inspección.');
  await new Promise(() => {});
}
    // ========== FORMULARIO ==========
    console.log('📝 Llenando formulario...\n');
    await sleep(5000);

    console.log('👥 Seleccionando 3 jugadores...');
    
    let jugadoresFound = false;
    for (let retry = 0; retry < 10 && !jugadoresFound; retry++) {
      try {
        await frame.waitForFunction(() => {
          const selJugadores = document.querySelector('#selJugadores');
          return selJugadores !== null;
        }, { timeout: 5000 });
        
        await sleep(1000);
        
        const radioExists = await frame.evaluate(() => {
          const radios = document.querySelectorAll('input[name="num-jugadores"]');
          return radios.length > 0;
        });
        
        if (radioExists) {
          await frame.evaluate(() => {
            const radio3 = document.querySelector('input[name="num-jugadores"][value="3"]');
            if (radio3) {
              radio3.click();
              radio3.checked = true;
              const event = new Event('change', { bubbles: true });
              radio3.dispatchEvent(event);
            }
          });
          
          await sleep(500);
          
          const isChecked = await frame.evaluate(() => {
            const radio3 = document.querySelector('input[name="num-jugadores"][value="3"]');
            return radio3 && radio3.checked;
          });
          
          if (isChecked) {
            jugadoresFound = true;
            console.log('✔️ 3 jugadores seleccionados');
          } else {
            if (retry < 9) console.log(`   ⚠️ Reintento ${retry + 1}/10...`);
            await sleep(2000);
          }
        } else {
          if (retry < 9) console.log(`   ⚠️ Reintento ${retry + 1}/10...`);
          await sleep(2000);
        }
      } catch (e) {
        if (retry < 9) console.log(`   ⚠️ Reintento ${retry + 1}/10...`);
        await sleep(2000);
      }
    }
    
    if (!jugadoresFound) {
      console.log('⚠️ No se pudo seleccionar 3 jugadores');
      await new Promise(() => {});
    }
    
    await sleep(1500);

    console.log('🚗 Sin carro de golf...');
    await frame.waitForSelector('#carritos_alquiler0', { timeout: 10000 });
    await frame.evaluate(() => {
      const radio = document.querySelector('#carritos_alquiler0');
      if (radio) {
        radio.click();
        radio.checked = true;
      }
    });
    console.log('✔️');
    await sleep(1500);

    console.log('💳 Cargo al Carnet...');
    await frame.waitForSelector('#pago2', { timeout: 10000 });
    await frame.evaluate(() => {
      const radio = document.querySelector('#pago2');
      if (radio) {
        radio.click();
        radio.checked = true;
      }
    });
    console.log('✔️');
    await sleep(1500);

    console.log('⏭️  Siguiente...');
    await frame.waitForFunction(() => {
      const div = document.querySelector('#divContinuar');
      return div && div.style.display !== 'none';
    }, { timeout: 10000 });

    await frame.evaluate(() => {
      const btn = document.querySelector('#divContinuar a.ok');
      if (btn) btn.click();
    });
    console.log('✔️\n');
    await sleep(4000);

    // ========== AGREGAR SOCIOS ==========
    console.log('👥 AGREGANDO SOCIOS...');
    await frame.waitForSelector('#formulario', { timeout: 10000 });
    
    await frame.evaluate(() => {
      const radio = document.querySelector('#socio');
      if (radio) {
        radio.click();
        radio.checked = true;
      }
    });
    console.log('✔️ Modo socio activado\n');
    await sleep(800);

    for (let i = 0; i < CODIGOS_SOCIOS.length; i++) {
      let codigo = CODIGOS_SOCIOS[i];
      let agregado = false;
      let intentos = 0;
      
      while (!agregado && intentos < 10) {
        intentos++;
        console.log(`📝 Socio ${i + 1}/2: ${codigo} (intento ${intentos}/10)`);

        await frame.evaluate(() => {
          const radio = document.querySelector('#socio');
          if (radio) {
            radio.click();
            radio.checked = true;
          }
        });
        await sleep(400);

        await frame.evaluate(() => {
          const btn = document.querySelector('a.ok[onclick*="xajax_teeSeleccionJugadores"]');
          if (btn) btn.click();
        });

        await sleep(1800);
        
        try {
          await frame.waitForSelector('#filtro', { timeout: 10000 });
        } catch (e) {
          console.log('   ⚠️ Campo no apareció, reintentando...');
          continue;
        }

        await frame.evaluate(() => {
          const filtro = document.querySelector('#filtro');
          if (filtro) filtro.value = '';
        });

        await sleep(200);
        await frame.type('#filtro', codigo, { delay: 40 });
        await sleep(400);

        await frame.evaluate((cod) => {
          const filtro = document.querySelector('#filtro');
          if (filtro) {
            filtro.value = cod;
            filtro.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, codigo);

        await sleep(2500);

        const result = await frame.evaluate(() => {
          const btn = document.querySelector('#listadoSocios a.ok[onclick*="xajax_teeAgregarJugador"]');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });

        if (result) {
          console.log(`   ✅ Socio agregado correctamente`);
          agregado = true;
          await sleep(2500);
          
          const modalOpen = await frame.evaluate(() => {
            const modal = document.querySelector('#openModal');
            return modal && modal.offsetParent !== null;
          });
          
          if (modalOpen) {
            await frame.evaluate(() => {
              const close = document.querySelector('a.close[href="#close"]');
              if (close) close.click();
            });
            await sleep(800);
          }
        } else {
          console.log(`   ❌ Código no encontrado en el sistema`);
          
          await frame.evaluate(() => {
            const close = document.querySelector('a.close[href="#close"]');
            if (close) close.click();
          });
          await sleep(1000);
          
          console.log(`🔔 CODIGO_ERROR:${i + 1}:${codigo}`);
          console.log(`⏳ Esperando corrección manual (30 segundos)...`);
          await sleep(30000);
          
          console.log('🔄 Reintentando con el mismo código...\n');
        }
      }
     if (!agregado) {
        console.log(`⚠️ No se pudo agregar socio ${i + 1} después de 10 intentos`);
      }
      
      console.log('');
    }

    console.log('🎯 Finalizando reserva...');
    await sleep(2500);

    const finalizar = await frame.waitForFunction(() => {
      const btn = document.querySelector('a.cancel[onclick*="xajax_teeTimeFecha"]');
      return btn !== null;
    }, { timeout: 15000 }).catch(() => false);

    if (finalizar) {
      await frame.evaluate(() => {
        const btn = document.querySelector('a.cancel[onclick*="xajax_teeTimeFecha"]');
        if (btn) btn.click();
      });
      console.log('✔️ Finalizado\n');
      await sleep(4000);
    }
const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🔥 ¡PROCESO COMPLETADO! 🔥              ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`📅 Día: ${dayInfo.dayText}`);
    console.log(`⏰ Horario: ${selectedTime}`);
    console.log(`👥 Socios: ${CODIGOS_SOCIOS.join(', ')}\n`);
    console.log(`⏱️  TIEMPO TOTAL: ${totalTime}s\n`);

    console.log('✅ ¡RESERVA COMPLETADA CON ÉXITO!');
    console.log('⏳ Navegador permanece abierto. Presiona Ctrl+C para detener.');
    await new Promise(() => {});

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('Stack:', err.stack);
    console.log('⏳ Navegador permanece abierto. Presiona Ctrl+C para cerrar.');
    await new Promise(() => {});
  }
}

startSpeedTest();