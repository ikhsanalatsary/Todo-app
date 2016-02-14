;(function() {
	'use strict';
	var app = angular.module('todoApp', []);

	app.config(function config($httpProvider) {
		$httpProvider.interceptors.push('AuthInterceptor');
	});

	app.controller('TodoCtrl', function TodoCtrl(TodosFactory, UserFactory, $filter) {

		// Exports to view
		var vm = this;
		// vm.getTodos = getTodos;
		vm.login = login;
		vm.logout = logout;
		vm.register = register;
		vm.checkSomething = checkSomething;
		vm.addTodo = addTodo;
		vm.removeTodo = removeTodo;
		vm.toggleCompleted = toggleCompleted;
		vm.editTodo = editTodo;
		vm.saveEdits = saveEdits;
		vm.markAll = markAll;
		vm.revertEdits = revertEdits;
		vm.currentPage = 0;
		vm.pageSize = 10;
		vm.numberOfPages = numberOfPages;
		vm.getData = getData;
		// vm.q = '';

		// invocation / Initializations for authorized user. for fix refresh
		UserFactory.getUser(vm.user).then(function success(res) {
			vm.user = res.data;
			getTodos();
		});

		function getTodos() {
			TodosFactory.getTodos().then(function success(res) {
				vm.todos = res.data;
			}, handleError);
		}

		function numberOfPages() {
			if (vm.todos) {
				return Math.ceil(vm.todos.length/vm.pageSize);
			}
		}

		function getData () {
			if (vm.todos) {
				return $filter('filter')(vm.todos);
			}
		}

		function login(email, password) {
			UserFactory.login(email, password)
				.then(function success(res) {
					vm.user = res.data.user;
					getTodos();
				}, handleError);
		}

		function logout() {
			UserFactory.logout();
			vm.email = null;
			vm.password = null;
			vm.user = null;
			vm.registered = null;
		}

		function register (email, password) {
			UserFactory.register(email, password)
				.then(function success(res) {
					vm.registered = res.data;
					alert('Registered, you can login');
				}, function (res) {
					alert('Error ' + res.status + ' status ' + res.data.errors[0].message );
				})
				.finally(function () {
					email = null;
					password = null;
				});
		}

		function checkSomething() {
			if(vm.registered || vm.user) {
				return true;
			}
		}

		function addTodo(description) {
			if (!description.length) {
				return;
			}

			vm.saving = true;

			TodosFactory.insert(description)
				.then(function success(res) {
					vm.description = null;
				}, function() {
					alert('Error ' + res.status + ' status ' + res.data.errors[0].message );
				})
				.finally(function() {
					vm.saving = false; //set false, for fix hanging in browser
					getTodos();
				});
		}

		function removeTodo(todo) {
			TodosFactory.delTodos(todo).then(function success(res) {
				console.log(res.status);
			})
			.finally(function() {
				getTodos();
			});
		}

		function toggleCompleted(todo, completed) {
			if (angular.isDefined(completed)) {
				todo.completed = completed;
			}
			TodosFactory.editCompleted(todo).then(function success() {}, handleError);
		}

		function editTodo(todo) {
			vm.editedTodo = todo;
			// Clone the original todo to restore it on demand, such as click mouse in any spot of page & click escape button
			vm.originalTodo = angular.extend({}, todo);
		}

		function saveEdits(todo, event) {
			if (event === 'blur' && vm.saveEvent === 'submit') {
				vm.saveEvent = null;
				return;
			}

			vm.saveEvent = event;

			todo.description = todo.description.trim();

			if (todo.description === vm.originalTodo.description) {
				vm.editedTodo = null;
				return;
			}

			TodosFactory[todo.description ? 'editCompleted' : 'delTodos'](todo)
				.then(function success() {}, function(err) {
					todo.description = vm.originalTodo.description;
				})
				.finally(function() {
					vm.editedTodo = null;
					getTodos();
				});
		}

		function markAll(completed) {
			vm.todos.forEach(function (todo) {
				if (todo.completed !== completed) {
					toggleCompleted(todo, completed);
				}
			});
		}

		function revertEdits(todo) {
			// set to original todo for restore it after clicked escape button
			vm.todos[vm.todos.indexOf(todo)] = vm.originalTodo;
			vm.editedTodo = null;
			vm.originalTodo = null;
		}

		function handleError(res) {
			alert('Error ' + res.status + ' status ' + res.statusText);
		}

	});

	app.factory('TodosFactory', function TodosFactory($http) {

		return {
			getTodos: getTodos,
			insert: insert,
			delTodos: delTodos,
			editCompleted: editCompleted
		};

		function getTodos() {
			return $http.get('/todos');
		}

		function insert(description) {
			return $http.post('/todos', {
				description: description
			});
		}

		function delTodos(todo) {
			return $http.delete('/todos/' + todo.id);
		}

		function editCompleted(todo) {
			return $http.put('/todos/' + todo.id, {
				description: todo.description,
				completed: todo.completed
			});
		}

	});

	app.factory('UserFactory', function UserFactory($http, AuthTokenFactory, $q) {

		return {
			login: login,
			logout: logout,
			getUser: getUser,
			register: register
		};

		function login(email, password) {
			return $http.post('/users/login', {
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

		function getUser(vmUser) {
			if (!vmUser || AuthTokenFactory.getToken()) {
				return $http.get('/me');
			}
			else {
				$q.reject({data: 'No Authorized Token'});
			}
		}

		function register(email, password) {
			if (typeof email === 'string' && typeof password === 'string') {
				return $http.post('/users', {
					email: email,
					password: password
				});
			}
		}

	});

	app.factory('AuthTokenFactory', function AuthTokenFactory($window) {

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
			}
		}

	});

	app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {

		return {
			request: addToken
		};

		function addToken(config) {
			var token = AuthTokenFactory.getToken();
			if (token) {
				config.headers = config.headers || {};
				config.headers.Auth = token;
			}

			return config;
		}
	});

	app.directive('todoFocus', function todoFocus($timeout) {
		return function (scope, elem, attrs) {
			scope.$watch(attrs.todoFocus, function(newVal) {
				if(newVal) {
					$timeout(function() {
						elem[0].focus();
					}, 0, false);
				}
			});
		};
	});

	app.directive('todoEscape', function todoEscape() {
		var ESCAPE_KEY = 27;

		return function(scope, elem, attrs) {
			elem.bind('keydown', function(event) {
				if (event.keyCode === ESCAPE_KEY) {
					scope.$apply(attrs.todoEscape);
				}
			});

			scope.$on('$destroy', function() {
				elem.unbind('keydown');
			});
		};
	});

	app.directive('iosDblclick',
		function () {

			const DblClickInterval = 300; //milliseconds

			var firstClickTime;
			var waitingSecondClick = false;

			return {
				restrict: 'A',
				link: function (scope, element, attrs) {
					element.bind('click', function (e) {

						if (!waitingSecondClick) {
							firstClickTime = (new Date()).getTime();
							waitingSecondClick = true;

						setTimeout(function () {
							waitingSecondClick = false;
						}, DblClickInterval);
					}
					else {
						waitingSecondClick = false;

						var time = (new Date()).getTime();
						if (time - firstClickTime < DblClickInterval) {
							scope.$apply(attrs.iosDblclick);
						}
					}
				});
			}
		};
	});

	app.filter('startFrom', function() {
		return function(input, start) {
			start = +start; //parse to int
			if(input) {
				return input.slice(start);
			}
		}
	});

})();