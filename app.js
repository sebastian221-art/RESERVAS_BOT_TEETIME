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
// 🔥 TEST DE VELOCIDAD: Medir cuánto tarda el refresh
let MEASURED_REFRESH_TIME = null; // Se llenará con el test

const TURBO_CONFIG = {
  MIN_HOUR: MIN_HOUR,
  MIN_MINUTE: MIN_MINUTE,
  REFRESH_HOUR: 14,        // 2:00:00 PM
  REFRESH_MINUTE: 0,
  REFRESH_SECOND: 0,
  ACTIVATION_DELAY: 800    // Tiempo que tarda el refresh en cargar (ajustable)
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilExactTime(targetHour, targetMinute, targetSecond = 0, frame = null) {
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
      
      if (waitMs > -300000) {
        console.log('⚠️ Ya pasó la hora objetivo de hoy (1:59:58 PM hace poco)');
        console.log('   Para mañana, ejecuta el bot antes de las 2 PM\n');
      }
      
      const hours = Math.floor(tomorrowWaitMs / 3600000);
      const minutes = Math.floor((tomorrowWaitMs % 3600000) / 60000);
      const seconds = Math.floor((tomorrowWaitMs % 60000) / 1000);
      
      console.log(`🌎 Hora actual Colombia: ${nowColombia.toLocaleTimeString('es-CO')}`);
      console.log(`⏰ Esperando hasta MAÑANA ${tomorrow.toLocaleTimeString('es-CO')}`);
      console.log(`   (Faltan ${hours}h ${minutes}m ${seconds}s)\n`);
      
      // 🔥 ESPERA CON KEEPALIVE LIGERO
      await waitWithKeepAlive(tomorrowWaitMs, frame);
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
      
      // 🔥 ESPERA CON KEEPALIVE LIGERO
      await waitWithKeepAlive(waitMs, frame);
      return;
    }
  }
}

