const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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

let qrCode = null;
let authenticated = false;

let app = express();
console.log('PORT env: ', process.env.PORT | 8001);
const port = process.env.PORT | 8001;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/authenticate', async (req, res) => {
	if(qrCode === null && sessionData && req.cookies.browser_id !== sessionData.WABrowserId) {
		res.json({
			status: 'conflict'
		});
	} else if(authenticated && qrCode !== null && req.query.qr === qrCode) {
		res.cookie('browser_id', sessionData.WABrowserId);
		qrCode = null;
	}

	res.json({
		status: 'success',
		data: {
			qr: qrCode,
		},
	});
});

app.post('/send', (req, res) => {
	if(!authenticated) {
		res.status(401).json({
			status: 'error',
			message: 'Unauthenticated',
		});
	} else if(sessionData && req.cookies.browser_id !== sessionData.WABrowserId) {
		res.status(403).json({
			status: 'error',
			message: 'Unauthorized',
		});
	}
	
	let nomor = req.body.nomor.replace(/[^0-9]/g, '');
	nomor = nomor.replace(/^0/, '62') + '@c.us';
	const text = req.body.text;

	console.log('Sending message to: ', nomor);
	console.log('Message: ', text);
	client.sendMessage(nomor, text);
	res.json({
		status: 'success'
	});
});

app.get('/logout', (req, res) => {
	client.logout();
	fs.unlinkSync('./session.json');
	authenticated = false;
	res.json({
		status: 'success'
	});
});

let server = app.listen(port, function() {
	const host = server.address().address;
	console.log('Server started! Listening at http://%s:%s', host, port);
});

let sessionData;
if(fs.existsSync('./session.json')) {
	sessionData = require('./session.json');
}

const client = new Client({
	session: sessionData,
	restartOnAuthFail: true,
});

client.on('qr', (qr) => {
	console.log('QR Received', qr);
	qrCode = qr;
});

client.on('authenticated', (session) => {
	sessionData = session;
	fs.writeFile('./session.json', JSON.stringify(session), (err) => {
		if(err) {
			console.error(err);
		}
	});
	authenticated = true;
});

client.on('auth_failure', (message) => {
	console.log('Authentication Failed: ', message);
	fs.unlinkSync('./session.json');
	authenticated = false;
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

client.on('disconnected', (state) => {
	console.log('Disconnected: ', state);
});

client.initialize();