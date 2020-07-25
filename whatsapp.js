const fs = require('fs');
const { Client } = require('whatsapp-web.js');

function waConnect() {
	const commands = {
		help: `Selamat datang di whatsapp-bot test.
Cara menggunakan
	\`\`\`!bot <perintah>\`\`\`
Perintah yang tersedia:
\`\`\`help    Tampilkan pesan ini
version Tampilkan versi bot
hi      Hello!\`\`\``,
		version: '0.0.1',
		hi: 'Hello there',
	};
	
	this.qrCode = null;
	this.authenticated = false;
	if(fs.existsSync('./session.json')) {
		this.sessionData = require('./session.json');
	}

	const client = new Client({
		puppeteer: {
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		},
		session: this.sessionData,
		restartOnAuthFail: true,
	});
	this.client = client;

	client.on('qr', (qr) => {
		console.log('QR Received', qr);
		this.qrCode = qr;
	});

	client.on('authenticated', (session) => {
		this.sessionData = session;
		fs.writeFile('./session.json', JSON.stringify(session), (err) => {
			if(err) {
				console.error(err);
			}
		});
		this.authenticated = true;
	});

	client.on('auth_failure', (message) => {
		console.log('Authentication Failed: ', message);
		fs.unlinkSync('./session.json');
		this.authenticated = false;
	});

	client.on('ready', () => {
		console.log('Client is ready');
	});

	client.on('message', (msg) => {
		if(/^!bot/.test(msg.body)) {
			const cmd = msg.body.split(' ')[1];
			console.log('Command: ', msg.body);
			msg.reply(commands[cmd]);
		}
	});

	client.initialize();
}

module.exports = waConnect;