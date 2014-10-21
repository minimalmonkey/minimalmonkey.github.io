'use strict';

var throttleEvent = require('../utils/throttleEvent');

var EventEmitter = require('../components/EventEmitter');

function Breakpoints() {
	this._points = {};
	this._currentPoints = {};
	this._generateFromJSON();
}

var proto = Breakpoints.prototype = new EventEmitter();

proto._generateFromJSON = function () {
	var str = window.getComputedStyle(document.querySelector('html'), '::after').getPropertyValue('content');
	if (str) {
		str = str.substr(1, str.length-2);
		var json = JSON.parse(str);
		this.addFromObject(json);
	}
};

proto.addFromObject = function (obj) {
	for (var name in obj) {
		this.add(name, obj[name].from, obj[name].to);
	}
};

proto.add = function (name, from, to) {
	this[name.toUpperCase()] = name;
	this._points[name] = {
		from: from,
		to: to
	};
};

proto.remove = function (name) {
	if (this._points[name]) {
		this[name.toUpperCase()] = undefined;
		delete this._points[name];
		delete this._currentPoints[name];
	}
};

proto.contains = function (name) {
	return this._currentPoints[name];
};

proto._onResized = function () {
	var isActive;
	var changed = false;
	var winWidth = window.innerWidth;

	for (var point in this._points) {
		isActive = this._points[point].from <= winWidth && this._points[point].to >= winWidth;
		if (this._currentPoints[point] !== isActive) {
			this._currentPoints[point] = isActive;
			this.trigger((isActive ? 'in' : 'out') + ':' + point);
			changed = true;
		}
	}

	if (changed) {
		this.trigger('update', {
			points: this._currentPoints
		});
	}
};

proto.enable = function () {
	this._throttledResize = throttleEvent(this._onResized.bind(this), 50);
	window.addEventListener('resize', this._throttledResize, false);
	this._onResized();
};

proto.disable = function () {
	window.removeEventListener('resize', this._throttledResize);
};

module.exports = new Breakpoints();
