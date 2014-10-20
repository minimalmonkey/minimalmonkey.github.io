'use strict';

var throttleEvent = require('../utils/throttleEvent');

var EventEmitter = require('../components/EventEmitter');

function Breakpoints() {
	this.points = {};
	this.generateFromJSON();
}

var proto = Breakpoints.prototype = new EventEmitter();

proto.generateFromJSON = function () {
	var str = window.getComputedStyle(document.querySelector('html'), '::after').getPropertyValue('content');
	str = str.substr(1, str.length-2);
	var json = JSON.parse(str);

	// TODO: add an `add` mathod that takes an object and do the loop there rather than here
	for (var name in json) {
		this.add(name, json[name].from, json[name].to);
	}
};

proto.add = function (name, from, to) {
	this[name.toUpperCase()] = name; // TODO: check that doesn't already exist
	this.points[name] = {
		from: from,
		to: to
	};
};

proto.remove = function (name) {
	if (this.points[name]) {
		this[name.toUpperCase()] = undefined;
		this.points[name] = undefined;
	}
};

proto.contains = function (name) {
	// TODO: don't like use of indexOf here - use an object instead
	return this.currentPoints && this.currentPoints.indexOf(name) > -1;
};

proto.onResized = function () {
	var winWidth = window.innerWidth;
	var current = [];

	for (var point in this.points) {
		if (this.points[point].from <= winWidth && this.points[point].to >= winWidth) {
			current.push(point);
		}
	}

	// TODO: use objects and JSON.stringify

	if (current.join() !== this.currentPoints.join()) {

		var i = this.currentPoints.length;
		while (i--) {
			if (current.indexOf(this.currentPoints[i]) < 0) {
				this.trigger('out:' + this.currentPoints[i]);
			}
		}

		i = current.length;
		while (i--) {
			if (this.currentPoints.indexOf(current[i]) < 0) {
				this.trigger('in:' + current[i]);
			}
		}

		this.currentPoints = current;
		this.trigger('update', {
			points: this.currentPoints
		});
	}
};

proto.enable = function () {
	this.currentPoints = [];
	this.throttledResize = throttleEvent(this.onResized.bind(this), 50);
	window.addEventListener('resize', this.throttledResize, false);
	this.onResized();
};

proto.disable = function () {
	window.removeEventListener('resize', this.throttledResize);
};

module.exports = new Breakpoints();
