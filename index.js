const mineflayer = require('mineflayer');
const { pvp, typeof: pvpType } = require('mineflayer-pvp');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

function crearBot(nombre, esAtacante) {
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: nombre,
        version: false,
        connectTimeout: 60000
    });

    // Cargamos los plugins de combate y movimiento
    bot.loadPlugin(pvp);
    bot.loadPlugin(pathfinder);

    bot.on('spawn', () => {
        console.log(`⚔️ [GLADIADOR] ${bot.username} ha entrado a la arena.`);
        const defaultMove = new Movements(bot);
        
        // El bot buscará pelea cada 10 segundos
        setInterval(() => {
            const rival = bot.nearestEntity(e => e.type === 'player' && e.username !== bot.username);
            
            if (rival && esAtacante) {
                console.log(`🥊 ${bot.username} atacando a ${rival.username}`);
                bot.pvp.attack(rival);
            }
        }, 10000);
    });

    // Si el bot muere, le damos a "Respawn" automáticamente para que siga la pelea
    bot.on('death', () => {
        console.log(`💀 ${bot.username} fue eliminado. Reapareciendo...`);
        bot.quit();
        setTimeout(() => crearBot(nombre, esAtacante), 5000);
    });

    bot.on('error', (err) => console.log(`❗ Error en ${nombre}: ${err.message}`));
}

// LANZAMOS DOS BOTS PARA QUE SE PELEEN ENTRE ELLOS
// El bot 1 busca al 2, y el 2 busca al 1.
crearBot("Bot_Lozano_1", true);
crearBot("Bot_Lozano_2", true);

// --- SERVIDOR WEB PARA RENDER ---
const http = require('http');
http.createServer((req, res) => {
    res.write("Arena de combate activa 24/7");
    res.end();
}).listen(process.env.PORT || 3000);
