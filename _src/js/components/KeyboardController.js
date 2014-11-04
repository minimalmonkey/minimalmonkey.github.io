'use strict';

var EventEmitter = require('../components/EventEmitter');

function KeyboardController (el, events) {
	this._el = el || document.body;
	this._events = events || {};
	this._onKeyDown = this._onKeyDown.bind(this);
}

var proto = KeyboardController.prototype = new EventEmitter();

proto._onKeyDown = function (evt) {
	var keyCode = evt.keyCode;
	var eventName = this._events[evt.keyCode];
	if (eventName) {
		this.trigger(eventName, {
			keyCode: keyCode,
			eventName: eventName
		});
	}
};

proto.enable = function () {
	this._el.addEventListener('keydown', this._onKeyDown, false);
};

proto.disable = function () {
	this._el.removeEventListener('keydown', this._onKeyDown);
};

module.exports = KeyboardController;
