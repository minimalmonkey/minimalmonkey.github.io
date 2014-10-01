'use strict';

function EventEmitter() {}

var proto = EventEmitter.prototype;

proto._getEvents = function () {
	return this._events || (this._events = {});
};

proto._getListeners = function (evt) {
	var events = this._getEvents();
	return events[evt] || (events[evt] = []);
};

proto.on = function (evt, listener) {
	var listeners = this._getListeners(evt);
	var index = listeners.indexOf(listener);
	if (index < 0) {
		listeners.push(listener);
	}
};

proto.off = function (evt, listener) {
	var listeners = this._getListeners(evt);
	var index = listeners.indexOf(listener);
	if (index > -1) {
		listeners.splice(index, 1);
	}
};

proto.trigger = function (evt) {
	var listeners = this._getListeners(evt);
	var i = listeners.length;
	while (i--) {
		listeners[i].call();
	}
};

module.exports = EventEmitter;
