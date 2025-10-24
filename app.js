// app.js - VERSIÓN SIN WHATSAPP/TWILIO
import 'dotenv/config';
import puppeteer from 'puppeteer';

const USER_CLUB = process.argv[2] || process.env.USER_CLUB;
const PASS_CLUB = process.argv[3] || process.env.PASS_CLUB;
const CODIGO_SOCIO_1 = process.argv[4] || process.env.CODIGO_SOCIO_1;
const CODIGO_SOCIO_2 = process.argv[5] || process.env.CODIGO_SOCIO_2;

if (!USER_CLUB || !PASS_CLUB || !CODIGO_SOCIO_1 || !CODIGO_SOCIO_2) {
  throw new Error('❌ Faltan credenciales');
}

const CODIGOS_SOCIOS = [CODIGO_SOCIO_1, CODIGO_SOCIO_2];

const TURBO_CONFIG = {
  POLL_INTERVAL_MS: 100,
  CLICK_DELAY_MS: 30,
  TARGET_HOUR: 14,
  TARGET_MINUTE: 0,
  SECONDS_BEFORE: 2,
  MAX_ATTEMPTS: 200,
  MIN_HOUR: 6,
  MIN_MINUTE: 10
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilExactTime(targetHour, targetMinute, secondsBefore) {
  // ✅ FORZAR ZONA HORARIA DE COLOMBIA (America/Bogota = UTC-5)
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
  console.log('║   🏌️‍♂️  BOT TEE TIME - ULTRA-RÁPIDO 🏌️‍♂️    ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const tomorrow = getTomorrowDate();
  
  console.log('⚡ Configuración:');
  console.log(`   - Usuario: ${USER_CLUB}`);
  console.log(`   - Socios: ${CODIGOS_SOCIOS.join(', ')}`);
  console.log(`   - Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`   - Headless: ${isProduction ? 'SÍ' : 'NO'}`);
  console.log(`   - Polling: ${TURBO_CONFIG.POLL_INTERVAL_MS}ms`);
  console.log(`   - Horario mínimo: 6:10 AM`);
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
      "--disable-software-rasterizer",
      "--disable-extensions",
      "--start-maximized",
      "--disable-blink-features=AutomationControlled"
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
                    (process.platform === "linux"
                      ? "/usr/bin/google-chrome-stable"
                      : puppeteer.executablePath()),
    timeout: 0
  });

  console.log('✅ Navegador iniciado (modo headless moderno)\n');

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
      const btn = document.querySelector("button.btn-success[type='submit'], button.btn-success");
      if (btn) btn.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
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
    
    // Buscar el día correcto dentro del iframe


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
    
    // 🔹 Buscar coincidencia con la fecha completa (ej: "25 de octubre")
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

  // 🔹 Si no se encuentra, devolver info útil para debug
  return {
    found: false,
    availableDays: Array.from(rows)
      .map(r => r.querySelector('td')?.textContent.trim())
      .filter(Boolean),
    totalRows: rows.length
  };
}, tomorrow.fullDate);

if (!dayInfo.found) {
  console.error('❌ Día no encontrado. Días disponibles:', dayInfo.availableDays);
  throw new Error('No se encontró el día correcto en la tabla.');
}



    if (!dayInfo.found) {
      console.log('⚠️  DÍA NO DISPONIBLE');
      console.log(`   Buscado: ${tomorrow.fullDate}`);
      console.log(`   Días disponibles en tabla: ${dayInfo.totalRows}`);
      if (dayInfo.availableDays.length > 0) {
        console.log(`   Días encontrados:`);
        dayInfo.availableDays.forEach((day, i) => {
          console.log(`      ${i + 1}. ${day}`);
        });
      }
      console.log('');
      
      await browser.close();
      console.log('✅ Navegador cerrado');
      return;
    }

    console.log(`✅ Día encontrado: ${dayInfo.dayText}`);
    
    await frame.evaluate(oc => {
      try { eval(oc); } catch(e) {
        console.error('Error ejecutando onclick:', e);
      }
    }, dayInfo.onclick);

    console.log('✔️ Click ejecutado');
    await sleep(10000);

    console.log('⏳ Cargando horarios...');
    await frame.waitForSelector('#tee-time', { timeout: 60000 });
    console.log('✔️ Horarios cargados\n');

    console.log('🕐 Sincronizando con 2:00:00 PM...');
    await waitUntilExactTime(
      TURBO_CONFIG.TARGET_HOUR, 
      TURBO_CONFIG.TARGET_MINUTE, 
      TURBO_CONFIG.SECONDS_BEFORE
    );
    
    console.log('⚡ A 2 SEGUNDOS DE LAS 2 PM - Preparando...\n');
    await sleep(1500);

    console.log('🔄 Haciendo REFRESH...');
    await frame.evaluate(() => {
      const refreshBtn = document.querySelector("a.refresh");
      if (refreshBtn) refreshBtn.click();
    });
    await sleep(500);

    console.log('⚡ SON LAS 2:00:00 PM - POLLING INICIADO!\n');
    
    const pollStart = Date.now();
    let clicked = false;
    let selectedTime = '';
    let pollCount = 0;

    for (let attempt = 1; attempt <= TURBO_CONFIG.MAX_ATTEMPTS && !clicked; attempt++) {
      pollCount++;

      const candidates = await frame.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#tee-time a[onclick*="xajax_teeTimeDetalle"]'));
        
        return buttons.map(btn => {
          const onclick = btn.getAttribute('onclick');
          const div = btn.querySelector('div');
          const text = div ? div.innerText.trim() : '';
          
          return {
            onclick: onclick,
            text: text
          };
        }).filter(b => b.text.length > 0);
      });

      if (candidates.length > 0) {
        if (pollCount === 1 || (pollCount > 1 && attempt === 1)) {
          console.log(`📊 ${candidates.length} slots detectados!`);
        }

        const available = candidates.filter(c => {
          const match = c.text.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
          if (!match) return false;
          
          let hour = parseInt(match[1]);
          const minute = parseInt(match[2]);
          const period = match[3].toLowerCase();
          
          if (period === 'pm' && hour !== 12) hour += 12;
          if (period === 'am' && hour === 12) hour = 0;
          
          const timeInMinutes = hour * 60 + minute;
          const minTime = TURBO_CONFIG.MIN_HOUR * 60 + TURBO_CONFIG.MIN_MINUTE;
          
          return timeInMinutes >= minTime;
        });
        
        available.sort((a, b) => {
          const matchA = a.text.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
          const matchB = b.text.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
          
          if (!matchA || !matchB) return 0;
          
          let hourA = parseInt(matchA[1]);
          const minA = parseInt(matchA[2]);
          const periodA = matchA[3].toLowerCase();
          
          let hourB = parseInt(matchB[1]);
          const minB = parseInt(matchB[2]);
          const periodB = matchB[3].toLowerCase();
          
          if (periodA === 'pm' && hourA !== 12) hourA += 12;
          if (periodA === 'am' && hourA === 12) hourA = 0;
          if (periodB === 'pm' && hourB !== 12) hourB += 12;
          if (periodB === 'am' && hourB === 12) hourB = 0;
          
          const timeA = hourA * 60 + minA;
          const timeB = hourB * 60 + minB;
          
          return timeA - timeB;
        });

        if (available.length > 0) {
          const target = available[0];
          console.log(`⚡ Intento ${attempt} (${pollCount} polls): ${target.text}`);

          const clickSuccess = await frame.evaluate((targetOnclick) => {
            const buttons = Array.from(document.querySelectorAll('#tee-time a[onclick*="xajax_teeTimeDetalle"]'));
            const targetBtn = buttons.find(btn => btn.getAttribute('onclick') === targetOnclick);
            if (targetBtn) {
              targetBtn.click();
              return true;
            }
            return false;
          }, target.onclick);

          if (clickSuccess) {
            clicked = true;
            selectedTime = target.text;
            const totalTime = ((Date.now() - pollStart) / 1000).toFixed(3);
            
            console.log('\n🎉 ¡HORARIO CAPTURADO!');
            console.log(`⚡ Tiempo: ${totalTime}s`);
            console.log(`📊 Polls: ${pollCount}`);
            console.log(`📅 Día: ${dayInfo.dayText}`);
            console.log(`⏰ Horario: ${target.text}\n`);
            
            break;
          }
        }
      }

      if (pollCount % 20 === 0 && candidates.length === 0) {
        const elapsed = ((Date.now() - pollStart) / 1000).toFixed(1);
        console.log(`⏳ ${pollCount} polls | ${elapsed}s | Esperando...`);
      }

      await sleep(TURBO_CONFIG.POLL_INTERVAL_MS);
    }

    if (!clicked) {
      console.log('\n⚠️  No se capturó horario');
      console.log('No se encontró ningún horario >= 6:10 AM.');
      
      await browser.close();
      console.log('✅ Navegador cerrado');
      return;
    }

    console.log('📝 Llenando formulario...\n');
    await sleep(2000);

    console.log('👥 3 jugadores...');
await frame.waitForSelector('input[name="num-jugadores"]', { timeout: 20000 });
await frame.evaluate(() => {
  const radio3 = document.querySelector('input[name="num-jugadores"][value="3"]');
  if (radio3) {
    radio3.click();
    radio3.checked = true;
  }
});
    console.log('✔️');
    await sleep(1500);

    console.log('🚗 Sin carro...');
    await frame.waitForSelector('#carritos_alquiler0', { timeout: 10000 });
    await frame.evaluate(() => {
      const radio = document.querySelector('#carritos_alquiler0');
      if (radio) {
        radio.click();
        radio.checked = true;
        const hidden = document.querySelector('#carritos');
        if (hidden) hidden.value = '0';
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
        const hidden = document.querySelector('#formapago');
        if (hidden) hidden.value = 'VA';
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
      const codigo = CODIGOS_SOCIOS[i];
      console.log(`📝 Socio ${i + 1}/2: ${codigo}`);

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
      await frame.waitForSelector('#filtro', { timeout: 10000 });

      await frame.evaluate(() => {
        const filtro = document.querySelector('#filtro');
        if (filtro) filtro.value = '';
      });

      await frame.type('#filtro', codigo, { delay: 40 });
      await sleep(400);

      await frame.evaluate((cod) => {
        const filtro = document.querySelector('#filtro');
        if (filtro) {
          filtro.value = cod;
          const event = new Event('change', { bubbles: true });
          filtro.dispatchEvent(event);
        }
      }, codigo);

      await sleep(2500);

      const agregado = await frame.evaluate(() => {
        const btn = document.querySelector('#listadoSocios a.ok[onclick*="xajax_teeAgregarJugador"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (agregado) {
        console.log(`   ✅`);
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
        console.log('');
      } else {
        console.log(`   ⚠️`);
        await frame.evaluate(() => {
          const close = document.querySelector('a.close[href="#close"]');
          if (close) close.click();
        });
        await sleep(800);
        console.log('');
      }
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
    const captureTime = ((Date.now() - pollStart) / 1000).toFixed(3);
    
    console.log('╔════════════════════════════════════════════╗');
    console.log('║       🎉 ¡RESERVA COMPLETADA! 🎉          ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log(`📅 Día: ${dayInfo.dayText}`);
    console.log(`⏰ Horario: ${selectedTime}\n`);
    console.log(`👥 Jugadores:`);
    console.log(`   • ${USER_CLUB} (tú)`);
    console.log(`   • ${CODIGOS_SOCIOS[0]}`);
    console.log(`   • ${CODIGOS_SOCIOS[1]}\n`);
    console.log(`⚡ Velocidad de captura: ${captureTime}s`);
    console.log(`⏱️ Tiempo total: ${totalTime}s\n`);
    console.log(`🚗 Sin carro`);
    console.log(`💳 Cargo al Carnet\n`);
    console.log('✅ ¡Todo listo para jugar!\n');

    await browser.close();
    console.log('✅ Navegador cerrado\n');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('Stack:', err.stack);
    
    try {
      await browser.close();
      console.log('✅ Navegador cerrado después de error');
    } catch (e) {
      console.error('Error cerrando navegador:', e.message);
    }
  }
}

startSpeedTest();