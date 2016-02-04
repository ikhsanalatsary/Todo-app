(function() {
	'use strict';
	var app = angular.module('todoApp', []);

	app.config(function config($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	});

	app.constant('API_URL', 'http://localhost:3000');

	app.controller('TodoCtrl', function TodoCtrl(TodosFactory, UserFactory) {
		'use strict';
		var vm = this;
		vm.getTodos = getTodos;
		vm.login = login;
		vm.logout = logout;

		function getTodos() {
			TodosFactory.getTodos().then(function success(res) {
				vm.todos = res.data;
			}, handleError);
		}

		function login(email, password) {
			UserFactory.login(email, password)
				.then(function success(res) {
					//console.log(res.data);
					// var authHeader = res.headers('Auth');
					vm.user = res.data.user;
					// localStorage.setItem('Auth', authHeader);
					// alert(res.data.token);
				}, handleError);
		}

		function logout() {
			UserFactory.logout();
			vm.email = '';
			vm.password = '';
			vm.user = '';
		}

		function handleError(res) {
			alert('Error ' + res.status);
		}
	});

	app.factory('TodosFactory', function TodosFactory($http, API_URL) {
		'use strict';
		return {
			getTodos: getTodos
		};

		function getTodos() {
			return $http.get(API_URL + '/todos');
			// return $http({
			// 	method: 'GET',
			// 	url: API_URL + '/todos',
			// 	headers: {
			// 		'Auth': localStorage.getItem('Auth')
			// 	}
			// })
		}
	});

	app.factory('UserFactory', function UserFactory($http, API_URL, AuthTokenFactory) {
		'use strict';
		return {
			login: login,
			logout: logout
		};

		function login(email, password) {
			return $http.post(API_URL + '/users/login', {
				email: email,
				password: password
			}).then(function success(res) {
				AuthTokenFactory.setToken(res.data.token);
				return res;
			});
		}

		function logout() {
			AuthTokenFactory.setToken();
		}
	});

	app.factory('AuthTokenFactory', function AuthTokenFactory($window) {
		'use strict';
		var store = $window.localStorage;
		var key = 'Auth';
		return {
			getToken: getToken,
			setToken: setToken
		};

		function getToken() {
			return store.getItem(key);
		}

		function setToken(token) {
			if (token) {
				store.setItem(key, token);
			} else {
				store.removeItem(key);
			};
		}
	});

	app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
		'use strict';
		return {
			request: addToken
		};

		function addToken(config) {
			var token = AuthTokenFactory.getToken();

			if (token) {
				config.headers = config.headers || {};
				config.headers.Auth = token;
			};

			return config;
		}
	})
})();