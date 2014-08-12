'use strict';

var isMouseOut = require('../utils/isMouseOut');

function Panels (options) {

	this.el = document.getElementById(options.id);
	this.panels = document.querySelectorAll('#' + options.id + ' .panel');

	this.onMouseOver = this.onMouseOver.bind(this);
	this.onMouseOut = this.onMouseOut.bind(this);

	this.enable();
}

var proto = Panels.prototype;

proto.onMouseOver = function (evt) {
	console.log('onMouseOver');
	this.el.removeEventListener('mouseover', this.onMouseOver);
	this.el.addEventListener('mouseout', this.onMouseOut, false);
	this.el.classList.add('is-hovered');
};

proto.onMouseOut = function (evt) {
	if (isMouseOut(evt)) {
		console.log('onMouseOut');
		this.el.removeEventListener('mouseout', this.onMouseOut);
		this.el.addEventListener('mouseover', this.onMouseOver, false);
		this.el.classList.remove('is-hovered');
	}
};

proto.enable = function () {
	this.el.addEventListener('mouseover', this.onMouseOver, false);
};

proto.disable = function () {
	this.el.removeEventListener('mouseover', this.onMouseOver);
	this.el.removeEventListener('mouseout', this.onMouseOut);
};

module.exports = Panels;
