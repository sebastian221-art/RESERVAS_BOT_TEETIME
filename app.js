// app.js - VERSIÓN MÁXIMA VELOCIDAD + REFRESH + FUNCIONAL
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
  POLL_INTERVAL_MS: 1,
  TARGET_HOUR: 14,
  TARGET_MINUTE: 0,
  SECONDS_BEFORE: 2,
  MAX_ATTEMPTS: 2000,
  MIN_HOUR: MIN_HOUR,
  MIN_MINUTE: MIN_MINUTE
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilExactTime(targetHour, targetMinute, secondsBefore) {
  const now = new Date();
  const nowColombia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  
  const target = new Date(nowColombia);
  target.setHours(targetHour, targetMinute, 0 - secondsBefore, 0);
  
  const waitMs = target - nowColombia;
  
  console.log(`🌎 Hora actual Colombia: ${nowColombia.toLocaleTimeString('es-CO')}`);
  console.log(`🎯 Hora objetivo: ${target.toLocaleTimeString('es-CO')}`);
  
  if (waitMs <= 0) {
    console.log('⚡ Ya pasó la hora objetivo de hoy (2:00 PM)');
    console.log('   El bot debió ejecutarse antes de las 2 PM');
    console.log('   Si quieres reservar para mañana, ejecuta el bot mañana antes de las 2 PM\n');
    
    target.setDate(target.getDate() + 1);
    const newWaitMs = target - nowColombia;
    
    const hours = Math.floor(newWaitMs / 3600000);
    const minutes = Math.floor((newWaitMs % 3600000) / 60000);
    const seconds = Math.floor((newWaitMs % 60000) / 1000);
    
    console.log(`⏰ Esperando hasta MAÑANA ${target.toLocaleTimeString('es-CO')}`);
    console.log(`   (Faltan ${hours} horas ${minutes} min ${seconds} seg)\n`);
    
    await sleep(newWaitMs);
  } else {
    const hours = Math.floor(waitMs / 3600000);
    const minutes = Math.floor((waitMs % 3600000) / 60000);
    const seconds = Math.floor((waitMs % 60000) / 1000);
    
    console.log(`⏰ Esperando hasta HOY ${target.toLocaleTimeString('es-CO')}`);
    
    if (hours > 0) {
      console.log(`   (Faltan ${hours} horas ${minutes} min ${seconds} seg)\n`);
    } else {
      console.log(`   (Faltan ${minutes} min ${seconds} seg)\n`);
    }
    
    await sleep(waitMs);
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
  console.log('║ 🏌️‍♂️ BOT VELOCIDAD MÁXIMA ABSOLUTA 🏌️‍♂️ ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const tomorrow = getTomorrowDate();
  
  console.log('🚀 Configuración VELOCIDAD MÁXIMA:');
  console.log(`   - Usuario: ${USER_CLUB}`);
  console.log(`   - Socios: ${CODIGOS_SOCIOS.join(', ')}`);
  console.log(`   - Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`   - Headless: ${isProduction ? 'SÍ' : 'NO'}`);
  console.log(`   - Polling: ${TURBO_CONFIG.POLL_INTERVAL_MS}ms 🔥🔥🔥`);
  console.log(`   - Horario mínimo: ${MIN_HOUR}:${MIN_MINUTE.toString().padStart(2,'0')} AM`);
  console.log(`   - Día objetivo: ${tomorrow.fullDate}\n`);

  console.log('🤖 Bot iniciado - Esperando hasta las 2:00 PM...\n');

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

    // ⏰ ESPERAR HASTA LAS 1:59:58 PM
    console.log('🕐 Sincronizando con 2:00:00 PM...');
    await waitUntilExactTime(
      TURBO_CONFIG.TARGET_HOUR, 
      TURBO_CONFIG.TARGET_MINUTE, 
      TURBO_CONFIG.SECONDS_BEFORE
    );
    
    console.log('⚡ A 2 SEGUNDOS DE LAS 2 PM - Preparando...\n');
    await sleep(1500);

    // 🔄 HACER REFRESH COMO EN EL ORIGINAL
    console.log('🔄 Haciendo REFRESH...');
    await frame.evaluate(() => {
      const refreshBtn = document.querySelector("a.refresh");
      if (refreshBtn) refreshBtn.click();
    });
    await sleep(500);

    console.log('⚡ SON LAS 2:00:00 PM - POLLING INICIADO!\n');

    // 🔥🔥🔥 VELOCIDAD MÁXIMA - AUTO-CLICKER INYECTADO
    const pollStart = Date.now();
    let clicked = false;
    let selectedTime = '';
    let pollCount = 0;

    // INYECTAR AUTO-CLICKER EN EL NAVEGADOR
    await frame.evaluate((minHour, minMinute) => {
      window.__clickerActive = true;
      window.__clickerResult = null;
      
      window.__autoClicker = function() {
        if (!window.__clickerActive) return;
        
        const buttons = document.querySelectorAll('#tee-time a[onclick*="xajax_teeTimeDetalle"]');
        if (buttons.length === 0) {
          requestAnimationFrame(window.__autoClicker);
          return;
        }

        const candidates = [];
        
        for (const btn of buttons) {
          const div = btn.querySelector('div');
          const text = div ? div.innerText.trim() : '';
          if (!text) continue;
          
          const match = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
          if (!match) continue;
          
          let hour = parseInt(match[1]);
          const minute = parseInt(match[2]);
          const period = match[3].toLowerCase();
          
          if (period === 'pm' && hour !== 12) hour += 12;
          if (period === 'am' && hour === 12) hour = 0;
          
          const timeInMinutes = hour * 60 + minute;
          const minTime = minHour * 60 + minMinute;
          
          if (timeInMinutes >= minTime) {
            candidates.push({
              btn: btn,
              text: text,
              time: timeInMinutes
            });
          }
        }

        if (candidates.length > 0) {
          candidates.sort((a, b) => a.time - b.time);
          const target = candidates[0];
          target.btn.click();
          
          window.__clickerResult = {
            found: true,
            text: target.text,
            count: buttons.length,
            timestamp: Date.now()
          };
          window.__clickerActive = false;
          return;
        }
        
        requestAnimationFrame(window.__autoClicker);
      };
      
      requestAnimationFrame(window.__autoClicker);
    }, TURBO_CONFIG.MIN_HOUR, TURBO_CONFIG.MIN_MINUTE);

    // MONITOREAR RESULTADO
    while (!clicked && pollCount < TURBO_CONFIG.MAX_ATTEMPTS) {
      pollCount++;
      
      const result = await frame.evaluate(() => window.__clickerResult);
      
      if (result && result.found) {
        clicked = true;
        selectedTime = result.text;
        const totalTime = ((Date.now() - pollStart) / 1000).toFixed(3);
        
        console.log('\n🎉 ¡HORARIO CAPTURADO!');
        console.log(`⚡ Tiempo: ${totalTime}s`);
        console.log(`📅 Día: ${dayInfo.dayText}`);
        console.log(`⏰ Horario: ${result.text}\n`);
        
        break;
      }

      if (pollCount === 1) {
        console.log('📊 Auto-clicker activado - buscando slots...');
      }

      if (pollCount % 500 === 0) {
        const elapsed = ((Date.now() - pollStart) / 1000).toFixed(2);
        console.log(`⏳ ${pollCount} checks | ${elapsed}s | Buscando...`);
      }

      await sleep(TURBO_CONFIG.POLL_INTERVAL_MS);
    }

    // DETENER AUTO-CLICKER
    await frame.evaluate(() => {
      window.__clickerActive = false;
    });

    if (!clicked) {
      console.log('\n⚠️  No se capturó horario');
      console.log('⏳ Navegador permanece abierto.');
      await new Promise(() => {});
    }

    // ========== FORMULARIO CON MÁS TIEMPO ==========
    console.log('📝 Llenando formulario...\n');
    await sleep(5000); // MÁS TIEMPO PARA QUE CARGUE

    console.log('👥 3 jugadores...');
    
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
            console.log('✔️');
          } else {
            console.log(`   ⚠️ Reintento ${retry + 1}/10...`);
            await sleep(2000);
          }
        } else {
          console.log(`   ⚠️ Reintento ${retry + 1}/10...`);
          await sleep(2000);
        }
      } catch (e) {
        console.log(`   ⚠️ Reintento ${retry + 1}/10...`);
        await sleep(2000);
      }
    }
    
    if (!jugadoresFound) {
      console.log('⚠️ No se pudo seleccionar 3 jugadores');
      await new Promise(() => {});
    }
    
    await sleep(1500);

    console.log('🚗 Sin carro...');
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
    console.log('👥 OTROS SOCIOS...');
    await frame.waitForSelector('#formulario', { timeout: 10000 });
    
    await frame.evaluate(() => {
      const radio = document.querySelector('#socio');
      if (radio) {
        radio.click();
        radio.checked = true;
      }
    });
    console.log('✔️\n');
    await sleep(800);

    console.log('🔍 AGREGANDO SOCIOS...\n');

    for (let i = 0; i < CODIGOS_SOCIOS.length; i++) {
      let codigo = CODIGOS_SOCIOS[i];
      let agregado = false;
      let intentos = 0;
      
      while (!agregado && intentos < 10) {
        intentos++;
        console.log(`📝 Socio ${i + 1}/2: ${codigo} (intento ${intentos})`);

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
          console.log(`   ✅`);
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
          console.log(`   ❌ Código no encontrado`);
          
          await frame.evaluate(() => {
            const close = document.querySelector('a.close[href="#close"]');
            if (close) close.click();
          });
          await sleep(1000);
          
          console.log(`🔔 CODIGO_ERROR:${i + 1}:${codigo}`);
          console.log(`⏳ Esperando corrección (30 segundos)...`);
          await sleep(30000);
          
          console.log('🔄 Reintentando...\n');
        }
      }
      
      if (!agregado) {
        console.log(`⚠️ Socio ${i + 1} no agregado`);
      }
      
      console.log('');
    }

    console.log('🎯 Finalizando...');
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
      console.log('✔️\n');
      await sleep(4000);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('╔════════════════════════════════════════════╗');
    console.log('║       🎉 ¡RESERVA COMPLETADA! 🎉          ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`📅 Día: ${dayInfo.dayText}`);
    console.log(`⏰ Horario: ${selectedTime}`);
    console.log(`👥 Socios: ${CODIGOS_SOCIOS.join(', ')}`);
    console.log(`⏱️  Tiempo total: ${totalTime}s\n`);

    console.log('⏳ Navegador permanece abierto. Presiona Ctrl+C para detener.');
    await new Promise(() => {});

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.log('⏳ Navegador permanece abierto.');
    await new Promise(() => {});
  }
}

startSpeedTest();
console.log('✅ Bot finalizado correctamente');