const mineflayer = require('mineflayer');
const { pvp } = require('mineflayer-pvp');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const mcDataFactory = require('minecraft-data');

function crearGladiador(nombre) {
    console.log(`🚀 [SISTEMA] Desplegando gladiador 1.21.1: ${nombre}`);
    
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: '1.21.1', // Forzamos la versión madre para evitar el error
        connectTimeout: 60000
    });

    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    bot.once('spawn', () => {
        console.log(`✅ [${bot.username}] Dentro del portal. Configurando física...`);

        // Esperamos 5 segundos para que los chunks carguen bien en la LENOVO/Aternos
        setTimeout(() => {
            try {
                const mcData = mcDataFactory('1.21.1');
                const movements = new Movements(bot, mcData);
                
                // Ajustes para evitar que el bot se quede "pensando" y lance assertion
                movements.canDig = false; // No intentar romper bloques
                bot.pathfinder.setMovements(movements);
                
                console.log(`🧠 [${bot.username}] Cerebro 1.21.1 cargado.`);

                // CICLO DE COMBATE
                setInterval(() => {
                    const rival = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
                    if (rival && bot.pvp && bot.entity) {
                        console.log(`🥊 ${bot.username} atacando a ${rival.username}`);
                        bot.pvp.attack(rival);
                    }
                }, 15000);

            } catch (error) {
                console.log("⚠️ Error de inicialización, reintentando...");
            }
        }, 5000);
    });

    // AUTO-RESPAWN (Vital para que la pelea no se detenga)
    bot.on('death', () => {
        console.log(`💀 ${bot.username} murió. Reapareciendo...`);
        // Aternos a veces tarda en procesar el respawn, le damos 2 segundos
        setTimeout(() => bot.emit('respawn'), 2000);
    });

    // CHALECO ANTIBALAS CONTRA CRASHES
    process.on('uncaughtException', (err) => {
        if (err.message.includes('assertion') || err.code === 'ERR_ASSERTION') {
            console.log("🛡️ [ANTICRASH] Bloqueada una aserción de la 1.21.1. El bot sigue.");
        } else {
            console.error("❌ Error inesperado:", err);
        }
    });

    bot.on('end', () => {
        console.log("⏳ Conexión perdida. Reintentando en 20s...");
        setTimeout(() => crearGladiador(nombre), 20000);
    });
}

// LANZAR BOTS
crearGladiador("Gladiador_Lozano_1");
crearGladiador("Gladiador_Lozano_2");

// SERVIDOR WEB PARA RENDER
const http = require('http');
http.createServer((req, res) => {
    res.write("Arena 1.21.1 Activa");
    res.end();
}).listen(process.env.PORT || 3000);
