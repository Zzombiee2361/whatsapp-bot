// const { Client } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');

const port = process.env.PORT | 8001;
let app = express();
console.log('PORT env: ', process.env.PORT);

app.use(express.static('public'));
app.use(cookieParser());

app.get('/get-cookie', (req, res) => {
	console.log('Cookies: ', req.cookies);
	res.send('Cookie: ' + JSON.stringify(req.cookies))
});

app.get('/set-cookie', (req, res) => {
	res.cookie('session', req.query.data);
	res.redirect('/');
});

let server = app.listen(port, function() {
	const host = server.address().address;
	console.log('Server started! Listening at http://%s:%s', host, port);
});

// let sessionData;
// if(fs.existsSync('./session.json')) {
// 	sessionData = require('./session.json');
// }

// const client = new Client({
// 	session: sessionData
// });

// client.on('qr', (qr) => {
// 	console.log('QR Received', qr);
// 	qrcode.generate(qr, { small: true });
// });

// client.on('authenticated', (session) => {
// 	sessionData = session;
// 	fs.writeFile('./session.json', JSON.stringify(session), (err) => {
// 		if(err) {
// 			console.error(err);
// 		}
// 	});
// });

// client.on('ready', () => {
// 	console.log('Client is ready');
// 	client.sendMessage("6285101493007@c.us", 'hello world');
// });

// client.on('message', (msg) => {
// 	console.log('Message: ' + msg.body);
// 	if(msg.body === '!hello') {
// 		msg.reply('hello there');
// 	}
// });

// client.initialize();