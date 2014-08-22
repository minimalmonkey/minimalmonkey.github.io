'use strict';

var addEventListenerList = require('../utils/addEventListenerList');
var routeToRegExp = require('./routeToRegExp');

function Router () {
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
	if (route === location.pathname) {
		return;
	}
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
	var exec;
	for (var key in this.routes) {
		exec = this.routes[key][0].exec(route);
		if (exec && exec.length) {
			var i = this.routes[key].length;
			while (--i > 0) {
				this.routes[key][i].apply(this, exec.splice(0, 2));
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