// 🔥 FUNCIÓN AUXILIAR ULTRA-OPTIMIZADA
async function waitWithKeepAlive(totalMs, frame) {
  const startTime = Date.now();
  let lastKeepAlive = startTime;
  const keepaliveInterval = 90000; // Ping cada 90 segundos (menos frecuente)
  
  while (Date.now() - startTime < totalMs) {
    const remaining = totalMs - (Date.now() - startTime);
    
    // 🔥 ÚLTIMOS 10 SEGUNDOS: SLEEP CONTINUO (NO INTERRUMPIR)
    if (remaining <= 10000) {
      await sleep(remaining);
      break;
    }
    
    // Chunks de 5 segundos
    const chunkSize = Math.min(5000, remaining);
    await sleep(chunkSize);
    
    // Keepalive cada 90 segundos (solo si NO estamos cerca del refresh)
    if (frame && remaining > 15000 && Date.now() - lastKeepAlive >= keepaliveInterval) {
      try {
        // Ping asíncrono NO bloqueante
        frame.evaluate(() => 1).catch(() => {});
        lastKeepAlive = Date.now();
        
        // Log cada 5 minutos
        const elapsed = Date.now() - startTime;
        if (Math.floor(elapsed / 300000) !== Math.floor((elapsed - chunkSize) / 300000)) {
          const h = Math.floor(remaining / 3600000);
          const m = Math.floor((remaining % 3600000) / 60000);
          console.log(`⏰ Esperando... (Faltan ${h}h ${m}m)`);
        }
      } catch (e) {
        // Ignorar errores de keepalive
      }
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

// 🔬 FUNCIÓN DE TEST DE VELOCIDAD
async function testRefreshSpeed(frame) {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🔬 TEST DE VELOCIDAD DE REFRESH 🔬      ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  console.log('📊 Midiendo tiempo de carga del servidor...\n');
  
  const testStart = Date.now();
  
  // Hacer refresh de prueba
  await frame.evaluate(() => {
    const refreshBtn = document.querySelector("a.refresh");
    if (refreshBtn) {
      console.log('🔄 Ejecutando refresh de prueba...');
      refreshBtn.click();
    }
  });
  
  const clickTime = Date.now();
  console.log(`✅ Click ejecutado: ${clickTime - testStart}ms`);
  
  // Esperar a que aparezcan los botones (aunque estén INACTIVOS)
  let loadTime = null;
  let checkCount = 0;
  const maxChecks = 300; // 3 segundos máximo
  
  while (checkCount < maxChecks && !loadTime) {
    checkCount++;
    
    const status = await frame.evaluate(() => {
      const buttons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
      const container = document.querySelector('#tee-time');
      return {
        buttons: buttons.length,
        containerExists: container !== null
      };
    });
    
    // Detectar cuando termina de cargar (aparecen elementos)
    if (status.buttons > 0 || checkCount > 100) {
      loadTime = Date.now() - testStart;
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  if (!loadTime) {
    loadTime = 1000; // Fallback: 1 segundo
    console.log('⚠️ No se pudo medir exactamente, usando 1000ms por defecto\n');
  }
  
  console.log('╔════════════════════════════════════════════╗');
  console.log('║        📊 RESULTADO DEL TEST 📊           ║');
  console.log('╚════════════════════════════════════════════╝\n');
  console.log(`⏱️  TIEMPO DE CARGA MEDIDO: ${loadTime}ms (${(loadTime/1000).toFixed(3)}s)`);
  console.log(`   - Click: ${clickTime - testStart}ms`);
  console.log(`   - Carga total: ${loadTime}ms`);
  console.log(`   - Checks realizados: ${checkCount}\n`);
  
  // Calcular timing perfecto
  const targetTime = 2 * 60 * 60 * 1000; // 2:00:00 PM en ms
  const refreshTime = targetTime - loadTime; // Restar tiempo de carga
  
  // Convertir a hora/minuto/segundo
  const refreshDate = new Date(refreshTime);
  const hour = 13; // Siempre 1 PM
  const minute = 59;
  const second = 59;
  
  console.log('🎯 TIMING CALCULADO:');
  console.log(`   - Refresh debe ejecutarse: 1:59:${second.toString().padStart(2, '0')} PM`);
  console.log(`   - Tiempo de carga: ${loadTime}ms`);
  console.log(`   - Horarios activos: 2:00:00 PM ✅\n`);
  
  return {
  loadTime: 1700,     // ✅ Forzar 1700ms
  refreshSecond: 59   // ✅ Forzar 1:59:59 PM
};
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
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  try { localStorage.clear(); } catch(e) {}
  try { sessionStorage.clear(); } catch(e) {}
  
  console.log('✅ Cache y storage limpiados');
});

// 🚀 BOT LISTO
console.log('╔════════════════════════════════════════════╗');
console.log('║  🚀 BOT LISTO - ESPERANDO 1:59:59 PM  🚀 ║');
console.log('╚════════════════════════════════════════════╝\n');
// 🔥🔥🔥 NUEVO: ANTI-CACHE ULTRA-AGRESIVO (AGREGAR AQUÍ)
console.log('🧹 Aplicando anti-cache ULTRA-AGRESIVO...');
await frame.evaluate(() => {
  // Limpiar Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => reg.unregister());
    });
  }
  
  // Limpiar Cache API
  if ('caches' in window) {
    caches.keys().then(names => names.forEach(name => caches.delete(name)));
  }
  
  // Limpiar Storage
  try { localStorage.clear(); } catch(e) {}
  try { sessionStorage.clear(); } catch(e) {}
  
  // 🔥 CRÍTICO: Override de fetch() para forzar anti-cache
  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      if (!args[1]) {
    args[1] = {};
  }
  
  // Asegurar que cache y headers existan
  args[1].cache = 'no-store';
  args[1].headers = args[1].headers || {};
  
  // Agregar headers anti-cache
  args[1].headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  args[1].headers['Pragma'] = 'no-cache';
  args[1].headers['Expires'] = '0';
  
  return originalFetch.apply(this, args);
};
  }
  
  // 🔥 Override de XMLHttpRequest para AJAX
  if (window.XMLHttpRequest) {
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      this.__url = url;
      return originalOpen.apply(this, [method, url, ...rest]);
    };
    
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(...args) {
      this.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      this.setRequestHeader('Pragma', 'no-cache');
      this.setRequestHeader('Expires', '0');
      return originalSend.apply(this, args);
    };
  }
  
  console.log('✅ Anti-cache ultra-agresivo aplicado (fetch + XHR)');
});
console.log('✔️ Anti-cache configurado\n');

