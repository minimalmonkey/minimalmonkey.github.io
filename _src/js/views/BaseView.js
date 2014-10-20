'use strict';

var loadPage = require('../components/loadPage');
var transitionEndEvent = require('../utils/transitionEndEvent')();

var Breakpoints = require('../components/Breakpoints');
var EventEmitter = require('../components/EventEmitter');

function BaseView() {}

var proto = BaseView.prototype = new EventEmitter();

proto.loadSelectors = [];
proto.pages = {};

proto.bindBreakpointListeners = function () {
	if (!this.boundBreakpoints) {
		// hmmm don't really like this, think of a better way
		this.boundBreakpoints = true;
		this.onStackedBreakpoint = this.onStackedBreakpoint.bind(this);
		this.onHorizontalBreakpoint = this.onHorizontalBreakpoint.bind(this);
	}
	Breakpoints.on('in:' + Breakpoints.STACKED, this.onStackedBreakpoint);
	Breakpoints.on('in:' + Breakpoints.HORIZONTAL, this.onHorizontalBreakpoint);
};

proto.unbindBreakpointListeners = function () {
	Breakpoints.off('in:' + Breakpoints.STACKED, this.onStackedBreakpoint);
	Breakpoints.off('in:' + Breakpoints.HORIZONTAL, this.onHorizontalBreakpoint);
};

proto.deeplinked = function () {
	var elements = [];
	var i = this.loadSelectors.length;
	while (i--) {
		elements[i] = document.querySelectorAll(this.loadSelectors[i]);
	}
	this.pages[location.pathname] = elements;
};

proto.update = function (url) {};

proto.show = function (fromState, lastUrl) {};

proto.hide = function (nextState) {};

proto.load = function (url) {
	if (url && this.pages[url] === undefined) {
		this.pages[url] = 'loading';
		loadPage.apply(this, [url, this.onLoaded.bind(this)].concat(this.loadSelectors));
	}
};

proto.hasPage = function (url) {
	return this.pages[url] && this.pages[url] !== 'loading';
};

proto.listenToTransitionEnd = function (el, callback) {
	var context = this;
	var onTransitionEnded = function (evt) {
		el.removeEventListener(transitionEndEvent, onTransitionEnded);
		callback.call(context);
	};
	el.addEventListener(transitionEndEvent, onTransitionEnded, false);
};

proto.onShowed = function () {
	this.trigger('onshowed');
	this.enable();
};

proto.onHidden = function () {
	this.trigger('onhidden');
	this.disable();
};

proto.onIntroComplete = function (evt) {
	this.trigger('onintrocomplete');
	this.enable();
};

proto.onLoaded = function () {
	var args = Array.prototype.slice.call(arguments, 0);
	var url = args.shift();
	this.pages[url] = args;
	this.trigger('onloaded', {
		url: url,
		args: args
	});
};

proto.onStackedBreakpoint = function (evt) {};

proto.onHorizontalBreakpoint = function (evt) {};

proto.enable = function () {};

proto.disable = function () {};

module.exports = BaseView;
