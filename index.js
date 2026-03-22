const mineflayer = require('mineflayer');
const { pvp } = require('mineflayer-pvp');
const { pathfinder, Movements } = require('mineflayer-pathfinder');

function crearGladiador(nombre) {
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: false, // Auto-detectar
        connectTimeout: 60000
    });

    // Cargamos los plugins
    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(`⚔️ [PORTAL] ${bot.username} ha reaparecido.`);
        
        // --- LA SOLUCIÓN AL ERR_ASSERTION ---
        // Le enseñamos al bot cómo moverse en este mapa específico
        const mcData = require('minecraft-data')(bot.version);
        const movimientos = new Movements(bot, mcData);
        bot.pathfinder.setMovements(movimientos); 

        // Ciclo de combate cada 10 segundos
        setInterval(() => {
            // Buscar al otro bot (que no sea él mismo)
            const rival = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
            
            if (rival) {
                console.log(`🥊 ${bot.username} detectó a ${rival.username}. ¡Al ataque!`);
                // El bot perseguirá y golpeará al rival sin errores
                bot.pvp.attack(rival);
            }
        }, 10000);
    });

    // Si el bot muere, revive y sigue la pelea
    bot.on('death', () => {
        console.log(`💀 ${bot.username} cayó en combate. Volviendo a la arena...`);
    });

    // Reintento si se cae la conexión
    bot.on('end', () => {
        setTimeout(() => crearGladiador(nombre), 15000);
    });

    bot.on('error', (err) => console.log(`❗ Error en ${nombre}: ${err.message}`));
}

// LANZAR LOS DOS GUERREROS DEL PORTAL
crearGladiador("Gladiador_1");
crearGladiador("Gladiador_2");

// SERVIDOR PARA RENDER
const http = require('http');
http.createServer((req, res) => {
    res.write("Arena de combate 24/7 funcionando");
    res.end();
}).listen(process.env.PORT || 3000);
