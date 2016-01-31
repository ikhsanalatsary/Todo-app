'use strict';

function middleware (db) {
	var middleware = {
		requireAuthentication: function(req, res, next) {
			var token = req.get('Auth');

			db.user.findBytoken(token).then(function (user) {
				req.user = user;
				next();
			},
			function() {
				res.status(401).send(); // stop the process, no need call next()
			});
		},
		logger: function(req, res, next) {
			var date = new Date().toString();
			console.log('Request: ' + date + ' ' + req.method + ' ' + req.originalUrl);
			next();
		}
	}

	return middleware;
}


module.exports = middleware;