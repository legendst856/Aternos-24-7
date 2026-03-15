const mineflayer = require('mineflayer');
const http = require('http');

// Mantiene el proceso vivo en Render
http.createServer((req, res) => res.end('Sistema Activo')).listen(process.env.PORT || 10000);

const CONFIG = { host: 'serverlozano.aternos.me', port: 53121, version: '1.21.1', auth: 'offline' };

// Genera un nombre aleatorio estilo "Player_1234"
function generarNombre() {
    return 'Player_' + Math.floor(Math.random() * 9000 + 1000);
}

function iniciarBot(slot) {
    const nombre = generarNombre();
    console.log(`[Slot ${slot}] Iniciando como ${nombre}...`);
    
    const bot = mineflayer.createBot({ ...CONFIG, username: nombre });

    // Cambiar de nombre cada 4 horas (14,400,000 ms)
    const timer = setTimeout(() => {
        console.log(`[Slot ${slot}] Ciclo de 4h completado. Reiniciando identidad...`);
        bot.quit();
    }, 14400000);

    bot.on('spawn', () => {
        console.log(`✅ ${nombre} conectado en el Slot ${slot}.`);
        // Anti-AFK ligero: Saltar cada 5 minutos
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
        }, 300000);
    });

    bot.on('end', () => {
        clearTimeout(timer);
        console.log(`[Slot ${slot}] Bot desconectado. Reconectando en 30s...`);
        setTimeout(() => iniciarBot(slot), 30000);
    });

    bot.on('error', (err) => {
        console.log(`[Slot ${slot}] Error: ${err.message}`);
        bot.quit();
    });
}

// Lanza los bots con retraso para no colapsar la RAM de Render
for (let i = 1; i <= 6; i++) {
    setTimeout(() => iniciarBot(i), i * 15000);
                    }
