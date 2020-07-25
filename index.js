const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const waConnect = require('./whatsapp');

let app = express();
let instance = new waConnect();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/authenticate', async (req, res) => {
	if(instance.qrCode === null && instance.sessionData && req.cookies.browser_id !== instance.sessionData.WABrowserId) {
		res.json({
			status: 'conflict'
		});
	} else if(instance.authenticated && instance.qrCode !== null && req.query.qr === instance.qrCode) {
		res.cookie('browser_id', instance.sessionData.WABrowserId);
		instance.qrCode = null;
	}

	const state = (instance.authenticated && instance.client ? await instance.client.getState() : 'DISCONNECTED');
	res.json({
		status: 'success',
		data: {
			state: state,
			qr: instance.qrCode,
		},
	});
});

app.post('/send', (req, res) => {
	if(!instance.authenticated) {
		res.status(401).json({
			status: 'error',
			message: 'Unauthenticated',
		});
	} else if(instance.sessionData && req.cookies.browser_id !== instance.sessionData.WABrowserId) {
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
	instance.client.sendMessage(nomor, text);
	res.json({
		status: 'success'
	});
});

app.get('/logout', (req, res) => {
	instance.client.logout();
	fs.unlinkSync('./session.json');
	instance = new waConnect();
	res.json({
		status: 'success'
	});
});

let server = app.listen(process.env.PORT, function() {
	const host = server.address().address;
	const port = server.address().port;
	console.log('Server started! Listening at http://%s:%s', host, port);
});

instance.client.on('disconnected', (reason) => {
	console.log('DISCONNECTED:', reason);
	if(reason === 'UNPAIRED') {
		fs.unlinkSync('./session.json');
		instance = new waConnect();
	}
});
