(function() {
	'use strict';
	var app = angular.module('todoApp', []);

	app.constant('API_URL', 'http://localhost:3000');

	app.controller('TodoCtrl', function TodoCtrl(TodosFactory, UserFactory) {
		'use strict';
		var vm = this;
		vm.getTodos = getTodos;
		vm.login = login;

		function getTodos() {
			TodosFactory.getTodos().then(function success(res) {
				vm.todos = res.data;
			});
		}

		function login(email, password) {
			UserFactory.login(email, password)
				.then(function success(res) {
					//console.log(res.data);
					vm.user = res.data.user;
					alert(res.data.token);
				}, handleError);
		}

		function handleError(res) {
			alert('Error' + res.data);
		}
	});

	app.factory('TodosFactory', function TodosFactory($http, API_URL) {
		'use strict';
		return {
			getTodos: getTodos
		}

		function getTodos() {
			// return $http.get(API_URL + '/todos');
			return $http({
				method: 'GET',
				url: API_URL + '/todos',
				headers: {
					'Auth': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IlUyRnNkR1ZrWDErd0laNCtYV3N1K1dmWGd6M1VzN3cxVFlJdDVsZktGZFoyNVdHVGZWZEVSRnhra3B5VHBBMGtTSzFkb2VuZVB1emtmd2F0cHQ0RndnPT0iLCJpYXQiOjE0NTQ1MTM1MzB9.dys3RXfy-zh45toyU-orhsWPrmoFQlZ-i3QTUE6BEIk'
				}
			})
		}
	});

	app.factory('UserFactory', function UserFactory($http, API_URL) {
		'use strict';
		return {
			login:login
		}

		function login(email, password) {
			return $http.post(API_URL + '/users/login', {
				email: email,
				password: password
			});
		}
	});
})();