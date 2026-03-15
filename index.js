const mineflayer = require('mineflayer');
const http = require('http');
const https = require('https');

// 1. Mantenimiento de Render (Mantener vivo el proceso)
http.createServer((req, res) => res.end('Sistema Activo')).listen(process.env.PORT || 10000);

const CONFIG = { host: 'serverlozano.aternos.me', port: 53121, version: '1.21.1', auth: 'offline' };
const NOMBRES = ['BoA', 'BoB', 'BoC', 'BoD', 'BoE', 'BoF', 'play', 'play2', 'play3', 'User4'];

// 2. Lógica del Bot
function iniciarBot(slot) {
    const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    console.log(`[Slot ${slot}] Conectando como: ${nombre}`);

    const bot = mineflayer.createBot({ ...CONFIG, username: nombre });

    bot.on('spawn', () => {
        console.log(`[Slot ${slot}] ${nombre} patrullando en paz.`);
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
        }, 300000); 

        setTimeout(() => {
            console.log(`[Slot ${slot}] Cumplió 1 hora. Cambiando nombre...`);
            bot.quit();
            setTimeout(() => iniciarBot(slot), 5000);
        }, 60 * 60 * 1000);
    });

    bot.on('kicked', () => setTimeout(() => iniciarBot(slot), 60000));
    bot.on('error', () => setTimeout(() => iniciarBot(slot), 60000));
}

// 3. Lógica del Vigilante (Encendido)
async function iniciarServidor() {
    console.log("[Vigilante] Intentando encender el servidor...");
    const options = {
        hostname: 'aternos.org',
        path: `/panel/ajax/start.php?head=start&serverId=${process.env.ATERNOS_ID}`,
        method: 'POST',
        headers: { 'Cookie': process.env.ATERNOS_COOKIE }
    };

    const req = https.request(options, (res) => {
        console.log(`[Vigilante] Respuesta de Aternos: ${res.statusCode}`);
        
        // Si el servidor está encendiendo (código 200), lanzamos los bots
        if (res.statusCode === 200) {
            console.log("[Vigilante] Servidor solicitado. Esperando 90s para lanzar bots...");
            setTimeout(() => {
                for (let i = 1; i <= 3; i++) {
                    setTimeout(() => iniciarBot(i), i * 30000);
                }
            }, 90000); // 90 segundos de espera
        }
    });
    req.end();
}

// 4. Ejecución inicial
console.log("[Vigilante] Sistema listo. Iniciando ciclo...");
iniciarServidor(); // Intentar encender al arrancar
setInterval(iniciarServidor, 600000); // Intentar encender cada 10 min
