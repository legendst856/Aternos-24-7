const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin; 
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const mcDataFactory = require('minecraft-data');

// --- OPTIMIZACIÓN GLOBAL (Carga única) ---
const mcData = mcDataFactory('1.21.1');
const movimientosBase = { canDig: false, allow1by1towers: false };

process.on('uncaughtException', (err) => {
    // Bloqueamos el error de aserción pero no lo logueamos todo el tiempo para ahorrar CPU/RAM
    if (!err.message.includes('assertion')) console.log(`🛡️ [ESCUDO] Error: ${err.message}`);
});

function crearGladiador(nombre) {
    console.log(`🚀 [SISTEMA] Iniciando ${nombre}...`);
    
    // Configuramos el bot con el mínimo consumo posible
    let bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: '1.21.1', 
        viewDistance: "tiny", // Vital para Render
        checkTimeoutInterval: 60000,
        physicsEnabled: true // Solo activamos físicas si es necesario
    });

    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    let fightInterval = null;

    bot.once('spawn', () => {
        console.log(`✅ [${bot.username}] Conectado.`);
        
        // Creamos los movimientos usando la base global para ahorrar RAM
        const movements = new Movements(bot, mcData);
        Object.assign(movements, movimientosBase);
        bot.pathfinder.setMovements(movements);
        
        // Evitamos duplicar intervalos
        if (fightInterval) clearInterval(fightInterval);

        fightInterval = setInterval(() => {
            if (!bot || !bot.entity) return;
            const rival = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
            if (rival && bot.pvp) {
                bot.pvp.attack(rival);
            }
        }, 12000); // Un poco más lento para darle respiro al CPU de Render
    });

    // Respawn automático ligero
    bot.on('death', () => {
        setTimeout(() => { if (bot && !bot.isAlive) bot.emit('respawn'); }, 2000);
    });

    // --- LIMPIEZA AGRESIVA DE MEMORIA PARA RENDER ---
    bot.on('end', (reason) => {
        console.log(`♻️ [LIMPIEZA] Cerrando ${nombre} (${reason}). Liberando RAM...`);
        
        if (fightInterval) clearInterval(fightInterval);
        
        // Matamos todos los procesos y referencias
        bot.removeAllListeners();
        if (bot.pathfinder) bot.pathfinder.stop();
        
        // Forzamos al bot a ser nulo para que el recolector de basura de Node.js actúe
        bot = null; 

        // Esperamos un poco más para reconectar y dejar que la RAM baje
        setTimeout(() => crearGladiador(nombre), 20000);
    });
}

// LANZAR BOTS
crearGladiador("Gladiador_1");
crearGladiador("Gladiador_2");

// SERVIDOR WEB ULTRA-SIMPLE (OBLIGATORIO PARA RENDER)
const http = require('http');
http.createServer((req, res) => {
    res.end('Portal Lozano OK');
}).listen(process.env.PORT || 3000);
