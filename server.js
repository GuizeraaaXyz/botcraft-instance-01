import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mineflayer from 'mineflayer';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// ARMAZENAMENTO EM MEMÓRIA
// ═══════════════════════════════════════════════════════════════

let bots = [];
let nextBotId = 1;

let globalConfig = {
    maxReconnectAttempts: 15,
    webServerPort: process.env.PORT || 3000
};

// ═══════════════════════════════════════════════════════════════
// BOTS PRÉ-CONFIGURADOS
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mineflayer from 'mineflayer';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));
app.use(express.json());

// ═══════════════════════════════════════════════════════════════
// ARMAZENAMENTO EM MEMÓRIA
// ═══════════════════════════════════════════════════════════════

let bots = [];
let nextBotId = 1;

let globalConfig = {
    maxReconnectAttempts: 15,
    webServerPort: process.env.PORT || 3000
};

// ═══════════════════════════════════════════════════════════════
// BOTS PRÉ-CONFIGURADOS
// ═══════════════════════════════════════════════════════════════

const PRECONFIGURED_BOTS = [
    {
        nome: "SeuBot1",
        server: "healtzcraft.com",
        port: 25565,
        version: "1.21.4",
        senha: "SenhaAqui",
        autoSequence: true,
        commands: [
            "/login {senha}",
            "/skyblock",
            "/ac"
        ]
    },
    {
        nome: "SeuBot2",
        server: "healtzcraft.com",
        port: 25565,
        version: "1.21.4",
        senha: "SenhaAqui",
        autoSequence: true,
        commands: [
            "/login {senha}",
            "/skyblock",
            "/ac"
        ]
    },
    {
        nome: "SeuBot3",
        server: "healtzcraft.com",
        port: 25565,
        version: "1.21.4",
        senha: "SenhaAqui",
        autoSequence: true,
        commands: [
            "/login {senha}",
            "/skyblock",
            "/ac"
        ]
    }
];

function initializePreconfiguredBots() {
    if (bots.length === 0) {
        console.log('\n🎮 Inicializando bots pré-configurados...\n');
        
        PRECONFIGURED_BOTS.forEach((botConfig) => {
            const newBot = {
                id: nextBotId++,
                nome: botConfig.nome,
                server: botConfig.server,
                port: botConfig.port,
                version: botConfig.version,
                senha: botConfig.senha,
                status: 'offline',
                running: false,
                autoSequence: botConfig.autoSequence,
                commands: botConfig.commands,
                reconnectAttempts: 0,
                connecting: false,
                bot: null,
                commandScheduler: null,
                reconnectTimeout: null,
                resourcePackReady: false
            };
            
            bots.push(newBot);
            console.log(`✅ Bot pré-configurado: ${botConfig.nome}`);
        });
        
        console.log(`\n📊 Total: ${bots.length} bots\n`);
    }
}

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE COMANDOS
// ═══════════════════════════════════════════════════════════════

