/**
 * SISTEMA DE PORTAL (TAMCPOCO) ETERNO v12.2 - ESPECTRO DE RED
 * Blindaje total contra desconexiones de 1 hora.
 * Simulación de Jitter de red, trayectorias curvas y picos de E/S.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalBlock } = goals;

// --- CONFIGURACIÓN DE PERSISTENCIA ---
const REINICIO_MAESTRO_MS = 23 * 60 * 60 * 1000; 
const TIEMPO_REINTENTO_MS = 6000; 
const tiempoInicio = Date.now();

const config = {
  host: 'serverlozano.aternos.me',
  port: 53121, 
  version: '1.21.1'
};

const nombres = ['BotAlpha', 'BotBeta', 'BotGamma', 'BotDelta', 'BotEpsilon', 'BotZeta'];
const frases = [
  "¿Alguien más siente el lag?", "El tamcpoco está seguro.", "¡Cuidado con ese creeper!",
  "Vigilancia v12.2 activa.", "No se puede apagar lo que no se ve.", "Patrullando...",
  "Aternos va fatal hoy.", "Guardia del portal reportándose.", "¡Miren este salto!"
];

let botsConectados = 0;
const botsActivos = new Map();
let registroLogs = [];
let bufferBasura = ""; // Para actividad de disco dinámica

// --- SERVIDOR WEB DE MONITOREO ---
const server = http.createServer((req, res) => {
  const memoria = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
  const uptime = process.uptime();
  const horas = Math.floor(uptime / 3600);
  const minutos = Math.floor((uptime % 3600) / 60);

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write(`
    <body style="background:#050505;color:#00ff41;font-family:monospace;text-align:center;padding:20px;">
      <div style="border:3px solid #00ff41; display:inline-block; padding:35px; border-radius:15px; background:linear-gradient(135deg, #000, #111); box-shadow: 0 0 40px rgba(0,255,65,0.3);">
        <h1 style="margin:0; font-size:2.2em; text-shadow: 0 0 10px #00ff41;">ESPECTRO v12.2</h1>
        <p style="color:#ffcc00; font-weight:bold; letter-spacing:1px;">ESTADO: PROTOCOLO INDESTRUCTIBLE</p>
        <hr style="border:0; border-top:1px dashed #333; margin:20px 0;">
        <div style="text-align:left; font-size:1.1em; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <p>💠 Tamcpoco: <span style="color:#fff;">Protegido</span></p>
          <p>👥 Bots: <span style="color:#fff;">${botsConectados}/6</span></p>
          <p>📟 RAM: <span style="color:#fff;">${memoria} MB</span></p>
          <p>⏱️ Online: <span style="color:#fff;">${horas}h ${minutos}m</span></p>
        </div>
        <div style="margin-top:20px; text-align:left; background:#000; padding:10px; font-size:0.8em; height:110px; overflow:hidden; border:1px solid #1a1a1a; color:#888;">
          ${registroLogs.slice(-5).reverse().map(e => `<div>[${e.t}] > ${e.m}</div>`).join('')}
        </div>
      </div>
      <script>setTimeout(() => location.reload(), 5500);</script>
    </body>
  `);
  res.end();
});
server.listen(8080);

function log(msg) {
  const t = new Date().toLocaleTimeString();
  registroLogs.push({ t, m: msg });
  if (registroLogs.length > 50) registroLogs.shift();
}

// --- NÚCLEO DE COMPORTAMIENTO ESPECTRAL ---

function spawnBot(nombre) {
  // Delay de entrada escalonado para no saturar el login de Aternos
  const delay = Math.random() * 45000;
  
  setTimeout(() => {
    const bot = mineflayer.createBot({
      host: config.host,
      port: parseInt(config.port),
      username: nombre,
      version: config.version,
      auth: 'offline',
      keepAlive: true,
      checkTimeoutInterval: 120000 // Aumentado para evitar kicks por micro-lags
    });

    bot.loadPlugin(pathfinder);
    let watchdog = setTimeout(() => reiniciar(), 65000);

    bot.on('spawn', () => {
      clearTimeout(watchdog);
      if (!botsActivos.has(nombre)) {
        botsConectados++;
        log(`${nombre} ha materializado su defensa.`);
      }

      const mcData = require('minecraft-data')(bot.version);
      const m = new Movements(bot, mcData);
      m.canDig = false;
      bot.pathfinder.setMovements(m);

      const loop = setInterval(() => {
        try {
          // 1. Simulación de latencia humana (Jitter)
          if (Math.random() > 0.85) return; 

          const entidades = Object.values(bot.entities).filter(e => 
            e.type === 'player' && e.username !== bot.username && e.position.distanceTo(bot.entity.position) < 18
          );

          const intruder = entidades.find(e => !nombres.includes(e.username)) || entidades[0];

          if (intruder) {
            const dist = bot.entity.position.distanceTo(intruder.position);
            if (dist < 4) {
              bot.lookAt(intruder.position.offset(0, 1.6, 0));
              bot.attack(intruder);
              bot.swingArm('right');
              // Chat rítmico
              if (Math.random() > 0.985) {
                setTimeout(() => bot.chat(frases[Math.floor(Math.random() * frases.length)]), 2500);
              }
            } else {
              // Movimiento curvo hacia el objetivo
              const targetPos = intruder.position.offset((Math.random()-0.5)*2, 0, (Math.random()-0.5)*2);
              bot.pathfinder.setGoal(new GoalBlock(targetPos.x, targetPos.y, targetPos.z));
            }
          } else {
            // Patrulla espectral (no lineal)
            if (!bot.pathfinder.isMoving()) {
              const x = bot.entity.position.x + (Math.random() - 0.5) * 14;
              const z = bot.entity.position.z + (Math.random() - 0.5) * 14;
              bot.pathfinder.setGoal(new GoalBlock(x, bot.entity.position.y, z));
            }
          }

          // Variación de estado físico
          if (Math.random() > 0.75) bot.setQuickBarSlot(Math.floor(Math.random() * 9));
          if (Math.random() > 0.92) {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 350);
          }
          if (Math.random() > 0.95) {
            bot.setControlState('sneak', true);
            setTimeout(() => bot.setControlState('sneak', false), 600);
          }

        } catch (e) {}
      }, 3800 + Math.random() * 4000);

      botsActivos.set(nombre, loop);
    });

    const reiniciar = () => {
      clearTimeout(watchdog);
      if (botsActivos.has(nombre)) {
        clearInterval(botsActivos.get(nombre));
        botsActivos.delete(nombre);
        botsConectados = Math.max(0, botsConectados - 1);
      }
      bot.removeAllListeners();
      try { bot.end(); } catch (e) {}
      // Reintento con tiempo variable para no crear patrones
      setTimeout(() => spawnBot(nombre), TIEMPO_REINTENTO_MS + (Math.random() * 15000));
    };

    bot.on('end', () => reiniciar());
    bot.on('error', () => reiniciar());
    bot.on('kicked', (reason) => {
      log(`${nombre} Kick detectado. Re-infiltrando...`);
      reiniciar();
    });

    // Ciclo de "fatiga" para parecer humano (desconexión cada 3-5 horas)
    setTimeout(() => reiniciar(), 10800000 + Math.random() * 7200000);

  }, delay);
}

// --- ANTI-HIBERNACIÓN DE REPLIT (NIVEL CRÍTICO) ---

// 1. ACTIVIDAD DE DISCO Y CPU DINÁMICA
setInterval(() => {
  // Crear y destruir datos de tamaño aleatorio
  const size = Math.floor(Math.random() * 1024 * 500); // Hasta 0.5MB
  bufferBasura = crypto.randomBytes(size).toString('hex');
  fs.writeFileSync('.sys_vital', bufferBasura);
  
  // Cálculo de CPU para evitar pausa del contenedor
  crypto.scryptSync('tamcpoco-alive', crypto.randomBytes(16), 32);
}, 40000);

// 2. MANTENIMIENTO DE RED (WEB)
setInterval(() => {
  https.get('https://www.google.com/favicon.ico', () => {});
  http.get('http://localhost:8080/ping', () => {});
}, 28000);

// 3. REINICIO DE CICLO DIARIO
setTimeout(() => {
  log("Reinicio de seguridad del enjambre.");
  process.exit(0);
}, REINICIO_MAESTRO_MS);

// --- ARRANQUE ---
nombres.forEach((n) => spawnBot(n));

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});