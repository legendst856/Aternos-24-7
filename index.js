const mineflayer = require('mineflayer');

// Nombres aleatorios para saltar el baneo
function generarNombre() {
    const nombres = ['LozanoBot', 'PortalVip', 'Steve_777', 'Ghost_MC', 'User_Lozano'];
    const random = Math.floor(Math.random() * 900) + 100;
    return `${nombres[Math.floor(Math.random() * nombres.length)]}${random}`;
}

function iniciarBot() {
    const botNombre = generarNombre();
    console.log(`\n🔍 [INTENTO] Probando conexión con: ${botNombre}`);

    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        username: botNombre,
        version: false,
        connectTimeout: 90000, // Aumentamos a 90 segundos (paciencia extrema)
    });

    // --- MANEJO DE ERRORES (Aquí es donde evitamos que muera) ---
    bot.on('error', (err) => {
        if (err.code === 'ETIMEOUT') {
            console.log("⚠️ [ESPERA] El servidor no responde (ETIMEOUT). Reintentando...");
        } else if (err.code === 'ECONNREFUSED') {
            console.log("🚫 [OFFLINE] El portal está cerrado.");
        } else {
            console.log("❗ [ERROR] " + err.message);
        }
    });

    bot.on('spawn', () => {
        console.log(`✅ [PORTAL] ${bot.username} está dentro.`);
        // Acción Anti-AFK
        setInterval(() => {
            if (bot.entity) bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
        }, 30000);
    });

    // --- REINTENTO AUTOMÁTICO PASE LO QUE PASE ---
    bot.on('end', () => {
        console.log("⏳ [PORTAL] Reiniciando conexión en 20 segundos...");
        setTimeout(iniciarBot, 20000); 
    });
}

// Arrancar el sistema
try {
    iniciarBot();
} catch (e) {
    console.log("❌ Error fatal evitado: " + e.message);
    setTimeout(iniciarBot, 30000);
}

// --- SERVIDOR PARA RENDER ---
const http = require('http');
http.createServer((req, res) => {
    res.write("Portal Lozano 24/7 Corriendo");
    res.end();
}).listen(process.env.PORT || 3000);
