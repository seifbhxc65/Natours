const http = require("https");

const options = {
	"method": "POST",
	"hostname": "d7sms.p.rapidapi.com",
	"port": null,
	"path": "/secure/send",
	"headers": {
		"content-type": "application/json",
		"Authorization": "Basic SG91c3NlaW5IbWlsYTpLYWlyb3VhbjEyLg==",
		"X-RapidAPI-Key": "f7a3a84934msh1c7a8c3b5601e7cp128dc0jsn358cb41853a9",
		"X-RapidAPI-Host": "d7sms.p.rapidapi.com",
		"useQueryString": true
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on("data", function (chunk) {
		chunks.push(chunk);
	});

	res.on("end", function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.write(JSON.stringify({
  coding: '8',
  from: 'SMSInfo',
  'hex-content': '00480065006c006c006f',
  to: 971562316353
}));
req.end();