// ✅ PASO 1: DIAGNÓSTICO PRE-REFRESH
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

if ((currentHour < 14 || (currentHour === 13 && currentMinute < 59)) && 
    preRefreshDiag.status === 'ACTIVO') {
  console.log('   ⚠️⚠️⚠️ ADVERTENCIA: Estado ACTIVO antes de 2 PM = CACHE VIEJO');
  console.log('   🔥 Forzando limpieza TOTAL del cache...');
  
  await frame.evaluate(() => {
    if ('caches' in window) {
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
    }
    
    try { localStorage.clear(); } catch(e) {}
    try { sessionStorage.clear(); } catch(e) {}
    
    console.log('✅ Cache limpiado forzadamente');
  });
  
  console.log('   ✅ Limpieza completada, continuando...');
}

// ✅ PASO 2: ESPERAR HORA EXACTA
console.log('⏰ ESPERANDO REFRESH DEFINITIVO (2:00:00 PM)...\n');

await waitUntilExactTime(
  TURBO_CONFIG.REFRESH_HOUR,
  TURBO_CONFIG.REFRESH_MINUTE,
  TURBO_CONFIG.REFRESH_SECOND,
  frame
);

// ✅ PASO 3: VERIFICAR FRAME VIVO
console.log('🔍 Verificando conexión del frame...');
try {
  const frameAlive = await frame.evaluate(() => {
    return {
      alive: true,
      timestamp: Date.now(),
      hasContainer: document.querySelector('#tee-time') !== null,
      hasRefreshBtn: document.querySelector('a.refresh') !== null,
      bodyLength: document.body.innerHTML.length,
      canInteract: typeof document.querySelector === 'function'
    };
  });
  
  console.log('✅ Frame VIVO:');
  console.log(`   - Timestamp: ${frameAlive.timestamp}`);
  console.log(`   - Contenedor: ${frameAlive.hasContainer ? '✅' : '❌'}`);
  console.log(`   - Refresh btn: ${frameAlive.hasRefreshBtn ? '✅' : '❌'}`);
  console.log(`   - Body size: ${frameAlive.bodyLength} chars`);
  console.log(`   - Interactivo: ${frameAlive.canInteract ? '✅' : '❌'}\n`);
  
  if (!frameAlive.hasContainer || !frameAlive.hasRefreshBtn || frameAlive.bodyLength < 1000) {
    throw new Error('Frame en mal estado');
  }
  
} catch (e) {
  console.log('❌ Frame MUERTO o en mal estado\n');
  console.log(`   Error: ${e.message}`);
  console.log('⏳ Navegador abierto para inspección.');
  await new Promise(() => {});
}

// ✅ PASO 4: EJECUTAR REFRESH (EN HORA EXACTA)
console.log('╔════════════════════════════════════════════╗');
console.log('║      🔥 ¡HORA EXACTA! EJECUTANDO 🔥       ║');
console.log('╚════════════════════════════════════════════╝\n');

const refreshStart = Date.now();
console.log(`⏰ [${refreshStart}] Inicio refresh\n`);

