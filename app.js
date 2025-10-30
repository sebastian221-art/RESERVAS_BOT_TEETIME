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
  REFRESH_SECOND: 59,
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
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--start-maximized",
      "--disable-blink-features=AutomationControlled"
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
    await sleep(10000);

    console.log('⏳ Cargando horarios...');
    await frame.waitForSelector('#tee-time', { timeout: 60000 });
    console.log('✔️ Horarios cargados\n');

console.log('✔️ Horarios cargados\n');

    // 🔥🔥🔥 ESTRATEGIA ULTRA-OPTIMIZADA: PRE-INYECCIÓN
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  🎯 PRE-INYECCIÓN ULTRA-RÁPIDA 🎯         ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('📍 Estrategia optimizada:');
    console.log('   1. PRE-INYECTAR clicker (ANTES de esperar)');
    console.log('   2. Esperar hasta 1:59:59 PM exacto');
    console.log('   3. ACTIVAR + REFRESH instantáneo (<10ms)');
    console.log('   4. Detectar horarios en <5ms');
    console.log('   5. Click INMEDIATO\n');

    // 🚀 PASO 1: PRE-INYECCIÓN ULTRA-OPTIMIZADA
    console.log('🚀 PRE-INYECTANDO Ultra-Speed Clicker...');
    
    await frame.evaluate((minHour, minMinute) => {
      window.__clickerActive = false;
      window.__clickerResult = null;
      
      const MIN_TIME_MINUTES = minHour * 60 + minMinute;
      const teeTimeContainer = document.querySelector('#tee-time');
      
      // Función ultra-optimizada con selector cacheado
      window.__tryClick = () => {
        if (!window.__clickerActive) return false;
        
        const buttons = teeTimeContainer ? 
          teeTimeContainer.querySelectorAll('a[onclick*="xajax_teeTimeDetalle"]') : [];
          
        if (buttons.length === 0) return false;

        for (let i = 0; i < buttons.length; i++) {
          const div = buttons[i].querySelector('div');
          if (!div) continue;
          
          const text = div.innerText;
          const match = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
          if (!match) continue;
          
          let h = parseInt(match[1]);
          const m = parseInt(match[2]);
          const p = match[3].toLowerCase();
          
          if (p === 'pm' && h !== 12) h += 12;
          else if (p === 'am' && h === 12) h = 0;
          
          if ((h * 60 + m) >= MIN_TIME_MINUTES) {
            buttons[i].click();
            window.__clickerResult = {
              found: true,
              text: text.trim(),
              count: buttons.length,
              timestamp: Date.now()
            };
            window.__clickerActive = false;
            if (window.__observerInstance) window.__observerInstance.disconnect();
            if (window.__intervalInstance) clearInterval(window.__intervalInstance);
            window.__rafActive = false;
            return true;
          }
        }
        return false;
      };

      // Observer pre-configurado
      if (teeTimeContainer) {
        window.__observer = new MutationObserver(() => {
          if (window.__clickerActive) window.__tryClick();
        });
        window.__observerInstance = window.__observer;
      }

      // RAF pre-configurado
      window.__rafActive = false;
      window.__animationLoop = () => {
        if (!window.__rafActive || !window.__clickerActive) return;
        if (window.__tryClick()) return;
        requestAnimationFrame(window.__animationLoop);
      };

      // Interceptor AJAX (detecta ANTES del DOM)
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function() {
        this.addEventListener('readystatechange', function() {
          if (this.readyState === 4 && window.__clickerActive) {
            setTimeout(() => window.__tryClick(), 0);
          }
        });
        return originalOpen.apply(this, arguments);
      };
      
    }, TURBO_CONFIG.MIN_HOUR, TURBO_CONFIG.MIN_MINUTE);
    
    console.log('✅ Clicker PRE-INYECTADO (inactivo)\n');

    //🕐 PASO 2: ESPERAR HASTA 1:59:59 PM
    console.log('🕐 Esperando hasta 1:59:59 PM...\n');
    await waitUntilExactTime(
      TURBO_CONFIG.REFRESH_HOUR, 
      TURBO_CONFIG.REFRESH_MINUTE, 
      TURBO_CONFIG.REFRESH_SECOND
    );
    
    console.log('⚡ ¡ES 1:59:59 PM! ACTIVACIÓN INSTANTÁNEA...\n');
    
    const refreshStart = Date.now();

    // 🔥 PASO 3: TODO EN UNA EJECUCIÓN (MÁXIMA VELOCIDAD)
    await frame.evaluate(() => {
      window.__clickerActive = true;
      
      const teeTimeContainer = document.querySelector('#tee-time');
      if (teeTimeContainer && window.__observerInstance) {
        window.__observerInstance.observe(teeTimeContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      }
      
      window.__rafActive = true;
      requestAnimationFrame(window.__animationLoop);
      
      window.__intervalInstance = setInterval(() => {
        if (window.__clickerActive) window.__tryClick();
      }, 0);
      
      // Hacer refresh
      const refreshBtn = document.querySelector("a.refresh");
      if (refreshBtn) refreshBtn.click();
      
      // Try inmediato
      setTimeout(() => window.__tryClick(), 0);
    });
    
    const refreshTime = Date.now();
    console.log(`✔️ Activación total: ${refreshTime - refreshStart}ms`);
    console.log('⏳ Detectando horarios nuevos...\n');

    // 👀 PASO 4: MONITOREO ULTRA-RÁPIDO
    let clicked = false;
    let selectedTime = '';
    let clickTime = 0;
    let pollCount = 0;
    const maxWait = 10000;
    const pollStart = Date.now();

    while (!clicked && (Date.now() - pollStart) < maxWait) {
      pollCount++;
      
      const result = await frame.evaluate(() => window.__clickerResult);
      
      if (result && result.found) {
        clicked = true;
        selectedTime = result.text;
        clickTime = result.timestamp;
        
        const captureSpeed = clickTime - refreshStart;
        const detectionSpeed = clickTime - refreshTime;
        
        console.log('╔════════════════════════════════════════════╗');
        console.log('║      💥 ¡HORARIO CAPTURADO! 💥            ║');
        console.log('╚════════════════════════════════════════════╝\n');
        console.log(`⚡ VELOCIDAD ULTRA-PRECISA:`);
        console.log(`   - Desde activación: ${captureSpeed}ms`);
        console.log(`   - Detección pura: ${detectionSpeed}ms`);
        console.log(`   - Tiempo total: ${(captureSpeed / 1000).toFixed(3)}s\n`);
        console.log(`📅 Día: ${dayInfo.dayText}`);
        console.log(`⏰ Horario: ${result.text}`);
        console.log(`📊 Total slots: ${result.count}\n`);
        
        break;
      }

      if (pollCount === 1) {
        console.log('🔥 Cuádruple detección activa (Observer+RAF+Interval+AJAX)');
      }

      if (pollCount % 1000 === 0) {
        const elapsed = Date.now() - pollStart;
        console.log(`⏳ ${elapsed}ms | Buscando horarios...`);
      }

      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Limpiar
    await frame.evaluate(() => {
      window.__clickerActive = false;
      window.__rafActive = false;
      if (window.__observerInstance) window.__observerInstance.disconnect();
      if (window.__intervalInstance) clearInterval(window.__intervalInstance);
    });

    if (!clicked) {
      console.log('\n⚠️  No se capturó horario en 10 segundos');
      console.log('   Posibles causas:');
      console.log('   - No hay horarios disponibles >= ' + MIN_HOUR + ':' + MIN_MINUTE);
      console.log('   - Todos los horarios fueron tomados instantáneamente');
      console.log('   - Error en la carga del refresh');
      console.log('⏳ Navegador permanece abierto para inspección.');
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
    const realCaptureTime = clickTime ? ((clickTime - refreshStart) / 1000).toFixed(3) : '0';
    
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   🔥 ¡PROCESO COMPLETADO! 🔥              ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`📅 Día: ${dayInfo.dayText}`);
    console.log(`⏰ Horario: ${selectedTime}`);
    console.log(`👥 Socios: ${CODIGOS_SOCIOS.join(', ')}\n`);
    console.log(`⚡ TIEMPOS FINALES:`);
    console.log(`   - Captura desde 1:59:59 PM: ${realCaptureTime}s`);
    console.log(`   - Proceso total: ${totalTime}s\n`);

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