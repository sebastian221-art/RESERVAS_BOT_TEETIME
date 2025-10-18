// app_speed_test.js - MODO ULTRA-RÁPIDO CORREGIDO (Click en botones, no en texto)
import 'dotenv/config';
import puppeteer from 'puppeteer';
import Twilio from 'twilio';

const USER_CLUB = process.argv[2] || process.env.USER_CLUB;
const PASS_CLUB = process.argv[3] || process.env.PASS_CLUB;
const TARGET_WHATSAPP = process.argv[4] || process.env.TARGET_WHATSAPP;
const CODIGO_SOCIO_1 = process.argv[5] || process.env.CODIGO_SOCIO_1;
const CODIGO_SOCIO_2 = process.argv[6] || process.env.CODIGO_SOCIO_2;

const { TWILIO_SID, AUTH_TOKEN, TWILIO_WHATSAPP } = process.env;

if (!USER_CLUB || !PASS_CLUB || !TWILIO_SID || !AUTH_TOKEN || !TWILIO_WHATSAPP || !TARGET_WHATSAPP || !CODIGO_SOCIO_1 || !CODIGO_SOCIO_2) {
  throw new Error('❌ Faltan credenciales');
}

const twClient = Twilio(TWILIO_SID, AUTH_TOKEN);
const CODIGOS_SOCIOS = [CODIGO_SOCIO_1, CODIGO_SOCIO_2];

// ⚡ CONFIGURACIÓN ULTRA-RÁPIDA
const TURBO_CONFIG = {
  POLL_INTERVAL_MS: 100,           // Polling cada 100ms (MUY rápido)
  CLICK_DELAY_MS: 30,              // Delay mínimo 30ms
  TARGET_HOUR: 14,                 // 2 PM
  TARGET_MINUTE: 0,
  SECONDS_BEFORE: 2,               // Iniciar 2 segundos antes
  MAX_ATTEMPTS: 200,               // Intentos máximos
  MIN_HOUR: 6,                     
  MIN_MINUTE: 10
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

async function waitUntilExactTime(targetHour, targetMinute, secondsBefore) {
  const now = new Date();
  const target = new Date();
  
  target.setHours(targetHour, targetMinute, 0 - secondsBefore, 0);
  
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }
  
  const waitMs = target - now;
  
  if (waitMs > 0) {
    const minutes = Math.floor(waitMs / 60000);
    const seconds = Math.floor((waitMs % 60000) / 1000);
    console.log(`⏰ Esperando hasta ${target.toLocaleTimeString('es-CO')}`);
    console.log(`   (Faltan ${minutes} min ${seconds} seg)\n`);
    await sleep(waitMs);
  }
}

