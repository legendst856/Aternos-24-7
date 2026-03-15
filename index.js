const mineflayer = require('mineflayer');
const http = require('http');

// Mantiene el proceso vivo
http.createServer((req, res) => res.end('Sistema Activo')).listen(process.env.PORT || 10000);

const CONFIG = { host: 'serverlozano.aternos.me', port: 53121, version: '1.21.1', auth: 'offline' };

function generarNombre() {
    return 'Player_' + Math.floor(Math.random() * 9000 + 1000);
}

function iniciarBot(slot) {
    const nombre = generarNombre();
    const bot = mineflayer.createBot({ ...CONFIG, username: nombre });

    // Reinicio de identidad cada 4 horas
    const timer = setTimeout(() => {
        bot.quit();
    }, 14400000);

    bot.on('spawn', () => {
        console.log(`✅ ${nombre} conectado (Slot ${slot}).`);
        // Anti-AFK (Solo saltar si es necesario)
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
        }, 600000); // Cada 10 min para ahorrar recursos
    });

    bot.on('end', () => {
        clearTimeout(timer);
        setTimeout(() => iniciarBot(slot), 60000); // Esperar 1 min antes de reconectar
    });

    bot.on('error', (err) => {
        console.log(`[Slot ${slot}] Error: ${err.message}`);
        bot.quit();
    });
}

// REDUCIDO A 4 BOTS para mantener estabilidad
for (let i = 1; i <= 4; i++) {
    setTimeout(() => iniciarBot(i), i * 30000);
    }
