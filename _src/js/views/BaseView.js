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
	Breakpoints.on('in:stacked', this.onStackedBreakpoint.bind(this));
	Breakpoints.on('in:horizontal', this.onHorizontalBreakpoint.bind(this));
};

proto.unbindBreakpointListeners = function () {
	Breakpoints.off('in:stacked', this.onStackedBreakpoint.bind(this));
	Breakpoints.off('in:horizontal', this.onHorizontalBreakpoint.bind(this));
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
