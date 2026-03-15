const mineflayer = require('mineflayer');
const http = require('http');
const https = require('https');

// 1. Mantener vivo el proceso en Render/Railway
http.createServer((req, res) => res.end('Sistema Activo')).listen(process.env.PORT || 10000);

const CONFIG = { host: 'serverlozano.aternos.me', port: 53121, version: '1.21.1', auth: 'offline' };
const NOMBRES = ['BoA', 'BoB', 'BoC', 'BoD', 'BoE', 'BoF', 'play', 'play2', 'play3', 'User4'];

// Función para notificar a Discord
function enviarDiscord(mensaje) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;
    const data = JSON.stringify({ content: mensaje });
    const url = new URL(webhookUrl);
    const options = { hostname: url.hostname, path: url.pathname, method: 'POST', headers: { 'Content-Type': 'application/json' } };
    const req = https.request(options, (res) => {});
    req.on('error', (e) => console.error(`[Discord] Error: ${e.message}`));
    req.write(data);
    req.end();
}

// 2. Función para iniciar un bot específico
function iniciarBot(slot) {
    const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    const bot = mineflayer.createBot({ ...CONFIG, username: nombre });

    // Rotación de identidad cada 4 horas (14,400,000 ms)
    const timer = setTimeout(() => {
        enviarDiscord(`🔄 **[Slot ${slot}]** ${nombre} cumplió 4 horas. Reiniciando identidad...`);
        bot.quit();
    }, 14400000);

    bot.on('spawn', () => {
        enviarDiscord(`✅ **${nombre}** (Slot ${slot}) conectado.`);
        
        // Anti-AFK
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
        }, 300000); 
    });

    // Si el bot se desconecta (por el timer o error), reconectar
    bot.on('end', () => {
        clearTimeout(timer);
        setTimeout(() => iniciarBot(slot), 5000);
    });

    bot.on('error', (err) => console.log(`[Slot ${slot}] Error: ${err.message}`));
    
    // Asegúrate de que esta línea esté así en tu código:
const cookieCompleta = (process.env.ATERNOS_COOKIE_1.replace(/(\r\n|\n|\r)/gm, "") + 
                        process.env.ATERNOS_COOKIE_2.replace(/(\r\n|\n|\r)/gm, "")).trim();

// Luego en las opciones del servidor:
const options = {
    hostname: 'aternos.org',
    path: `/panel/ajax/start.php?head=start&serverId=${process.env.ATERNOS_ID}`,
    method: 'POST',
    headers: { 
        'Cookie': cookieCompleta,
        'User-Agent': 'Mozilla/5.0' // A veces Aternos rechaza si no hay esto
    }
};

// Y en la parte de los headers del 'iniciarServidor', usa la nueva variable combinada:
const options = {
    hostname: 'aternos.org',
    path: `/panel/ajax/start.php?head=start&serverId=${process.env.ATERNOS_ID}`,
    method: 'POST',
    headers: { 'Cookie': cookieCompleta } // AQUÍ ESTÁ EL CAMBIO
};
    const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
            enviarDiscord("🚀 **[Vigilante]** Servidor solicitado. Esperando 120s para cargar...");
            setTimeout(() => {
                for (let i = 1; i <= 6; i++) {
                    setTimeout(() => iniciarBot(i), i * 15000);
                }
            }, 120000);
        } else {
            enviarDiscord(`⚠️ **[Vigilante]** Error al encender (Código ${res.statusCode}). Revisa tu ATERNOS_COOKIE.`);
        }
    });
    req.end();
}

// Iniciar sistema
iniciarServidor();
setInterval(iniciarServidor, 900000); // Intentar encender cada 15 min
