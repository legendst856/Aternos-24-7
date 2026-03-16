const mineflayer = require('mineflayer');
const http = require('http');

http.createServer((req, res) => res.end('Sistema Activo')).listen(process.env.PORT || 10000);

const CONFIG = { host: 'serverlozano.aternos.me', port: 53121, version: '1.21.1', auth: 'offline' };

function generarNombre() {
    return 'Player_' + Math.floor(Math.random() * 9000 + 1000);
}

function iniciarBot(slot, delay = 60000) {
    const nombre = generarNombre();
    console.log(`[Slot ${slot}] Intentando conectar como ${nombre}...`);
    
    const bot = mineflayer.createBot({ ...CONFIG, username: nombre });

    bot.on('spawn', () => {
        console.log(`✅ ${nombre} conectado (Slot ${slot}).`);
        delay = 60000; // Resetear delay si conecta exitosamente
        
        // Anti-AFK simple
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 200);
            }
        }, 600000);
    });

    bot.on('end', (reason) => {
        console.log(`[Slot ${slot}] Desconectado: ${reason}. Reintentando en ${delay/1000}s...`);
        // Si el servidor está apagado, el error suele ser 'ECONNREFUSED' o 'end'
        // Aumentamos el delay para no saturar si el servidor sigue apagado
        const nextDelay = (reason === 'connect ECONNREFUSED' || reason === 'end') 
            ? Math.min(delay + 30000, 300000) // Máximo 5 minutos de espera
            : 60000;
        
        setTimeout(() => iniciarBot(slot, nextDelay), delay);
    });

    bot.on('error', (err) => {
        // No imprimimos errores constantes si el servidor está simplemente apagado
        if (err.code !== 'ECONNREFUSED') {
            console.log(`[Slot ${slot}] Error: ${err.message}`);
        }
        bot.quit();
    });
}

// Iniciar los 4 bots con escalonamiento
for (let i = 1; i <= 4; i++) {
    setTimeout(() => iniciarBot(i), i * 15000);
}
