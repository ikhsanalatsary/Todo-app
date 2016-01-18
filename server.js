var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var middleware = require('./middleware');


app.use(middleware.logger);

app.get('/about', middleware.requireAuthentication, function (req, res) {
	res.send('About Us');
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function (error) {
	if (error) {
		throw error
	};
	console.log('Server running on port ' + PORT + '!');
});