class CommandScheduler {
    constructor(bot, botData) {
        this.bot = bot;
        this.botData = botData;
        this.isRunning = false;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async executeCommand(cmd) {
        if (!this.bot?.entity || this.botData.status !== 'online') return false;
        
        let commandText = cmd;
        commandText = commandText.replace('{senha}', this.botData.senha || '');
        commandText = commandText.replace('{nome}', this.botData.nome);
        
        this.bot.chat(commandText);
        console.log(`[${this.botData.nome}] 💬 ${commandText}`);
        
        return true;
    }
    
    async start() {
        if (this.isRunning) return;
        if (!this.botData.commands || this.botData.commands.length === 0) {
            console.log(`[${this.botData.nome}] ⚠️ Nenhum comando`);
            return;
        }

        this.isRunning = true;
        
        // Aguarda o resource pack ser aceito primeiro
        console.log(`[${this.botData.nome}] ⏳ Aguardando resource pack...`);
        
        let waitTime = 0;
        while (!this.botData.resourcePackReady && waitTime < 20000) {
            await this.delay(500);
            waitTime += 500;
        }
        
        if (this.botData.resourcePackReady) {
            console.log(`[${this.botData.nome}] ✅ Resource pack pronto!`);
            await this.delay(3000); // Espera mais 3 segundos para garantir
        } else {
            console.log(`[${this.botData.nome}] ⚠️ Sem resource pack, continuando...`);
        }
        
        console.log(`[${this.botData.nome}] 🚀 Executando comandos...`);
        
        // Executa os comandos em sequência
        for (let i = 0; i < this.botData.commands.length; i++) {
            if (!this.isRunning || this.botData.status !== 'online') break;
            
            const cmd = this.botData.commands[i];
            if (cmd && cmd.trim()) {
                // Se for o comando /ac, dá um delay antes de executar
                if (cmd === "/ac" || cmd.includes("/ac")) {
                    console.log(`[${this.botData.nome}] ⏳ Aguardando 2s antes do /ac...`);
                    await this.delay(2000);
                }
                
                await this.executeCommand(cmd);
                
                // Delay entre comandos
                if (i === 0) {
                    console.log(`[${this.botData.nome}] ⏳ Aguardando 5s...`);
                    await this.delay(5000);
                } else if (i === 1) {
                    console.log(`[${this.botData.nome}] ⏳ Aguardando 8s...`);
                    await this.delay(8000);
                }
            }
        }
        
        console.log(`[${this.botData.nome}] ✅ Comandos finalizados! Bot em standby.`);
        this.isRunning = false;
    }
    
    stop() {
        this.isRunning = false;
    }
}

// ═══════════════════════════════════════════════════════════════
// GERENCIAMENTO DE BOTS
// ═══════════════════════════════════════════════════════════════

function getBotIndex(botId) {
    return bots.findIndex(b => b.id === botId);
}

function destroyBot(botId) {
    const index = getBotIndex(botId);
    if (index === -1) return;
    
    const botData = bots[index];
    
    if (botData.commandScheduler) {
        botData.commandScheduler.stop();
        botData.commandScheduler = null;
    }
    
    if (botData.reconnectTimeout) {
        clearTimeout(botData.reconnectTimeout);
        botData.reconnectTimeout = null;
    }
    
    if (botData.bot) {
        try { botData.bot.quit(); } catch(e) {}
        botData.bot = null;
    }
    
    botData.status = 'offline';
    botData.connecting = false;
    botData.resourcePackReady = false;
    
    bots[index] = botData;
    io.emit('botStatus', { id: botId, status: 'offline', nome: botData.nome });
}

function createBot(botId) {
    const index = getBotIndex(botId);
    if (index === -1) return;
    
    const botData = bots[index];
    if (botData.connecting || botData.status === 'online') return;
    
    destroyBot(botId);
    
    botData.connecting = true;
    botData.status = 'connecting';
    botData.reconnectAttempts = (botData.reconnectAttempts || 0) + 1;
    botData.resourcePackReady = false;
    bots[index] = botData;
    
    io.emit('botStatus', { id: botId, status: 'connecting', nome: botData.nome });
    
    console.log(`[${botData.nome}] 🔌 Conectando a ${botData.server}:${botData.port}`);
    
    const options = {
        host: botData.server,
        port: botData.port || 25565,
        username: botData.nome,
        version: botData.version || '1.21.4',
        auth: 'offline',
        connectTimeout: 30000,
        keepAlive: true,
        checkTimeoutInterval: 30000,
        viewDistance: 'normal',
        disableChatSigning: true,
        skipValidation: true,
        acceptResourcePack: true
    };
    
    const bot = mineflayer.createBot(options);
    botData.bot = bot;
    
    // Evento de resource pack - ACEITA IMEDIATAMENTE
    bot.on('resourcePack', (pack) => {
        console.log(`[${botData.nome}] 📦 Resource pack detectado! Aceitando...`);
        bot.acceptResourcePack();
        botData.resourcePackReady = true;
        bots[index] = botData;
    });
    
    bot.once('spawn', () => {
        console.log(`[${botData.nome}] ✅ Conectado! Aguardando resource pack...`);
        
        botData.connecting = false;
        botData.status = 'online';
        botData.reconnectAttempts = 0;
        bots[index] = botData;
        
        io.emit('botStatus', { id: botId, status: 'online', nome: botData.nome });
        
        // Se o resource pack já foi aceito, começa os comandos
        if (botData.resourcePackReady) {
            console.log(`[${botData.nome}] ✅ Resource pack pronto, iniciando comandos em 3s...`);
            setTimeout(() => {
                if (botData.status === 'online') {
                    botData.commandScheduler = new CommandScheduler(bot, botData);
                    botData.commandScheduler.start();
                    bots[index] = botData;
                }
            }, 3000);
        } else {
            // Aguarda o resource pack chegar
            console.log(`[${botData.nome}] ⏳ Aguardando resource pack (max 15s)...`);
            let checkInterval = setInterval(() => {
                if (botData.resourcePackReady) {
                    clearInterval(checkInterval);
                    console.log(`[${botData.nome}] ✅ Resource pack recebido!`);
                    setTimeout(() => {
                        if (botData.status === 'online') {
                            botData.commandScheduler = new CommandScheduler(bot, botData);
                            botData.commandScheduler.start();
                            bots[index] = botData;
                        }
                    }, 3000);
                }
            }, 1000);
            
            // Timeout de 15 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!botData.resourcePackReady && botData.status === 'online') {
                    console.log(`[${botData.nome}] ⚠️ Timeout resource pack, iniciando mesmo assim...`);
                    botData.commandScheduler = new CommandScheduler(bot, botData);
                    botData.commandScheduler.start();
                    bots[index] = botData;
                }
            }, 15000);
        }
    });
    
    bot.on('error', (err) => {
        if (!err.message.includes('ETIMEDOUT')) {
            console.log(`[${botData.nome}] ⚠️ ${err.message}`);
        }
    });
    
    bot.on('end', () => {
        console.log(`[${botData.nome}] ❌ Desconectado`);
        
        if (botData.commandScheduler) {
            botData.commandScheduler.stop();
            botData.commandScheduler = null;
        }
        
        botData.status = 'offline';
        botData.bot = null;
        botData.resourcePackReady = false;
        bots[index] = botData;
        
        io.emit('botStatus', { id: botId, status: 'offline', nome: botData.nome });
        
        if (botData.running && (botData.reconnectAttempts || 0) < globalConfig.maxReconnectAttempts) {
            const delay = 30000;
            console.log(`[${botData.nome}] 🔄 Reconectando em ${delay/1000}s`);
            
            botData.reconnectTimeout = setTimeout(() => {
                botData.reconnectTimeout = null;
                bots[index] = botData;
                createBot(botId);
            }, delay);
        }
    });
    
    bot.on('kicked', (reason) => {
        let kickReason = '';
        if (typeof reason === 'string') kickReason = reason;
        else if (reason?.text) kickReason = reason.text;
        else kickReason = JSON.stringify(reason);
        
        console.log(`[${botData.nome}] 🚫 Kickado: ${kickReason.substring(0, 100)}`);
        
        botData.status = 'kicked';
        botData.resourcePackReady = false;
        bots[index] = botData;
        io.emit('botStatus', { id: botId, status: 'kicked', nome: botData.nome });
        
        if (botData.running && (botData.reconnectAttempts || 0) < globalConfig.maxReconnectAttempts) {
            setTimeout(() => {
                createBot(botId);
            }, 60000);
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/bots', (req, res) => {
    const botList = bots.map(bot => ({
        id: bot.id,
        nome: bot.nome,
        server: bot.server,
        port: bot.port,
        version: bot.version,
        status: bot.status,
        running: bot.running || false,
        autoSequence: bot.autoSequence || false,
        commandsCount: bot.commands?.length || 0
    }));
    res.json(botList);
});

app.get('/api/bots/stats', (req, res) => {
    res.json({
        total: bots.length,
        online: bots.filter(b => b.status === 'online').length,
        offline: bots.filter(b => b.status === 'offline').length,
        connecting: bots.filter(b => b.status === 'connecting').length,
        kicked: bots.filter(b => b.status === 'kicked').length,
        running: bots.filter(b => b.running).length,
        uptime: process.uptime()
    });
});

app.get('/api/bot/:id', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    res.json({
        id: bot.id,
        nome: bot.nome,
        server: bot.server,
        port: bot.port,
        version: bot.version,
        senha: bot.senha,
        status: bot.status,
        running: bot.running,
        autoSequence: bot.autoSequence,
        commands: bot.commands || []
    });
});