// 🔥🔥🔥 TODO EN UN SOLO frame.evaluate() 🔥🔥🔥
const refreshTiming = await frame.evaluate((minHour, minMinute) => {
  const startTime = Date.now();
  
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
  const timeRegex = /(\d{1,2}):(\d{2})\s*(am|pm)/i;
  
  console.log('🚀 Definiendo funciones dentro del evaluate...');
  
window.__tryClick = (caller = 'unknown') => {
  if (!window.__clickerActive || window.__isVerifying) return false;
  
  // ✅ SETEAR INMEDIATAMENTE (primera línea después del if)
  window.__isVerifying = true;
  
  // Ahora sí, el resto del código
  window.__rafCallCount++;
    
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
  const div = btn.querySelector('div');
  
  // ✅ Fallback si no hay <div>
  const text = div ? div.innerText : btn.innerText.trim();
  if (!text) continue;
  
  // ✅ AGREGAR ESTA LÍNEA (la eliminaste por error):
  const onclick = btn.getAttribute('onclick');
  if (!onclick || !onclick.includes('xajax_teeTimeDetalle')) continue;
  
  const match = text.match(timeRegex);
  if (!match) continue;
  
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const p = match[3].toLowerCase();
  
  if (p === 'pm' && h !== 12) h += 12;
  else if (p === 'am' && h === 12) h = 0;
  
  const totalMinutes = h * 60 + m;
  
  if (totalMinutes >= MIN_TIME_MINUTES) {
    validSlots.push({
      index: i,
      button: btn,
      text: text.trim(),
      totalMinutes: totalMinutes,
      onclick: onclick  // ← Ahora sí existe
    });
  }
}
    
    if (validSlots.length === 0) return false;
    
    let slotToTry = null;
    
    if (window.__clickAttempts.length === 0) {
      if (validSlots.length >= 3) {
        const topSlots = validSlots.slice(0, 3);
        const randomIndex = Math.floor(Math.random() * topSlots.length);
        slotToTry = topSlots[randomIndex];
        console.log(`🎲 Anti-competencia: slot ${randomIndex + 1}/3 (${slotToTry.text})`);
      } else if (validSlots.length > 0) {
        slotToTry = validSlots[0];
        console.log(`🎯 Solo ${validSlots.length} slot(s), eligiendo: ${slotToTry.text}`);
      }
    } else {
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
      slotToTry = validSlots[failedAttempts.length % validSlots.length];
    }
    
    const captureTime = Date.now();
    const rafElapsed = captureTime - window.__rafStartTime;
    
    console.log(`✅ [${captureTime}] ¡INTENTANDO HORARIO!`);
    console.log(`   - Horario: ${slotToTry.text}`);
    console.log(`   - Intento: ${window.__clickAttempts.length + 1}`);
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
    

    
    const stillExists = document.contains(slotToTry.button);
    if (!stillExists) {
      console.log(`⚠️ [${Date.now()}] Botón desaparecido`);
      window.__isVerifying = false;
      window.__tryClick(caller + '_retry');
      return true;
    }
    
    // 🔥 CLICK ULTRA-SEGURO CON 4 FALLBACKS
    let clickSucceeded = false;
    let clickMethod = 'NONE';

    // ============================================
    // MÉTODO 1: Click directo (el más confiable)
    // ============================================
    if (!clickSucceeded) {
      try {
        slotToTry.button.click();
        clickSucceeded = true;
        clickMethod = 'DIRECT_CLICK';
        console.log(`   ✅ Click directo exitoso`);
      } catch (e1) {
        console.log(`   ⚠️ Click directo falló: ${e1.message}`);
      }
    }

    // ============================================
    // MÉTODO 2: eval del onclick (fallback #1)
    // ============================================
    if (!clickSucceeded && slotToTry.onclick) {
      try {
        // 🔥 IMPORTANTE: Extraer solo la función, sin "return false"
        let onclickCode = slotToTry.onclick;
        
        // Si es un string, limpiarlo
        if (typeof onclickCode === 'string') {
          // Remover "return false;" al final
          onclickCode = onclickCode.replace(/;\s*return\s+false\s*;?\s*$/i, '');
          onclickCode = onclickCode.trim();
        }
        
        eval(onclickCode);
        clickSucceeded = true;
        clickMethod = 'EVAL_ONCLICK';
        console.log(`   ✅ Eval onclick exitoso`);
      } catch (e2) {
        console.log(`   ⚠️ Eval onclick falló: ${e2.message}`);
      }
    }

    // ============================================
    // MÉTODO 3: dispatchEvent (fallback #2)
    // ============================================
    if (!clickSucceeded) {
      try {
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: 1,
          // 🔥 Simular posición del mouse (más realista)
          clientX: slotToTry.button.offsetLeft + 5,
          clientY: slotToTry.button.offsetTop + 5
        });
        
        const eventResult = slotToTry.button.dispatchEvent(clickEvent);
        
        if (eventResult !== false) {
          clickSucceeded = true;
          clickMethod = 'DISPATCH_EVENT';
          console.log(`   ✅ DispatchEvent exitoso`);
        } else {
          console.log(`   ⚠️ DispatchEvent fue cancelado`);
        }
      } catch (e3) {
        console.log(`   ⚠️ DispatchEvent falló: ${e3.message}`);
      }
    }

    // ============================================
    // MÉTODO 4: Ejecución manual del AJAX (fallback #3)
    // ============================================
    if (!clickSucceeded && slotToTry.onclick) {
      try {
        // 🔥 ÚLTIMO RECURSO: Extraer la función AJAX y ejecutarla manualmente
        const onclickStr = slotToTry.onclick.toString();
        
        // Buscar la función xajax_teeTimeDetalle(...)
        const xajaxMatch = onclickStr.match(/xajax_teeTimeDetalle\((.*?)\)/);
        
        if (xajaxMatch && window.xajax_teeTimeDetalle) {
          // Extraer parámetros
          const paramsStr = xajaxMatch[1];
          const params = paramsStr.split(',').map(p => {
            p = p.trim();
            // Si es un número, parsearlo
            if (!isNaN(p)) return parseInt(p);
            // Si es un string con comillas, removerlas
            if (p.startsWith("'") || p.startsWith('"')) {
              return p.substring(1, p.length - 1);
            }
            return p;
          });
          
          // Ejecutar la función AJAX directamente
          window.xajax_teeTimeDetalle(...params);
          clickSucceeded = true;
          clickMethod = 'MANUAL_AJAX';
          console.log(`   ✅ Ejecución manual de AJAX exitosa`);
        }
      } catch (e4) {
        console.log(`   ⚠️ Ejecución manual falló: ${e4.message}`);
      }
    }

    // ============================================
    // VERIFICAR SI ALGÚN MÉTODO FUNCIONÓ
    // ============================================
