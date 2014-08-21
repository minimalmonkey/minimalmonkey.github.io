'use strict';

var addEventListenerList = require('../utils/addEventListenerList');
var routeToRegExp = require('./routeToRegExp');

function Router (options) {
	this.onClicked = this.onClicked.bind(this);
	addEventListenerList(document.querySelectorAll('[data-router]'), 'click', this.onClicked);

	window.addEventListener('popstate', function(evt) {
		this.navigate(location.pathname, true);
	}.bind(this));

	this.routes = {};
}

var proto = Router.prototype;

proto.onClicked = function (evt) {
	evt.preventDefault();
	this.navigate(evt.currentTarget.pathname);
};

proto.navigate = function (route, silent) {
	if (!silent) {
		history.pushState(null, null, route);
	}
	this.match(route);
};

proto.add = function (route, callback) {

	route = routeToRegExp(route);

	if (this.routes[route]) {
		if (this.routes[route].indexOf(callback) < 0) {
			this.routes[route].push(callback);
		}
	}
	else {
		this.routes[route] = [route, callback];
	}
};

proto.remove = function (route, callback) {
	//
};

proto.match = function (route, callback) {
	for (var key in this.routes) {

		console.log(route, this.routes[key][0], this.routes[key][0].exec(route));

		if (this.routes[key][0].test(route)) {
			var i = this.routes[key].length;
			while (--i > 0) {

				// var args = router.extractParameters(route, fragment);

				this.routes[key][i].apply(this, []);
			}
			// break;
		}
	}
};

proto.enable = function () {
	//
};

proto.disable = function () {
	//
};

module.exports = Router;
