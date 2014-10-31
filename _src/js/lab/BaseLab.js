'use strict';

var throttleEvent = require('../utils/throttleEvent');

function BaseLab () {}

var proto = BaseLab.prototype;

proto.resize = function () {};
proto.update = function () {};

proto._clearCanvas = function () {
	if (this.context) {
		this.context.clearRect(0, 0, this.width, this.height);
	}
};

proto._onAnimationFrame = function () {
	if (this.active) {
		if (this.canvas) {
			this._clearCanvas();
		}
		this.update();
		window.requestAnimationFrame(this._onAnimationFrame.bind(this));
	}
};

proto._onResize = function (evt) {
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.resize();

	if (this.canvas) {
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}
};

proto.enable = function () {
	this._throttledResize = throttleEvent(this._onResize.bind(this), 50);
	window.addEventListener('resize', this._throttledResize, false);
	this._onResize();
	this.active = true;
	this.resize();
	this.update();
	window.requestAnimationFrame(this._onAnimationFrame.bind(this));
};

proto.disable = function () {
	this.active = false;
	window.removeEventListener('resize', this._throttledResize);
};

module.exports = BaseLab;
