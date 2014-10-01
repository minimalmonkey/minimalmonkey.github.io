'use strict';

var EventEmitter = require('../components/EventEmitter');

function BaseView() {}

var proto = BaseView.prototype = new EventEmitter();

proto.show = function (fromState) {
	//
};

proto.hide = function (nextState) {
	//
};

proto.load = function () {
	//
};

proto.onShowed = function () {
	this.trigger('onshowed');
};

proto.onHidden = function () {
	this.trigger('onhidden');
};

proto.onLoaded = function () {
	this.trigger('onloaded');
};

module.exports = BaseView;
