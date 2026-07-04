const express = require('express');
const path = require('path');
const { Rcon } = require('rcon-client');
const fs = require('fs');
const nbt = require('nbt');
const { spawn } = require('child_process');
const dotenv = require('dotenv');
const Tail = require('tail').Tail;

dotenv.config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Configuration
const PORT = process.env.PORT || 8080;
const RCON_HOST = process.env.RCON_HOST || 'localhost';
const RCON_PORT = parseInt(process.env.RCON_PORT || 25575);
const RCON_PASSWORD = process.env.RCON_PASSWORD || 'admin';
const SERVER_DIR = process.env.SERVER_DIR || './server-files';
const WORLD_DIR = path.join(SERVER_DIR, 'world');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// --------------------------------------------------------------
// ROUTES DE L'API
// --------------------------------------------------------------

// 1. Exécuter une commande console
app.post('/api/command', async (req, res) => {
    const { cmd } = req.body;
    if (!cmd) return res.status(400).json({ error: 'Commande manquante' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        const response = await rcon.send(cmd);
        await rcon.end();
        res.json({ success: true, response });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Récupérer la liste des joueurs (via la commande list)
app.get('/api/players', async (req, res) => {
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        const response = await rcon.send('list');
        await rcon.end();
        // Parse la réponse pour extraire les pseudos (ex: "There are 3 of a max of 20 players online: player1, player2, player3")
        const match = response.match(/online: (.+)$/);
        const players = match ? match[1].split(', ').filter(p => p) : [];
        res.json({ players });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Gérer les OP (liste, ajout, suppression)
app.get('/api/ops', (req, res) => {
    const opsPath = path.join(SERVER_DIR, 'ops.json');
    if (!fs.existsSync(opsPath)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
    res.json(data);
});

app.post('/api/ops/add', async (req, res) => {
    const { player } = req.body;
    if (!player) return res.status(400).json({ error: 'Player name required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`op ${player}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ops/remove', async (req, res) => {
    const { player } = req.body;
    if (!player) return res.status(400).json({ error: 'Player name required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`deop ${player}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Bannir / Débannir (joueurs et IP)
app.post('/api/ban', async (req, res) => {
    const { player, reason } = req.body;
    if (!player) return res.status(400).json({ error: 'Player name required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`ban ${player} ${reason || ''}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/unban', async (req, res) => {
    const { player } = req.body;
    if (!player) return res.status(400).json({ error: 'Player name required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`pardon ${player}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ban-ip', async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`ban-ip ${ip}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/unban-ip', async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`pardon-ip ${ip}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Liste des bannis (lecture des fichiers)
app.get('/api/banned-players', (req, res) => {
    const file = path.join(SERVER_DIR, 'banned-players.json');
    if (!fs.existsSync(file)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json(data);
});

app.get('/api/banned-ips', (req, res) => {
    const file = path.join(SERVER_DIR, 'banned-ips.json');
    if (!fs.existsSync(file)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json(data);
});

// 6. Statistiques des joueurs (temps de jeu, etc.) via le fichier stats de Minecraft
app.get('/api/stats/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const statsFile = path.join(WORLD_DIR, 'stats', `${uuid}.json`);
    if (!fs.existsSync(statsFile)) return res.status(404).json({ error: 'Stats not found' });
    const data = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
    res.json(data);
});

// 7. Inventaire d'un joueur (fichier .dat) – nécessite la librairie nbt
app.get('/api/inventory/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const playerFile = path.join(WORLD_DIR, 'playerdata', `${uuid}.dat`);
    if (!fs.existsSync(playerFile)) return res.status(404).json({ error: 'Player data not found' });
    fs.readFile(playerFile, (err, data) => {
        if (err) return res.status(500).json({ error: 'Read error' });
        nbt.parse(data, (err, nbtData) => {
            if (err) return res.status(500).json({ error: 'NBT parse error' });
            const inventory = nbtData.value.Inventory ? nbtData.value.Inventory.value : [];
            res.json(inventory);
        });
    });
});

// 8. Liste des fichiers de logs (dernier fichier)
app.get('/api/logs/latest', (req, res) => {
    const logDir = path.join(SERVER_DIR, 'logs');
    const files = fs.readdirSync(logDir).filter(f => f.endsWith('.log')).sort().reverse();
    if (files.length === 0) return res.json({ content: '' });
    const latest = path.join(logDir, files[0]);
    const content = fs.readFileSync(latest, 'utf8');
    res.json({ content: content.slice(-50000) }); // Dernières 50000 lignes
});

// 9. Redémarrer / arrêter le serveur (via RCON ou gestion de processus)
app.post('/api/stop', async (req, res) => {
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send('stop');
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// (Le start se fait via le script de démarrage, pas via l'API)

// 10. Gérer la whitelist
app.get('/api/whitelist', (req, res) => {
    const file = path.join(SERVER_DIR, 'whitelist.json');
    if (!fs.existsSync(file)) return res.json([]);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    res.json(data);
});

app.post('/api/whitelist/add', async (req, res) => {
    const { player } = req.body;
    if (!player) return res.status(400).json({ error: 'Player name required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`whitelist add ${player}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/whitelist/remove', async (req, res) => {
    const { player } = req.body;
    if (!player) return res.status(400).json({ error: 'Player name required' });
    try {
        const rcon = await Rcon.connect({ host: RCON_HOST, port: RCON_PORT, password: RCON_PASSWORD });
        await rcon.send(`whitelist remove ${player}`);
        await rcon.end();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------------------------------------------------------------
// WEBSOCKET POUR LOGS EN TEMPS RÉEL
// --------------------------------------------------------------
io.on('connection', (socket) => {
    console.log('Client connected for logs');
    const logPath = path.join(SERVER_DIR, 'logs', 'latest.log');
    let tail = null;
    if (fs.existsSync(logPath)) {
        tail = new Tail(logPath);
        tail.on('line', (line) => {
            socket.emit('log', line);
        });
        tail.on('error', (err) => console.error(err));
    }
    socket.on('disconnect', () => {
        if (tail) tail.unwatch();
    });
});

// Servir l'interface web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Panel running on port ${PORT}`);
});
