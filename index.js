const mineflayer = require('mineflayer');
const http = require('http');

// Mantiene el proceso vivo con el mínimo de RAM (Uso de memoria base)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Portal Activo');
}).listen(process.env.PORT || 10000);

const CONFIG = {
    host: 'serverlozano.aternos.me',
    port: 53121,
    version: '1.21.1',
    auth: 'offline'
};

// Genera nombres aleatorios para cada reconexión
function generarNombre() {
    return 'Lozano_' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

function iniciarBot(id) {
    const username = generarNombre();
    console.log(`[Bot ${id}] Intentando entrar como ${username}...`);

    const bot = mineflayer.createBot({
        ...CONFIG,
        username: username,
        viewDistance: 'tiny', // CLAVE: Reduce drásticamente el uso de RAM
    });

    // Limitar el procesamiento de física para ahorrar CPU/RAM
    bot.physicsEnabled = true; 

    bot.on('spawn', () => {
        console.log(`✅ ${username} en posición.`);
        // Anti-AFK ultra ligero (solo un salto cada 5 min)
        const afkInterval = setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 300000);

        bot.once('end', () => clearInterval(afkInterval));
    });

    // Manejo de desconexión (Si el server se apaga)
    bot.on('end', () => {
        console.log(`[Bot ${id}] Servidor offline o desconectado. Reintentando en 2 min...`);
        // Espera larga (2 min) para que Render no se sature de intentos fallidos
        setTimeout(() => iniciarBot(id), 120000); 
    });

    // Manejo de errores para que el script no explote
    bot.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            // No imprimimos todo el error para no llenar el log de Render
        } else {
            console.log(`[Bot ${id}] Error: ${err.message}`);
        }
    });
}

// SOLO 2 BOTS: Render gratuito no soporta 4 bots de mineflayer estables.
// Con 2 bots es suficiente para que Aternos no se apague y Render no te mate.
console.log("Iniciando portal equilibrado...");
setTimeout(() => iniciarBot(1), 5000);
setTimeout(() => iniciarBot(2), 35000);
