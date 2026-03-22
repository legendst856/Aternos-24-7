const mineflayer = require('mineflayer');
// --- CORRECCIÓN AQUÍ: Importamos específicamente la propiedad 'plugin' ---
const pvp = require('mineflayer-pvp').plugin; 
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const mcDataFactory = require('minecraft-data');

// ESCUDO TOTAL: Si algo falla, el bot no se muere
process.on('uncaughtException', (err) => {
    console.log(`🛡️ [ESCUDO] Error bloqueado: ${err.message}`);
});

function crearGladiador(nombre) {
    console.log(`🚀 [SISTEMA] Desplegando gladiador 1.21.1: ${nombre}`);
    
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: '1.21.1', 
        connectTimeout: 90000
    });

    // Ahora sí se cargan correctamente porque 'pvp' es una función
    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    bot.once('spawn', () => {
        console.log(`✅ [${bot.username}] Dentro del portal.`);
        
        setTimeout(() => {
            try {
                const mcData = mcDataFactory('1.21.1');
                const movements = new Movements(bot, mcData);
                movements.canDig = false; 
                bot.pathfinder.setMovements(movements);
                
                console.log(`🧠 [${bot.username}] Cerebro de combate listo.`);

                setInterval(() => {
                    const rival = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
                    if (rival && bot.pvp) {
                        bot.pvp.attack(rival);
                    }
                }, 10000);
            } catch (e) {
                console.log("⚠️ Error al cargar físicas: " + e.message);
            }
        }, 8000);
    });

    bot.on('death', () => {
        setTimeout(() => { if (bot.isAlive === false) bot.emit('respawn'); }, 2000);
    });

    bot.on('end', () => {
        setTimeout(() => crearGladiador(nombre), 15000);
    });
}

// INICIAR BOTS
crearGladiador("Gladiador_1");
crearGladiador("Gladiador_2");

// --- SERVIDOR PARA RAILWAY (Imprescindible para el Uptime) ---
const http = require('http');
http.createServer((req, res) => {
    res.write("Portal Lozano 1.21.1 - Online");
    res.end();
}).listen(process.env.PORT || 3000);
