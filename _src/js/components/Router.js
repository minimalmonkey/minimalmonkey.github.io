'use strict';

var addEventListenerList = require('../utils/addEventListenerList');
var routeToRegExp = require('./routeToRegExp');

function Router (analytics, observeList) {
	this.analytics = analytics;
	this.lastURL = this.currentURL = location.pathname;

	this.onClicked = this.onClicked.bind(this);
	addEventListenerList(document.querySelectorAll('[data-router]'), 'click', this.onClicked);

	if (observeList && observeList.length) {
		this.observer = new MutationObserver(this.onAddedElements.bind(this));
		var config = {
			attributes: false,
			characterData: false,
			childList: true
		};
		var i = observeList.length;
		while (i--) {
			this.observer.observe(observeList[i], config);
		}
	}

	window.addEventListener('popstate', function(evt) {
		this.navigate(location.pathname, true);
	}.bind(this));

	this.routes = {};
}

var proto = Router.prototype;

proto.onAddedElements = function (mutations) {
	mutations.forEach(function (mutation) {
		var i = mutation.addedNodes.length;
		while (i--) {
			if (mutation.addedNodes[i].dataset.router !== undefined) {
				mutation.addedNodes[i].addEventListener('click', this.onClicked);
			}
			else {
				// TODO: get any children nodes with data-router
			}
		}
	}.bind(this));
};

proto.onClicked = function (evt) {
	evt.preventDefault();
	this.navigate(evt.currentTarget.pathname);
};

proto.navigate = function (route, silent) {
	if (route === this.currentURL) {
		return;
	}

	if (!silent) {
		history.pushState(null, null, route);
	}

	this.lastURL = this.currentURL;
	this.currentURL = route;

	this.match(route);

	this.analytics.update(route);
};

proto.getRoutes = function (route) {
	if (this.routes[route] === undefined) {
		this.routes[route] = {
			pattern: route,
			listeners: []
		};
	}
	return this.routes[route];
};

proto.add = function (route, callback) {
	route = routeToRegExp(route);
	var routes = this.getRoutes(route);
	routes.listeners.push({
		callback: callback,
		args: Array.prototype.slice.call(arguments).splice(2)
	});
};

proto.remove = function (route, callback) {
	//
};

proto.match = function (route) {
	var exec;
	for (var key in this.routes) {
		exec = this.routes[key].pattern.exec(route);
		if (exec && exec.length) {
			exec = exec.splice(0, 2);
			var listener;
			var i = this.routes[key].listeners.length;
			while (i--) {
				listener = this.routes[key].listeners[i];
				listener.callback.apply(this, listener.args.concat(exec));
			}
			break;
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
