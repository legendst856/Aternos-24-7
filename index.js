const mineflayer = require('mineflayer');

// Función para generar nombres aleatorios (Estilo Jugador Real)
function generarNombreAleatorio() {
    const prefijos = ['User', 'Player', 'Gamer', 'Pro', 'Mine', 'Craft', 'Steve', 'Alex', 'Ghost'];
    const sufijos = ['_99', '2026', 'MC', '_Vip', '777', 'Pro', '_X', 'Lozano', 'Portal'];
    
    const randomPrefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const randomSufijo = sufijos[Math.floor(Math.random() * sufijos.length)];
    const numeroAzar = Math.floor(Math.random() * 900) + 100;
    
    return `${randomPrefijo}${randomSufijo}${numeroAzar}`.substring(0, 16); 
}

function iniciarBot() {
    const nombreNuevo = generarNombreAleatorio();
    console.log(`🚀 [PORTAL] Generando nueva identidad: ${nombreNuevo}`);

    const botArgs = {
        host: 'serverlozano.aternos.me',
        username: nombreNuevo,
        version: false,
        connectTimeout: 60000 
    };

    const bot = mineflayer.createBot(botArgs);

    // --- ACCIÓN AL ENTRAR ---
    bot.on('spawn', () => {
        console.log(`✅ [PORTAL] ${bot.username} ha cruzado el portal con éxito.`);
        
        // Anti-AFK Humano: Salto y rotación aleatoria
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
                
                // Mirar a un punto aleatorio para engañar al sistema
                bot.look(Math.random() * 6, Math.random() * 2);
            }
        }, 25000);
    });

    // --- RECONEXIÓN CON NUEVA IDENTIDAD ---
    bot.on('end', () => {
        console.log("⏳ [PORTAL] Conexión cerrada. Cambiando identidad y reintentando en 20s...");
        // IMPORTANTE: Esperamos un poco más para que Aternos limpie la sesión anterior
        setTimeout(iniciarBot, 20000); 
    });

    // --- MANEJO DE ERRORES ---
    bot.on('error', (err) => {
        if (err.code === 'ETIMEOUT') {
            console.log("⚠️ [TIMEOUT] El portal está cerrado o cargando...");
        } else {
            console.log(`❗ [ERROR] ${err.message}`);
        }
    });
}

// Iniciar el ciclo infinito
iniciarBot();

// --- SERVIDOR WEB PARA MANTENER RENDER DESPIERTO ---
const http = require('http');
http.createServer((req, res) => {
    res.write("Portal Lozano: Vigilante Activo");
    res.end();
}).listen(process.env.PORT || 3000);
