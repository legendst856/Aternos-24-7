const mineflayer = require('mineflayer');
const http = require('http');
const https = require('https');

// 1. Mantenimiento para que el proceso no se duerma
http.createServer((req, res) => res.end('Sistema Activo')).listen(process.env.PORT || 10000);

const CONFIG = { host: 'serverlozano.aternos.me', port: 53121, version: '1.21.1', auth: 'offline' };
const NOMBRES = ['BoA', 'BoB', 'BoC', 'BoD', 'BoE', 'BoF', 'play', 'play2', 'play3', 'User4', 'Bot1', 'Bot2'];

// 2. Función para notificar a Discord
function enviarDiscord(mensaje) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    const data = JSON.stringify({ content: mensaje });
    const url = new URL(webhookUrl);
    const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {});
    req.on('error', (e) => console.error(`[Discord] Error: ${e.message}`));
    req.write(data);
    req.end();
}

// 3. Lógica del Bot con rotación cada 4 horas
function iniciarBot(slot) {
    const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    console.log(`[Slot ${slot}] Conectando como: ${nombre}`);

    const bot = mineflayer.createBot({ ...CONFIG, username: nombre });

    // Rotación: 4 horas exactas (14,400,000 ms)
    const timer = setTimeout(() => {
        console.log(`[Slot ${slot}] Cumplió 4 horas. Cambiando identidad...`);
        enviarDiscord(`🔄 **[Slot ${slot}]** ${nombre} cumplió 4 horas, cambiando identidad.`);
        bot.quit();
    }, 14400000);

    bot.on('spawn', () => {
        console.log(`[Slot ${slot}] ${nombre} patrullando.`);
        enviarDiscord(`✅ **${nombre}** (Slot ${slot}) conectado al servidor.`);
        
        // Anti-AFK
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
        }, 300000); 
    });

    // Si se desconecta (por error o por el timer de 4h), reconecta
    bot.on('end', () => {
        clearTimeout(timer);
        setTimeout(() => iniciarBot(slot), 5000);
    });

    bot.on('kicked', (reason) => console.log(`[Slot ${slot}] Expulsado: ${reason}`));
    bot.on('error', (err) => console.log(`[Slot ${slot}] Error: ${err}`));
}

// 4. Vigilante de Aternos
async function iniciarServidor() {
    const options = {
        hostname: 'aternos.org',
        path: `/panel/ajax/start.php?head=start&serverId=${process.env.ATERNOS_ID}`,
        method: 'POST',
        headers: { 'Cookie': process.env.ATERNOS_COOKIE }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
            enviarDiscord("🚀 **[Sistema]** Servidor solicitado. Iniciando carga (90s)...");
            setTimeout(() => {
                for (let i = 1; i <= 6; i++) {
                    setTimeout(() => iniciarBot(i), i * 15000);
                }
            }, 90000);
        } else {
            enviarDiscord(`⚠️ **[Sistema]** Error al intentar encender (Código: ${res.statusCode})`);
        }
    });
    req.end();
}

// Ejecución inicial
iniciarServidor();
// Intentar encender cada 10 minutos por si el server se cae
setInterval(iniciarServidor, 600000);

console.log("[Sistema] Vigilante activo y listo.");
