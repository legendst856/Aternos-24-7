const mineflayer = require('mineflayer');
const http = require('http');

// Mantenimiento de Render
http.createServer((req, res) => res.end('Sistema Activo')).listen(process.env.PORT || 10000);

const CONFIG = { host: 'serverlozano.aternos.me', port: 53121, version: '1.21.1', auth: 'offline' };

// Lista de nombres para rotar cada vez que el bot se reconecte
const NOMBRES = ['BotA', 'BotB', 'BotC', 'BotD', 'BotE', 'BotF', 'Jugador1', 'Jugador2', 'User3', 'User4'];

function iniciarBot(slot) {
    const nombre = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    console.log(`[Slot ${slot}] Conectando como: ${nombre}`);

    const bot = mineflayer.createBot({ ...CONFIG, username: nombre });

    bot.on('spawn', () => {
        console.log(`[Slot ${slot}] ${nombre} patrullando en paz.`);
        
        // Movimiento muy ligero (saltito cada 5 min) para evitar AFK
        // Sin peleas, sin chats, sin nada que moleste.
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
        }, 300000); 

        // Rotación: Después de 4 horas exactas (240 minutos), cambiar identidad
        setTimeout(() => {
            console.log(`[Slot ${slot}] Cumplió 4 horas. Cambiando nombre...`);
            bot.quit();
            // Espera 5 segundos y vuelve a conectar con nuevo nombre
            setTimeout(() => iniciarBot(slot), 5000);
        }, 240 * 60 * 1000);
    });

    // Reintento automático
    bot.on('kicked', () => setTimeout(() => iniciarBot(slot), 60000));
    bot.on('error', () => setTimeout(() => iniciarBot(slot), 60000));
}

// Iniciar los 3 bots con escalonamiento
for (let i = 1; i <= 3; i++) {
    setTimeout(() => iniciarBot(i), i * 30000);
    }
const https = require('https');

async function iniciarServidor() {
    const data = JSON.stringify({
        'server': process.env.ATERNOS_ID,
        'action': 'start'
    });

    const options = {
        hostname: 'aternos.org',
        path: `/panel/ajax/start.php?head=start&serverId=${process.env.ATERNOS_ID}`, // <--- ¡AQUÍ ESTÁ EL TRUCO!
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': process.env.ATERNOS_COOKIE // Aquí debes poner tu cookie de sesión
        }
    };

    const req = https.request(options, (res) => {
        console.log(`[Vigilante] Respuesta de Aternos: ${res.statusCode}`);
    });

    req.write(data);
    req.end();
}

// Ejecutar cada 10 minutos
setInterval(iniciarServidor, 600000);
console.log("[Vigilante] Sistema listo.");