app.post('/api/bot/create', (req, res) => {
    const { nome, server, port, senha, version, autoSequence } = req.body;
    
    if (!nome || !server) {
        return res.status(400).json({ error: 'Nome e servidor são obrigatórios' });
    }
    
    const newBot = {
        id: nextBotId++,
        nome,
        server,
        port: port || 25565,
        version: version || '1.21.4',
        senha: senha || '',
        status: 'offline',
        running: false,
        autoSequence: autoSequence !== undefined ? autoSequence : true,
        commands: [],
        reconnectAttempts: 0,
        connecting: false,
        bot: null,
        commandScheduler: null,
        reconnectTimeout: null,
        resourcePackReady: false
    };
    
    bots.push(newBot);
    
    console.log(`✅ Bot criado: ${nome}`);
    res.json({ success: true, id: newBot.id });
});

app.post('/api/bot/:id/start', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    bot.running = true;
    bot.reconnectAttempts = 0;
    createBot(bot.id);
    
    res.json({ success: true });
});

app.post('/api/bot/:id/stop', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    bot.running = false;
    destroyBot(bot.id);
    
    res.json({ success: true });
});

app.delete('/api/bot/:id', (req, res) => {
    const index = bots.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Bot não encontrado' });
    
    destroyBot(bots[index].id);
    bots.splice(index, 1);
    
    res.json({ success: true });
});

