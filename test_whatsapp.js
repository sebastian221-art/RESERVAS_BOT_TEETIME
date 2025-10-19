import 'dotenv/config';
import Twilio from 'twilio';

const { TWILIO_SID, AUTH_TOKEN, TWILIO_WHATSAPP, TARGET_WHATSAPP } = process.env;

console.log('📱 Configuración:');
console.log(`   TWILIO_SID: ${TWILIO_SID}`);
console.log(`   AUTH_TOKEN: ${AUTH_TOKEN ? '***' + AUTH_TOKEN.slice(-4) : 'NO DEFINIDO'}`);
console.log(`   FROM: ${TWILIO_WHATSAPP}`);
console.log(`   TO: ${TARGET_WHATSAPP}\n`);

if (!TWILIO_SID || !AUTH_TOKEN || !TWILIO_WHATSAPP || !TARGET_WHATSAPP) {
  console.error('❌ Faltan credenciales en .env');
  process.exit(1);
}

const client = Twilio(TWILIO_SID, AUTH_TOKEN);

async function testWhatsApp() {
  try {
    console.log('📤 Enviando mensaje de prueba...\n');
    
    const message = await client.messages.create({
      from: TWILIO_WHATSAPP,
      to: TARGET_WHATSAPP,
      body: '🧪 Mensaje de prueba desde Twilio\n\n' +
            'Si recibes esto, ¡WhatsApp funciona correctamente! ✅'
    });

    console.log('✅ ¡MENSAJE ENVIADO EXITOSAMENTE!');
    console.log(`   SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   Date Created: ${message.dateCreated}`);
    console.log(`   To: ${message.to}`);
    console.log(`   From: ${message.from}\n`);
    
    console.log('📱 Revisa tu WhatsApp ahora!\n');

  } catch (error) {
    console.error('\n❌ ERROR AL ENVIAR:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Status: ${error.status}`);
    
    if (error.code === 21211) {
      console.error('\n⚠️  ERROR 21211: Número no válido');
      console.error('   Solución: Verifica que el número tenga el formato: whatsapp:+573154559242');
    }
    
    if (error.code === 63007) {
      console.error('\n⚠️  ERROR 63007: No estás unido al Sandbox');
      console.error('   Solución:');
      console.error('   1. Abre WhatsApp');
      console.error('   2. Envía un mensaje a: +1 415 523 8886');
      console.error('   3. Mensaje: join <código-de-sandbox>');
      console.error('   4. Ve a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
    }
    
    if (error.code === 20003) {
      console.error('\n⚠️  ERROR 20003: Credenciales incorrectas');
      console.error('   Solución: Verifica TWILIO_SID y AUTH_TOKEN en .env');
    }
    
    console.error(`\n   More Info: ${error.moreInfo}\n`);
  }
}

testWhatsApp();