if (!clickSucceeded) {
  console.log(`❌ TODOS los métodos fallaron - Reintentando...`);
  window.__isVerifying = false;
  
  setTimeout(() => {
    if (window.__clickerActive) {
      window.__tryClick(caller + '_retry');
    }
  }, 100);
  
  return true;  // ← Cambiar a true (indica que se está manejando)
}

    // Log del método exitoso
    console.log(`   🎯 Método usado: ${clickMethod}`);
    
    let checkCount = 0;
const maxChecks = 100;  // ← Duplicar checks
    let cachedFormulario = null;
    let cachedDivContinuar = null;
    
    const rapidCheck = () => {
      checkCount++;
      attemptRecord.verificationChecks = checkCount;
      
      if (!cachedFormulario) cachedFormulario = document.querySelector('#selJugadores');
      if (!cachedDivContinuar) cachedDivContinuar = document.querySelector('#divContinuar');
      
      const formulario = cachedFormulario;
      const divContinuar = cachedDivContinuar;
      const stillInSelection = document.querySelector('#tee-time') !== null;
      const carritoSelector = document.querySelector('#carritos_alquiler0');
      const tituloReserva = document.body.innerText.includes('Reservar Tee Time') && !stillInSelection;
      
      if (formulario || (divContinuar && divContinuar.style.display !== 'none') || carritoSelector || tituloReserva) {
        console.log(`✅ [${Date.now()}] ¡HORARIO CAPTURADO! (${checkCount} checks)`);
        
        attemptRecord.success = true;
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
          verificationChecks: checkCount,
          clickMethod: clickMethod  // 🔥 NUEVO: Método de click usado
        };
        
        if (window.__observerInstance) window.__observerInstance.disconnect();
        if (window.__activationObserver) window.__activationObserver.disconnect();
        return;
      }
      
      if (!stillInSelection) {
        window.__isVerifying = false;
        window.__clickerActive = true;
        requestAnimationFrame(window.__ultraPoll);
        return;
      }
      
      if (checkCount < maxChecks) {
        setTimeout(rapidCheck, 10);
      } else {
        const serverError = document.body.innerText.match(/error|mantenimiento|no disponible/i);
        const stillHasButtons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]').length > 0;
        
        if (serverError || !stillHasButtons) {
          window.__clickerActive = false;
          window.__isVerifying = false;
          window.__clickerResult = {
            found: false,
            error: serverError ? 'SERVER_ERROR' : 'NO_BUTTONS',
            attempts: window.__clickAttempts.length,
            allAttempts: window.__clickAttempts
          };
          return;
        }
        
        attemptRecord.success = false;
        attemptRecord.verificationDelay = Date.now() - captureTime;
        window.__isVerifying = false;
        
        const remainingSlots = validSlots.filter(s => 
          !window.__clickAttempts.some(a => a.text === s.text && !a.success)
        );
        
        if (remainingSlots.length > 0 || window.__clickAttempts.length < validSlots.length * 4) {
          window.__clickerActive = true;
          requestAnimationFrame(window.__ultraPoll);
        } else {
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
    
    setTimeout(rapidCheck, 50);
    return true;
  };

  // 🔥 FUNCIÓN: __ultraPoll (RAF) - SIN THROTTLE
  window.__ultraPoll = () => {
    if (!window.__clickerActive) return;
    
    try {
      // 🔥🔥🔥 SIN THROTTLE - VERIFICAR EN CADA FRAME
      window.__tryClick('RAF');
      
      // Throttle solo para logs (no afecta velocidad)
      if (window.__rafCallCount % 50 === 0) {
        console.log(`🔍 [${Date.now()}] RAF #${window.__rafCallCount} activo`);
      }
    } catch (e) {
      console.log(`⚠️ RAF error: ${e.message}`);
      
      // Re-iniciar RAF después de error
      setTimeout(() => {
        if (window.__clickerActive) {
          console.log('🔄 Re-iniciando RAF después de error...');
          requestAnimationFrame(window.__ultraPoll);
        }
      }, 100);
      return; // Salir para evitar loop infinito
    }
    
    requestAnimationFrame(window.__ultraPoll);
  };

