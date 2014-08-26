'use strict';

function TransitionWatcher () {
	this.listeners = [];
}

var proto = TransitionWatcher.prototype;

proto.complete = function () {
	this.trigger('complete');
};

proto.trigger = function (evt) {
	if (this.listeners[evt] && this.listeners[evt].length) {
		var i = this.listeners[evt].length;
		while (i--) {
			this.listeners[evt][i].call();
		}
	}
};

proto.on = function (evt, callback) {
	if (this.listeners[evt]) {
		this.listeners[evt].push(callback);
	}
	else {
		this.listeners[evt] = [callback];
	}
};

proto.off = function (evt, callback) {
	if (this.listeners[evt] && this.listeners[evt].length) {
		var i = this.listeners[evt].indexOf(callback);
		if (i > -1) {
			this.listeners[evt].splice(i, 1);
		}
	}
};

proto.clear = function () {
	this.listeners = [];
};

module.exports = TransitionWatcher;
