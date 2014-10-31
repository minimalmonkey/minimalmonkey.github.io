'use strict';

function MouseTracker (el) {
	this._el = el;
	this._onMouseOver = this._onMouseOver.bind(this);
	this._onMouseOut = this._onMouseOut.bind(this);
	this._onMouseMove = this._onMouseMove.bind(this);
}

var proto = MouseTracker.prototype;

proto._onMouseOver = function (evt) {
	this.isOver = true;
	this._onMouseMove(evt);
	this._el.removeEventListener('mouseover', this._onMouseOver);
	this._el.addEventListener('mouseout', this._onMouseOut, false);
	this._el.addEventListener('mousemove', this._onMouseMove, false);
};

proto._onMouseOut = function (evt) {
	this.isOver = false;
	this._el.removeEventListener('mouseout', this._onMouseOut);
	this._el.removeEventListener('mousemove', this._onMouseMove);
	this._el.addEventListener('mouseover', this._onMouseOver, false);
};

proto._onMouseMove = function (evt) {
	this.x = evt.pageX;
	this.y = evt.pageY;
};

proto.enable = function () {
	this._el.addEventListener('mouseover', this._onMouseOver, false);
};

proto.disable = function () {
	this._el.removeEventListener('mouseover', this._onMouseOver);
	this._el.removeEventListener('mouseout', this._onMouseOut);
	this._el.removeEventListener('mousemove', this._onMouseMove);
};

module.exports = MouseTracker;