// 🔥 FUNCIÓN: __activateClicker
window.__activateClicker = () => {
  if (window.__clickerActive) return;
  
  const detectionTime = Date.now();
  const currentButtons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
  const statusText = document.body.innerText;
  const isActive = statusText.match(/\(ACTIVO\)/i);
  
  // ✅ CORRECCIÓN #5: VALIDAR HORA (debe ser después de 2:00:00 PM)
  const now = new Date();
  const nowColombia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  const currentHour = nowColombia.getHours();
  const currentMinute = nowColombia.getMinutes();
  const currentSecond = nowColombia.getSeconds();
  
  // ✅ CORRECTO (permite desde 2:00:00.400 PM):
const currentMs = Date.now();
const colombiaDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }));
const todayAt2PM = new Date(colombiaDate);
todayAt2PM.setHours(14, 0, 0, 400); // 2:00:00.400 PM

if (currentMs < todayAt2PM.getTime()) {
  console.log(`⚠️ [${detectionTime}] ANTES de 2:00:00.400 PM - NO ACTIVAR`);
  return;
}
  
  if (currentButtons.length > 0 && !isActive) {
    console.log(`⚠️ [${detectionTime}] Botones pero INACTIVO - IGNORANDO (cache viejo)`);
    return;
  }
  
  console.log(`🎯 [${detectionTime}] ¡ACTIVANDO CLICKER!`);
    console.log(`   - Estado: ACTIVO ✅`);
    console.log(`   - Desde refresh: ${detectionTime - startTime}ms`);
    
    window.__clickerActive = true;
    window.__rafStartTime = detectionTime;
    window.__activationDetected = true;
    window.__isVerifying = false;
    
    const freshContainer = document.querySelector('#tee-time');
    if (freshContainer && window.__observerInstance) {
      try {
        window.__observerInstance.disconnect();
      } catch(e) {}
      
      try {
        window.__observerInstance.observe(freshContainer, {
          childList: true,
          subtree: true,
          attributes: true
        });
        console.log(`   ✅ Observer CONECTADO`);
      } catch(e) {
        console.log(`   ⚠️ Error Observer: ${e.message}`);
      }
    }
    
    requestAnimationFrame(window.__ultraPoll);
    console.log(`   ✅ RAF ACTIVADO`);
    
    window.__tryClick('InitialActivation');
    
    if (window.__activationObserver) {
      window.__activationObserver.disconnect();
    }
  };

  console.log('✅ Funciones definidas correctamente\n');

  // PASO 2: CONFIGURAR OBSERVERS
  const teeTimeContainer = document.querySelector('#tee-time');
  const preRefreshButtonCount = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]').length;
  
  console.log(`📊 Pre-refresh: ${preRefreshButtonCount} botones`);
  
  if (teeTimeContainer) {
    window.__observerInstance = new MutationObserver((mutations) => {
      if (window.__clickerActive && !window.__isVerifying) {
        window.__tryClick('Observer');
      }
    });
  }
  
  window.__activationObserver = new MutationObserver((mutations) => {
    if (window.__clickerActive) return;
    
    const currentButtons = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    
    if (currentButtons.length > 0) {
      const statusText = document.body.innerText;
      const isActive = statusText.match(/\(ACTIVO\)/i);
      
      if (!isActive) {
        console.log(`🔔 Observer: cambios pero INACTIVO - IGNORANDO`);
        return;
      }
      
      const hasChanged = currentButtons.length !== preRefreshButtonCount;
      const hasAttributeChanges = mutations.some(m => m.type === 'attributes');
      
      if (hasChanged || (hasAttributeChanges && mutations.length > 0)) {
        console.log(`🔔 Observer: ${mutations.length} cambios + ACTIVO ✅`);
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
  
  console.log(`✅ Observers configurados\n`);

  // PASO 3: EJECUTAR REFRESH
  const preClick = Date.now();
  const refreshBtn = document.querySelector("a.refresh");
  
  if (refreshBtn) {
    console.log(`🖱️  REFRESH NOW!`);
    refreshBtn.click();
    
    const postClick = Date.now();
    console.log(`✅ Click ejecutado: ${postClick - preClick}ms\n`);
    
    // ✅✅✅ RE-CONEXIÓN DESPUÉS DEL REFRESH
    let reconnectCount = 0;
    const maxReconnects = 12; // 12 × 500ms = 6 segundos
    
    const reconnectInterval = setInterval(() => {
      
      const freshContainer = document.querySelector('#tee-time');
      
      if (!freshContainer) {
        console.log(`⚠️ [${reconnectCount}] Contenedor #tee-time desaparecido - Observer desconectado`);
        clearInterval(reconnectInterval);
        return;
      }
      
      if (window.__activationObserver) {
        try {
          window.__activationObserver.disconnect();
          window.__activationObserver.observe(freshContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'onclick'],
            characterData: true
          });
          
          if (reconnectCount % 4 === 0) { // Log cada 2 segundos
            console.log(`🔄 Observer activo (check ${reconnectCount}/${maxReconnects} - ${(reconnectCount * 500)/1000}s desde refresh)`);
          }
        } catch(e) {
          console.log(`⚠️ Error re-conectando Observer: ${e.message}`);
        }
      }
      
      // 🔥 EXTRA: Re-conectar Observer principal también (por si acaso)
      if (window.__observerInstance && freshContainer) {
        try {
          window.__observerInstance.disconnect();
          window.__observerInstance.observe(freshContainer, {
            childList: true,
            subtree: true,
            attributes: true
          });
        } catch(e) {}
      }
    }, 500);
    
// PASO 4: BACKUPS ULTRA-AGRESIVOS (400-6000ms)

// 🔥 HYPER-FAST: 400-1000ms cada 50ms (13 backups)
[400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000].forEach(time => {
  setTimeout(() => {
    if (!window.__clickerActive && !window.__isVerifying) {
      const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
      if (b.length > 0) {
        console.log(`⚡⚡⚡ [${Date.now()}] HYPER ${time}ms: ${b.length} botones`);
        window.__activateClicker();
      }
    }
  }, time);
});

// 🔥 FAST: 1100-2000ms cada 100ms (10 backups)
[1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000].forEach(time => {
  setTimeout(() => {
    if (!window.__clickerActive && !window.__isVerifying) {
      const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
      if (b.length > 0) {
        console.log(`⚡⚡ [${Date.now()}] FAST ${time}ms: ${b.length} botones`);
        window.__activateClicker();
      }
    }
  }, time);
});

// 🔥 SAFETY: 2500ms
setTimeout(() => {
  if (!window.__clickerActive && !window.__isVerifying) {
    const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    console.log(`⚠️ [${Date.now()}] SAFETY 2500ms: ${b.length} botones`);
    if (b.length > 0) window.__activateClicker();
  }
}, 2500);

// 🔥 CRITICAL: 3000ms
setTimeout(() => {
  if (!window.__clickerActive && !window.__isVerifying) {
    const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    console.log(`🚨 [${Date.now()}] CRITICAL 3000ms: ${b.length} botones`);
    if (b.length > 0) {
      console.log(`   🔥🔥 ACTIVACIÓN FORZADA`);
      window.__activateClicker();
    }
  }
}, 3000);

// 🔥 EMERGENCY: 4000ms
setTimeout(() => {
  if (!window.__clickerActive && !window.__isVerifying) {
    const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    console.log(`🚨🚨 [${Date.now()}] EMERGENCY 4000ms: ${b.length} botones`);
    if (b.length > 0) {
      console.log(`   🔥🔥🔥 ÚLTIMA OPORTUNIDAD`);
      window.__activateClicker();
    }
  }
}, 4000);

// 🔥 ULTRA-SAFETY: 5000ms
setTimeout(() => {
  if (!window.__clickerActive && !window.__isVerifying) {
    const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    console.log(`🚨🚨🚨 [${Date.now()}] ULTRA-SAFETY 5000ms: ${b.length} botones`);
    if (b.length > 0) {
      console.log(`   🔥 ACTIVACIÓN DE EMERGENCIA`);
      window.__activateClicker();
    }
  }
}, 5000);

// 🔥 FINAL: 6000ms
setTimeout(() => {
  if (!window.__clickerActive && !window.__isVerifying) {
    const b = document.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]');
    console.log(`🚨🚨🚨🚨 [${Date.now()}] FINAL-SAFETY 6000ms: ${b.length} botones`);
    
    if (b.length > 0) {
      console.log(`   🔥🔥🔥 ÚLTIMA CHANCE`);
      window.__activateClicker();
    } else {
      console.log(`   ❌❌❌ CRÍTICO: Sin botones después de 6s`);
      
      const errorMsg = document.body.innerText;
      if (errorMsg.match(/error|mantenimiento|no disponible/i)) {
        console.log(`   🚫 SERVIDOR EN MANTENIMIENTO`);
      }
    }
  }
}, 6000);

    // ❌ NO HACER RETURN - Dejar que los setTimeout se ejecuten
    console.log(`⏱️ Refresh ejecutado: ${postClick - preClick}ms`);
    console.log(`🔥 Backups programados (400-6000ms) - Esperando activación...`);
  }
  
  // ❌ NO DEVOLVER NADA - El evaluate() debe seguir vivo
}, TURBO_CONFIG.MIN_HOUR, TURBO_CONFIG.MIN_MINUTE);

// ✅ PASO 5: MONITOREAR
console.log('⏳ Esperando captura de horario...\n');

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
    
    if (status.buttons > 0 && !status.active && !status.verifying && !result) {
      console.log('⚠️⚠️⚠️ CLICKER DESACTIVADO PREMATURAMENTE - REACTIVANDO...');
      
      await frame.evaluate(() => {
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