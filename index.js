const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin; 
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const mcDataFactory = require('minecraft-data');

// --- CARGA GLOBAL (Ahorro de RAM para evitar crashes) ---
const mcData = mcDataFactory('1.21.1');
const movimientosBase = { canDig: false, allow1by1towers: false };

process.on('uncaughtException', (err) => {
    if (!err.message.includes('assertion')) console.log(`🛡️ [ANTICRASH] Error: ${err.message}`);
});

function crearGladiador(nombre) {
    console.log(`🚀 [SISTEMA] Conectando gladiador 24/7: ${nombre}`);
    
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: '1.21.1', 
        viewDistance: "tiny",
        // --- CONFIGURACIÓN DE RED AGRESIVA ---
        checkTimeoutInterval: 45000, 
        connectTimeout: 90000,
        keepAlive: true, // Mantiene la conexión activa con el server
        hideErrors: true 
    });

    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    let mainLoop = null;

    bot.once('spawn', () => {
        console.log(`✅ [${bot.username}] Conexión establecida.`);
        
        const movements = new Movements(bot, mcData);
        Object.assign(movements, movimientosBase);
        bot.pathfinder.setMovements(movements);
        
        if (mainLoop) clearInterval(mainLoop);

        // --- PROTOCOLO DE ACTIVIDAD CONSTANTE (Evita el error desconocido) ---
        mainLoop = setInterval(() => {
            if (!bot || !bot.entity) return;

            const rival = bot.nearestEntity(e => (e.type === 'player' || e.type === 'mob') && e.username !== bot.username);
            
            if (rival && bot.pvp) {
                // Modo Ataque
                bot.pvp.attack(rival);
            } else {
                // Modo Vigilancia (Movimiento constante para que no lo saquen)
                const acciones = ['forward', 'back', 'left', 'right'];
                const mover = acciones[Math.floor(Math.random() * acciones.length)];
                
                bot.setControlState(mover, true);
                bot.setControlState('jump', true);
                
                setTimeout(() => {
                    if (bot.setControlState) {
                        bot.setControlState(mover, false);
                        bot.setControlState('jump', false);
                    }
                }, 500);
            }
        }, 8000); 
    });

    // Respawn sin errores
    bot.on('death', () => {
        console.log(`💀 ${bot.username} murió. Reviviendo...`);
        bot.emit('respawn');
    });

    // RECONEXIÓN INSTANTÁNEA (Si se cae, vuelve a entrar en 5 segundos)
    bot.on('end', (reason) => {
        console.log(`⚠️ [DESCONEXIÓN] ${nombre} perdió conexión: ${reason}. Reintentando en 5s...`);
        if (mainLoop) clearInterval(mainLoop);
        bot.removeAllListeners();
        setTimeout(() => crearGladiador(nombre), 5000);
    });

    bot.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') console.log("❌ Server apagado.");
    });
}

// LANZAR BOTS
crearGladiador("Gladiador_1");
crearGladiador("Gladiador_2");

// --- SERVIDOR WEB DE MANTENIMIENTO (Para Render/Railway) ---
const http = require('http');
http.createServer((req, res) => {
    res.end('Vigilante Lozano Online');
}).listen(process.env.PORT || 3000);
