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

proto._setListeners = function (evt, listeners) {
	var events = this._getEvents();
	events[evt] = listeners;
};

proto.on = function (evt, listener) {
	if (typeof listener !== 'function') {
		// throw error ?
		return;
	}
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
		this._setListeners(evt, listeners.slice(0, index).concat(listeners.slice(index + 1)));
	}
};

proto.trigger = function (evt, obj) {
	obj = obj || {};
	obj.target = obj.target || this;
	var listeners = this._getListeners(evt);
	var i, len = listeners.length;
	// console.log('trigger', evt, this);
	for (i = 0; i < len; i++) {
		// console.log(listeners[i]);
		listeners[i].call(this, obj);
	}
};

module.exports = EventEmitter;
