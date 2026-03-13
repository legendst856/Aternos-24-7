const mineflayer = require('mineflayer');
const http = require('http');

// MANTENER EL PUERTO DE RENDER ACTIVO
http.createServer((req, res) => res.end('Portal Activo')).listen(process.env.PORT || 10000);

function iniciarBot() {
    const bot = mineflayer.createBot({
        host: 'serverlozano.aternos.me',
        port: 53121,
        username: 'Julieta99', // Nombre que parece humano
        version: '1.21.1',
        auth: 'offline'
    });

    bot.on('spawn', () => {
        console.log('Bot logueado correctamente.');
        // Movimiento mínimo para no ser kickeado por AFK
        // Solo un pequeño salto cada 5 minutos
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 200);
        }, 300000); 
    });

    bot.on('kicked', (reason) => {
        console.log('Expulsado, reintentando en 60 segundos...', reason);
        setTimeout(iniciarBot, 60000); // Espera un minuto antes de volver a intentar
    });

    bot.on('error', (err) => {
        console.log('Error detectado, reintentando...', err);
        setTimeout(iniciarBot, 60000);
    });
}

iniciarBot();