app.post('/api/bot/:id/commands', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    let commands = req.body.commands;
    
    if (typeof commands === 'string') {
        commands = [commands];
    }
    
    if (!Array.isArray(commands) && req.body.command) {
        commands = [req.body.command];
    }
    
    if (!Array.isArray(commands)) {
        commands = [];
    }
    
    commands = commands.filter(cmd => cmd && cmd.trim().length > 0);
    
    bot.commands = commands;
    
    console.log(`[${bot.nome}] 📝 ${commands.length} comando(s) salvos`);
    
    if (bot.status === 'online' && bot.commandScheduler) {
        bot.commandScheduler.stop();
        if (bot.autoSequence && commands.length > 0) {
            bot.commandScheduler = new CommandScheduler(bot.bot, bot);
            bot.commandScheduler.start();
        }
    }
    
    res.json({ success: true, commands: commands });
});

app.post('/api/bot/:id/say', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });
    
    if (bot.status === 'online' && bot.bot && bot.bot.entity) {
        let msg = message;
        msg = msg.replace('{senha}', bot.senha || '');
        msg = msg.replace('{nome}', bot.nome);
        bot.bot.chat(msg);
        console.log(`[${bot.nome}] 💬 Manual: ${msg}`);
        res.json({ success: true, message: msg });
    } else {
        res.status(400).json({ error: 'Bot offline' });
    }
});

app.post('/api/bot/:id/toggleAuto', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    bot.autoSequence = !bot.autoSequence;
    res.json({ success: true, autoSequence: bot.autoSequence });
});

app.get('/api/config', (req, res) => {
    res.json(globalConfig);
});

app.post('/api/config', (req, res) => {
    globalConfig = { ...globalConfig, ...req.body };
    console.log('⚙️ Config atualizada');
    res.json({ success: true });
});

app.post('/api/bots/startAll', (req, res) => {
    const offlineBots = bots.filter(b => b.status === 'offline');
    
    offlineBots.forEach(bot => {
        bot.running = true;
        bot.reconnectAttempts = 0;
        createBot(bot.id);
    });
    
    res.json({ success: true, started: offlineBots.length });
});

app.post('/api/bots/stopAll', (req, res) => {
    const runningBots = bots.filter(b => b.status === 'online' || b.status === 'connecting');
    
    runningBots.forEach(bot => {
        bot.running = false;
        destroyBot(bot.id);
    });
    
    res.json({ success: true, stopped: runningBots.length });
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO
// ═══════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
    console.log('📡 Dashboard conectado');
    
    socket.emit('botList', bots.map(bot => ({
        id: bot.id,
        nome: bot.nome,
        server: bot.server,
        status: bot.status,
        running: bot.running,
        autoSequence: bot.autoSequence
    })));
});

// ═══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════

