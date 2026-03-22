const mineflayer = require('mineflayer');

function crearBot() {
    const bot = mineflayer.createBot({
        host: 'tu-server.aternos.me',
        username: 'Guardian_24_7',
        version: false
    });

    bot.on('spawn', () => {
        console.log("✅ Bot en el portal. Iniciando ciclo de vida 24/7.");
        
        // --- TRUCO ANT-AFK AGRESIVO ---
        // El bot saltará y mirará a los lados cada 20 segundos
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            
            // Cambia la mirada para que Aternos crea que es un humano
            const yaw = Math.random() * Math.PI * 2;
            const pitch = (Math.random() - 0.5) * Math.PI;
            bot.look(yaw, pitch);
        }, 20000);
    });

    bot.on('end', () => {
        console.log("❌ Conexión perdida. Reintentando en 5 segundos...");
        setTimeout(crearBot, 5000); // Reintento rápido para que el server no se apague
    });

    bot.on('error', (err) => {
        console.log("⚠️ Error de conexión: " + err.message);
    });
}

crearBot();

// --- ESTO ES PARA CRON-JOB / UPTIME ROBOT ---
const http = require('http');
http.createServer((req, res) => {
    res.write("Portal Activo");
    res.end();
}).listen(process.env.PORT || 3000);