async function startSpeedTest() {
  console.log('🏁 MODO ULTRA-RÁPIDO - OPTIMIZADO');
  console.log('⚡ Configuración:');
  console.log(`   - Polling: cada ${TURBO_CONFIG.POLL_INTERVAL_MS}ms`);
  console.log(`   - Click directo en botones (NO busca texto ACTIVO)`);
  console.log(`   - Refresh a las 2:00:00 PM exactas`);
  console.log(`   - Horario mínimo: ${String(TURBO_CONFIG.MIN_HOUR).padStart(2, '0')}:${String(TURBO_CONFIG.MIN_MINUTE).padStart(2, '0')} AM\n`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--start-maximized",
      "--disable-blink-features=AutomationControlled"
    ],
    executablePath: process.platform === "linux"
      ? "/usr/bin/google-chrome-stable"
      : puppeteer.executablePath(),
    timeout: 0
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  try {
    const startTime = Date.now();
    
    // LOGIN
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

    // CLICK TEE TIME
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

    // ACCEDER AL IFRAME
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

    // ESPERAR TABLA
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

    // CLICK EN SEGUNDO DÍA
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

    // ESPERAR HORARIOS
    console.log('⏳ Cargando horarios...');
    await frame.waitForSelector('#tee-time', { timeout: 60000 });
    console.log('✔️ Horarios cargados\n');

    // ⚡ SINCRONIZACIÓN EXACTA - Esperar hasta 1:59:58 PM
    console.log('🕐 Sincronizando con 2:00:00 PM...');
    await waitUntilExactTime(
      TURBO_CONFIG.TARGET_HOUR, 
      TURBO_CONFIG.TARGET_MINUTE, 
      TURBO_CONFIG.SECONDS_BEFORE
    );
    
    console.log('⚡ A 2 SEGUNDOS DE LAS 2 PM - Preparando...\n');
    await sleep(1500); // Esperar 1.5 seg más (ahora falta 0.5 seg)

    // 🔄 REFRESH JUSTO ANTES DE LAS 2 PM
    console.log('🔄 Haciendo REFRESH...');
    await frame.evaluate(() => {
      const refreshBtn = document.querySelector("a.refresh");
      if (refreshBtn) refreshBtn.click();
    });
    await sleep(500); // Esperar a que cargue el refresh

    console.log('⚡ SON LAS 2:00:00 PM - POLLING ULTRA-RÁPIDO INICIADO!\n');
    
    const pollStart = Date.now();
    let clicked = false;
    let selectedTime = '';
    let pollCount = 0;

    // ⚡ POLLING ULTRA-RÁPIDO DE BOTONES (NO DE TEXTO)
    for (let attempt = 1; attempt <= TURBO_CONFIG.MAX_ATTEMPTS && !clicked; attempt++) {
      pollCount++;

      // BUSCAR BOTONES DISPONIBLES (lo más rápido posible)
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

      // Si hay botones disponibles, procesar inmediatamente
      if (candidates.length > 0) {
        // Log solo en el primer intento exitoso
        if (pollCount === 1 || (pollCount > 1 && attempt === 1)) {
          console.log(`📊 ${candidates.length} slots detectados!`);
        }

        // FILTRAR >= 6:10 AM
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
        
        // ORDENAR
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

          // ⚡ CLICK INMEDIATO
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
            console.log(`⚡ Tiempo desde las 2 PM: ${totalTime}s`);
            console.log(`📊 Total de polls: ${pollCount}`);
            console.log(`📅 Día: ${secondDayInfo.dayText}`);
            console.log(`⏰ Horario: ${target.text}\n`);
            
            break;
          }
        }
      }

      // Log cada 20 intentos (solo si no hay slots)
      if (pollCount % 20 === 0 && candidates.length === 0) {
        const elapsed = ((Date.now() - pollStart) / 1000).toFixed(1);
        console.log(`⏳ ${pollCount} polls | ${elapsed}s | Esperando slots...`);
      }

      // Delay mínimo entre intentos
      await sleep(TURBO_CONFIG.POLL_INTERVAL_MS);
    }

    if (!clicked) {
      console.log('\n❌ No se logró capturar horario');
      await sendWhats('⚠️ No se capturó horario.');
      return;
    }

    // LLENAR FORMULARIO RÁPIDAMENTE
    console.log('📝 Llenando formulario...\n');
    await sleep(2000);

    console.log('👥 3 jugadores...');
    await frame.waitForSelector('#jug3', { timeout: 10000 });
    await frame.evaluate(() => {
      const radio = document.querySelector('#jug3');
      if (radio) {
        radio.click();
        radio.checked = true;
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

    // AGREGAR SOCIOS
    console.log('🔍 AGREGANDO SOCIOS...\n');

    for (let i = 0; i < CODIGOS_SOCIOS.length; i++) {
      const codigo = CODIGOS_SOCIOS[i];
      console.log(`📝 Socio ${i + 1}/2: ${codigo}`);

      // RE-SELECCIONAR "OTROS SOCIOS"
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

    // FINALIZAR
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
    
    console.log('🎉 ¡RESERVA COMPLETADA!');
    console.log(`⚡ Tiempo total: ${totalTime}s`);
    console.log(`📅 ${secondDayInfo.dayText}`);
    console.log(`⏰ ${selectedTime}\n`);
    
    await sendWhats(
      `✅ ¡RESERVA COMPLETADA! 🏌️‍♂️\n\n` +
      `📅 ${secondDayInfo.dayText}\n` +
      `⏰ ${selectedTime}\n` +
      `⚡ ${totalTime}s`
    );

    console.log('✅ Navegador abierto\n');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    await sendWhats(`❌ ${err.message}`);
  }
}

startSpeedTest();