const PORT = globalConfig.webServerPort;

initializePreconfiguredBots();

server.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║      🤖 BOTCRAFT - SISTEMA SIMPLES                ║`);
    console.log(`╠════════════════════════════════════════════════════╣`);
    console.log(`║  🌐 Dashboard: http://localhost:${PORT}                  ║`);
    console.log(`║  🤖 Bots: ${bots.length}                                    ║`);
    console.log(`║  📦 ResourcePack: Aceita automaticamente           ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);
    
    if (bots.length > 0) {
        console.log('📋 BOTS:\n');
        bots.forEach(bot => {
            console.log(`   🤖 ${bot.nome} → ${bot.server}:${bot.port}`);
            console.log(`      📝 Comandos: ${bot.commands.join(' → ')}\n`);
        });
    }
});

function initializePreconfiguredBots() {
    if (bots.length === 0) {
        console.log('\n🎮 Inicializando bots pré-configurados...\n');
        
        PRECONFIGURED_BOTS.forEach((botConfig) => {
            const newBot = {
                id: nextBotId++,
                nome: botConfig.nome,
                server: botConfig.server,
                port: botConfig.port,
                version: botConfig.version,
                senha: botConfig.senha,
                status: 'offline',
                running: false,
                autoSequence: botConfig.autoSequence,
                commands: botConfig.commands,
                reconnectAttempts: 0,
                connecting: false,
                bot: null,
                commandScheduler: null,
                reconnectTimeout: null,
                resourcePackReady: false
            };
            
            bots.push(newBot);
            console.log(`✅ Bot pré-configurado: ${botConfig.nome}`);
        });
        
        console.log(`\n📊 Total: ${bots.length} bots\n`);
    }
}

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE COMANDOS
// ═══════════════════════════════════════════════════════════════

class CommandScheduler {
    constructor(bot, botData) {
        this.bot = bot;
        this.botData = botData;
        this.isRunning = false;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async executeCommand(cmd) {
        if (!this.bot?.entity || this.botData.status !== 'online') return false;
        
        let commandText = cmd;
        commandText = commandText.replace('{senha}', this.botData.senha || '');
        commandText = commandText.replace('{nome}', this.botData.nome);
        
        this.bot.chat(commandText);
        console.log(`[${this.botData.nome}] 💬 ${commandText}`);
        
        return true;
    }
    
    async start() {
        if (this.isRunning) return;
        if (!this.botData.commands || this.botData.commands.length === 0) {
            console.log(`[${this.botData.nome}] ⚠️ Nenhum comando`);
            return;
        }

        this.isRunning = true;
        
        // Aguarda o resource pack ser aceito primeiro
        console.log(`[${this.botData.nome}] ⏳ Aguardando resource pack...`);
        
        let waitTime = 0;
        while (!this.botData.resourcePackReady && waitTime < 20000) {
            await this.delay(500);
            waitTime += 500;
        }
        
        if (this.botData.resourcePackReady) {
            console.log(`[${this.botData.nome}] ✅ Resource pack pronto!`);
            await this.delay(3000); // Espera mais 3 segundos para garantir
        } else {
            console.log(`[${this.botData.nome}] ⚠️ Sem resource pack, continuando...`);
        }
        
        console.log(`[${this.botData.nome}] 🚀 Executando comandos...`);
        
        // Executa os comandos em sequência
        for (let i = 0; i < this.botData.commands.length; i++) {
            if (!this.isRunning || this.botData.status !== 'online') break;
            
            const cmd = this.botData.commands[i];
            if (cmd && cmd.trim()) {
                // Se for o comando /ac, dá um delay antes de executar
                if (cmd === "/ac" || cmd.includes("/ac")) {
                    console.log(`[${this.botData.nome}] ⏳ Aguardando 2s antes do /ac...`);
                    await this.delay(2000);
                }
                
                await this.executeCommand(cmd);
                
                // Delay entre comandos
                if (i === 0) {
                    console.log(`[${this.botData.nome}] ⏳ Aguardando 5s...`);
                    await this.delay(5000);
                } else if (i === 1) {
                    console.log(`[${this.botData.nome}] ⏳ Aguardando 8s...`);
                    await this.delay(8000);
                }
            }
        }
        
        console.log(`[${this.botData.nome}] ✅ Comandos finalizados! Bot em standby.`);
        this.isRunning = false;
    }
    
    stop() {
        this.isRunning = false;
    }
}

// ═══════════════════════════════════════════════════════════════
// GERENCIAMENTO DE BOTS
// ═══════════════════════════════════════════════════════════════

function getBotIndex(botId) {
    return bots.findIndex(b => b.id === botId);
}

function destroyBot(botId) {
    const index = getBotIndex(botId);
    if (index === -1) return;
    
    const botData = bots[index];
    
    if (botData.commandScheduler) {
        botData.commandScheduler.stop();
        botData.commandScheduler = null;
    }
    
    if (botData.reconnectTimeout) {
        clearTimeout(botData.reconnectTimeout);
        botData.reconnectTimeout = null;
    }
    
    if (botData.bot) {
        try { botData.bot.quit(); } catch(e) {}
        botData.bot = null;
    }
    
    botData.status = 'offline';
    botData.connecting = false;
    botData.resourcePackReady = false;
    
    bots[index] = botData;
    io.emit('botStatus', { id: botId, status: 'offline', nome: botData.nome });
}

function createBot(botId) {
    const index = getBotIndex(botId);
    if (index === -1) return;
    
    const botData = bots[index];
    if (botData.connecting || botData.status === 'online') return;
    
    destroyBot(botId);
    
    botData.connecting = true;
    botData.status = 'connecting';
    botData.reconnectAttempts = (botData.reconnectAttempts || 0) + 1;
    botData.resourcePackReady = false;
    bots[index] = botData;
    
    io.emit('botStatus', { id: botId, status: 'connecting', nome: botData.nome });
    
    console.log(`[${botData.nome}] 🔌 Conectando a ${botData.server}:${botData.port}`);
    
    const options = {
        host: botData.server,
        port: botData.port || 25565,
        username: botData.nome,
        version: botData.version || '1.21.4',
        auth: 'offline',
        connectTimeout: 30000,
        keepAlive: true,
        checkTimeoutInterval: 30000,
        viewDistance: 'normal',
        disableChatSigning: true,
        skipValidation: true,
        acceptResourcePack: true
    };
    
    const bot = mineflayer.createBot(options);
    botData.bot = bot;
    
    // Evento de resource pack - ACEITA IMEDIATAMENTE
    bot.on('resourcePack', (pack) => {
        console.log(`[${botData.nome}] 📦 Resource pack detectado! Aceitando...`);
        bot.acceptResourcePack();
        botData.resourcePackReady = true;
        bots[index] = botData;
    });
    
    bot.once('spawn', () => {
        console.log(`[${botData.nome}] ✅ Conectado! Aguardando resource pack...`);
        
        botData.connecting = false;
        botData.status = 'online';
        botData.reconnectAttempts = 0;
        bots[index] = botData;
        
        io.emit('botStatus', { id: botId, status: 'online', nome: botData.nome });
        
        // Se o resource pack já foi aceito, começa os comandos
        if (botData.resourcePackReady) {
            console.log(`[${botData.nome}] ✅ Resource pack pronto, iniciando comandos em 3s...`);
            setTimeout(() => {
                if (botData.status === 'online') {
                    botData.commandScheduler = new CommandScheduler(bot, botData);
                    botData.commandScheduler.start();
                    bots[index] = botData;
                }
            }, 3000);
        } else {
            // Aguarda o resource pack chegar
            console.log(`[${botData.nome}] ⏳ Aguardando resource pack (max 15s)...`);
            let checkInterval = setInterval(() => {
                if (botData.resourcePackReady) {
                    clearInterval(checkInterval);
                    console.log(`[${botData.nome}] ✅ Resource pack recebido!`);
                    setTimeout(() => {
                        if (botData.status === 'online') {
                            botData.commandScheduler = new CommandScheduler(bot, botData);
                            botData.commandScheduler.start();
                            bots[index] = botData;
                        }
                    }, 3000);
                }
            }, 1000);
            
            // Timeout de 15 segundos
            setTimeout(() => {
                clearInterval(checkInterval);
                if (!botData.resourcePackReady && botData.status === 'online') {
                    console.log(`[${botData.nome}] ⚠️ Timeout resource pack, iniciando mesmo assim...`);
                    botData.commandScheduler = new CommandScheduler(bot, botData);
                    botData.commandScheduler.start();
                    bots[index] = botData;
                }
            }, 15000);
        }
    });
    
    bot.on('error', (err) => {
        if (!err.message.includes('ETIMEDOUT')) {
            console.log(`[${botData.nome}] ⚠️ ${err.message}`);
        }
    });
    
    bot.on('end', () => {
        console.log(`[${botData.nome}] ❌ Desconectado`);
        
        if (botData.commandScheduler) {
            botData.commandScheduler.stop();
            botData.commandScheduler = null;
        }
        
        botData.status = 'offline';
        botData.bot = null;
        botData.resourcePackReady = false;
        bots[index] = botData;
        
        io.emit('botStatus', { id: botId, status: 'offline', nome: botData.nome });
        
        if (botData.running && (botData.reconnectAttempts || 0) < globalConfig.maxReconnectAttempts) {
            const delay = 30000;
            console.log(`[${botData.nome}] 🔄 Reconectando em ${delay/1000}s`);
            
            botData.reconnectTimeout = setTimeout(() => {
                botData.reconnectTimeout = null;
                bots[index] = botData;
                createBot(botId);
            }, delay);
        }
    });
    
    bot.on('kicked', (reason) => {
        let kickReason = '';
        if (typeof reason === 'string') kickReason = reason;
        else if (reason?.text) kickReason = reason.text;
        else kickReason = JSON.stringify(reason);
        
        console.log(`[${botData.nome}] 🚫 Kickado: ${kickReason.substring(0, 100)}`);
        
        botData.status = 'kicked';
        botData.resourcePackReady = false;
        bots[index] = botData;
        io.emit('botStatus', { id: botId, status: 'kicked', nome: botData.nome });
        
        if (botData.running && (botData.reconnectAttempts || 0) < globalConfig.maxReconnectAttempts) {
            setTimeout(() => {
                createBot(botId);
            }, 60000);
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get('/api/bots', (req, res) => {
    const botList = bots.map(bot => ({
        id: bot.id,
        nome: bot.nome,
        server: bot.server,
        port: bot.port,
        version: bot.version,
        status: bot.status,
        running: bot.running || false,
        autoSequence: bot.autoSequence || false,
        commandsCount: bot.commands?.length || 0
    }));
    res.json(botList);
});

app.get('/api/bots/stats', (req, res) => {
    res.json({
        total: bots.length,
        online: bots.filter(b => b.status === 'online').length,
        offline: bots.filter(b => b.status === 'offline').length,
        connecting: bots.filter(b => b.status === 'connecting').length,
        kicked: bots.filter(b => b.status === 'kicked').length,
        running: bots.filter(b => b.running).length,
        uptime: process.uptime()
    });
});

app.get('/api/bot/:id', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    res.json({
        id: bot.id,
        nome: bot.nome,
        server: bot.server,
        port: bot.port,
        version: bot.version,
        senha: bot.senha,
        status: bot.status,
        running: bot.running,
        autoSequence: bot.autoSequence,
        commands: bot.commands || []
    });
});

app.post('/api/bot/create', (req, res) => {
    const { nome, server, port, senha, version, autoSequence } = req.body;
    
    if (!nome || !server) {
        return res.status(400).json({ error: 'Nome e servidor são obrigatórios' });
    }
    
    const newBot = {
        id: nextBotId++,
        nome,
        server,
        port: port || 25565,
        version: version || '1.21.4',
        senha: senha || '',
        status: 'offline',
        running: false,
        autoSequence: autoSequence !== undefined ? autoSequence : true,
        commands: [],
        reconnectAttempts: 0,
        connecting: false,
        bot: null,
        commandScheduler: null,
        reconnectTimeout: null,
        resourcePackReady: false
    };
    
    bots.push(newBot);
    
    console.log(`✅ Bot criado: ${nome}`);
    res.json({ success: true, id: newBot.id });
});

app.post('/api/bot/:id/start', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    bot.running = true;
    bot.reconnectAttempts = 0;
    createBot(bot.id);
    
    res.json({ success: true });
});

app.post('/api/bot/:id/stop', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    bot.running = false;
    destroyBot(bot.id);
    
    res.json({ success: true });
});

app.delete('/api/bot/:id', (req, res) => {
    const index = bots.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Bot não encontrado' });
    
    destroyBot(bots[index].id);
    bots.splice(index, 1);
    
    res.json({ success: true });
});

app.post('/api/bot/:id/commands', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    let commands = req.body.commands;
    
    if (typeof commands === 'string') {
        commands = [commands];
    }
    
    if (!Array.isArray(commands) && req.body.command) {
        commands = [req.body.command];
    }
    
    if (!Array.isArray(commands)) {
        commands = [];
    }
    
    commands = commands.filter(cmd => cmd && cmd.trim().length > 0);
    
    bot.commands = commands;
    
    console.log(`[${bot.nome}] 📝 ${commands.length} comando(s) salvos`);
    
    if (bot.status === 'online' && bot.commandScheduler) {
        bot.commandScheduler.stop();
        if (bot.autoSequence && commands.length > 0) {
            bot.commandScheduler = new CommandScheduler(bot.bot, bot);
            bot.commandScheduler.start();
        }
    }
    
    res.json({ success: true, commands: commands });
});

app.post('/api/bot/:id/say', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Mensagem obrigatória' });
    
    if (bot.status === 'online' && bot.bot && bot.bot.entity) {
        let msg = message;
        msg = msg.replace('{senha}', bot.senha || '');
        msg = msg.replace('{nome}', bot.nome);
        bot.bot.chat(msg);
        console.log(`[${bot.nome}] 💬 Manual: ${msg}`);
        res.json({ success: true, message: msg });
    } else {
        res.status(400).json({ error: 'Bot offline' });
    }
});

app.post('/api/bot/:id/toggleAuto', (req, res) => {
    const bot = bots.find(b => b.id === parseInt(req.params.id));
    if (!bot) return res.status(404).json({ error: 'Bot não encontrado' });
    
    bot.autoSequence = !bot.autoSequence;
    res.json({ success: true, autoSequence: bot.autoSequence });
});

app.get('/api/config', (req, res) => {
    res.json(globalConfig);
});

app.post('/api/config', (req, res) => {
    globalConfig = { ...globalConfig, ...req.body };
    console.log('⚙️ Config atualizada');
    res.json({ success: true });
});

app.post('/api/bots/startAll', (req, res) => {
    const offlineBots = bots.filter(b => b.status === 'offline');
    
    offlineBots.forEach(bot => {
        bot.running = true;
        bot.reconnectAttempts = 0;
        createBot(bot.id);
    });
    
    res.json({ success: true, started: offlineBots.length });
});

app.post('/api/bots/stopAll', (req, res) => {
    const runningBots = bots.filter(b => b.status === 'online' || b.status === 'connecting');
    
    runningBots.forEach(bot => {
        bot.running = false;
        destroyBot(bot.id);
    });
    
    res.json({ success: true, stopped: runningBots.length });
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO
// ═══════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
    console.log('📡 Dashboard conectado');
    
    socket.emit('botList', bots.map(bot => ({
        id: bot.id,
        nome: bot.nome,
        server: bot.server,
        status: bot.status,
        running: bot.running,
        autoSequence: bot.autoSequence
    })));
});

// ═══════════════════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════

const PORT = globalConfig.webServerPort;

initializePreconfiguredBots();

server.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║      🤖 BOTCRAFT - SISTEMA SIMPLES                ║`);
    console.log(`╠════════════════════════════════════════════════════╣`);
    console.log(`║  🌐 Dashboard: http://localhost:${PORT}                  ║`);
    console.log(`║  🤖 Bots: ${bots.length}                                    ║`);
    console.log(`║  📦 ResourcePack: Aceita automaticamente           ║`);
    console.log(`╚════════════════════════════════════════════════════╝\n`);
    
    if (bots.length > 0) {
        console.log('📋 BOTS:\n');
        bots.forEach(bot => {
            console.log(`   🤖 ${bot.nome} → ${bot.server}:${bot.port}`);
            console.log(`      📝 Comandos: ${bot.commands.join(' → ')}\n`);
        });
    }
});
