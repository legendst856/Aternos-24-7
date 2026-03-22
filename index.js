const mineflayer = require('mineflayer');
const { pvp } = require('mineflayer-pvp');
const { pathfinder, Movements } = require('mineflayer-pathfinder');

function crearGladiador(nombre) {
    console.log(`🚀 [SISTEMA] Creando a ${nombre}...`);
    
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: false, // Deja que el bot detecte la versión solo
        connectTimeout: 60000
    });

    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        // Esperamos 3 segundos después de nacer para que cargue el mapa
        setTimeout(() => {
            try {
                const mcData = require('minecraft-data')(bot.version);
                if (!mcData) {
                    console.log("⚠️ No se pudieron cargar datos de la versión. Reintentando...");
                    return;
                }

                const movements = new Movements(bot, mcData);
                bot.pathfinder.setMovements(movements);
                console.log(`⚔️ [${bot.username}] ¡Cerebro de combate listo!`);

                // Ciclo de ataque cada 10 segundos
                setInterval(() => {
                    const rival = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
                    if (rival && bot.pvp) {
                        console.log(`🥊 ${bot.username} atacando a ${rival.username}`);
                        bot.pvp.attack(rival);
                    }
                }, 10000);

            } catch (e) {
                console.log("❌ Error al inicializar movimientos: " + e.message);
            }
        }, 3000);
    });

    bot.on('death', () => console.log(`💀 ${bot.username} murió. Esperando respawn...`));
    
    bot.on('error', (err) => {
        if (err.code === 'ERR_ASSERTION') {
            console.log("🛡️ Bloqueado un ERR_ASSERTION. El bot sigue vivo.");
        } else {
            console.log("❗ Error:", err.message);
        }
    });

    bot.on('end', () => {
        console.log("⏳ Conexión perdida. Reintentando en 20s...");
        setTimeout(() => crearGladiador(nombre), 20000);
    });
}

// LANZAR LOS DOS BOTS
crearGladiador("Gladiador_1");
crearGladiador("Gladiador_2");

// SERVIDOR WEB PARA RENDER
const http = require('http');
http.createServer((req, res) => {
    res.write("Arena Activa");
    res.end();
}).listen(process.env.PORT || 3000);
