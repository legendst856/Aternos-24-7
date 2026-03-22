const mineflayer = require('mineflayer');
const { pvp } = require('mineflayer-pvp');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const mcDataFactory = require('minecraft-data');

// --- ESCUDO GLOBAL: EVITA QUE EL PROCESO SE CIERRE ---
process.on('uncaughtException', (err) => {
    console.log(`🛡️ [ESCUDO] Error bloqueado: ${err.message}`);
});

function crearGladiador(nombre) {
    console.log(`🚀 [SISTEMA] Desplegando gladiador 1.21.1: ${nombre}`);
    
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: '1.21.1', // Versión madre
        connectTimeout: 90000,
        checkTimeoutInterval: 60000
    });

    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    bot.once('spawn', () => {
        console.log(`✅ [${bot.username}] En el mundo. Esperando 10s para estabilizar...`);

        // Espera larga de 10 segundos para que Aternos cargue el mapa completo
        setTimeout(() => {
            try {
                const mcData = mcDataFactory('1.21.1');
                const movements = new Movements(bot, mcData);
                
                // CONFIGURACIÓN ANTI-ERRORES
                movements.canDig = false; 
                movements.allow1by1towers = false; // Evita que el bot intente subir bloques
                bot.pathfinder.setMovements(movements);
                
                console.log(`🧠 [${bot.username}] Cerebro configurado. Buscando combate...`);

                // CICLO DE PELEA SEGURO
                setInterval(() => {
                    try {
                        const rival = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
                        if (rival && bot.pvp && bot.entity) {
                            bot.pvp.attack(rival);
                        }
                    } catch (innerErr) {
                        // Si falla el ataque, simplemente no hace nada este turno
                    }
                }, 10000);

            } catch (error) {
                console.log("⚠️ Error de carga inicial. Reiniciando bot...");
                bot.quit();
            }
        }, 10000);
    });

    bot.on('death', () => {
        console.log(`💀 ${bot.username} murió. Reapareciendo...`);
        setTimeout(() => { if (bot.isAlive) bot.emit('respawn'); }, 2000);
    });

    bot.on('end', (reason) => {
        console.log(`⏳ Conexión perdida (${reason}). Reintentando en 15s...`);
        setTimeout(() => crearGladiador(nombre), 15000);
    });

    bot.on('error', (err) => {
        console.log(`❗ Error detectado en ${bot.username}: ${err.message}`);
    });
}

// LANZAR BOTS
crearGladiador("Gladiador_1");
crearGladiador("Gladiador_2");

// SERVIDOR HTTP PARA RENDER
const http = require('http');
http.createServer((req, res) => {
    res.write("Portal 1.21.1 Blindado");
    res.end();
}).listen(process.env.PORT || 3000);
