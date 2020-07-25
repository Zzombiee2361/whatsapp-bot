var qrCode = new QRCode('qrcode', {
	width: 256,
	height: 256,
});

function displayUi(ui) {
	$('.card').addClass('d-none');
	$('#ui-'+ui).removeClass('d-none');
}

function authenticate(qr) {
	$.get('/authenticate' + (qr ? '?qr='+encodeURIComponent(qr) : ''), (data) => {
		if(data.status === 'success') {
			if(data.data.state === 'CONNECTED' && data.data.qr === null) {
				displayUi('main');
				qrCode.clear();
			} else if(data.data.qr !== null) {
				displayUi('qr');
				qrCode.makeCode(data.data.qr);
				setTimeout(() => authenticate(data.data.qr), 1000);
			} else {
				displayUi('loading');
				setTimeout(authenticate, 3000);
			}
		} else if(data.status === 'conflict') {
			displayUi('conflict');
		}
	}, 'json');
}

authenticate();

$('form').on('submit', function(event) {
	event.preventDefault();
	const formData = $(this).serialize();
	const formControl = $(this).find('button, input, select');
	formControl.prop('disabled', true);
	$.ajax({
		url: this.action,
		method: this.method,
		data: formData,
		success: (data) => {
			$(this).find('#text').val('');
		},
		error: (xhr) => {
			if(xhr.status === 401) {
				authenticate();
			} else if(xhr.status === 403) {
				displayUi('conflict');
			} else {
				alert('Terjadi kesalahan di server');
				console.log(xhr);
			}
		},
		complete: () => {
			formControl.prop('disabled', false);
		}
	});
});

// $('.logout-btn').on('click', function() {
// 	$.get('/logout', function() {
// 		authenticate();
// 	});
// });