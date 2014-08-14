'use strict';

var isMouseOut = require('../utils/isMouseOut');

function Panels (options) {

	this.el = document.getElementById(options.id);
	this.panels = document.querySelectorAll('#' + options.id + ' .panel');
	this.totalPanels = this.panels.length;
	this.currentIndex = -1;

	this.onMouseOver = this.onMouseOver.bind(this);
	this.onMouseOut = this.onMouseOut.bind(this);

	if (document.body.classList.contains('is-intro')) {
		this.onIntroEnded = this.onIntroEnded.bind(this);
		// webkitTransitionEnd otransitionend msTransitionEnd transitionend
		this.panels[this.totalPanels - 1].addEventListener('webkitTransitionEnd', this.onIntroEnded, false);
	}
	else {
		this.enable();
	}
}

var proto = Panels.prototype;

proto.addListenerToPanels = function () {
	function callback (index) {
		return function () {
			this.onPanelMouseOver(index);
		};
	}
	var len = this.totalPanels;
	while (len--) {
		this.panels[len].addEventListener('mouseover', callback(len).bind(this), false);
	}
};

proto.removeListenerFromPanels = function () {
	var len = this.totalPanels;
	while (len--) {
		//
	}
};

proto.addExpandClass = function () {
	this.panels[this.currentIndex].classList.add('is-expanded');

	if (this.currentIndex > 0) {
		this.panels[this.currentIndex - 1].classList.add('is-shrunk-left');
	}

	if (this.currentIndex < this.totalPanels - 1) {
		this.panels[this.currentIndex + 1].classList.add('is-shrunk-right');
	}
};

proto.removeExpandClass = function () {
	if (this.currentIndex > -1) {
		this.panels[this.currentIndex].classList.remove('is-expanded');

		if (this.currentIndex > 0) {
			this.panels[this.currentIndex - 1].classList.remove('is-shrunk-left');
		}

		if (this.currentIndex < this.totalPanels - 1) {
			this.panels[this.currentIndex + 1].classList.remove('is-shrunk-right');
		}
	}
};

proto.onIntroEnded = function (evt) {
	// webkitTransitionEnd otransitionend msTransitionEnd transitionend
	this.panels[this.totalPanels - 1].removeEventListener('webkitTransitionEnd', this.onIntroEnded);
	this.enable();

	var onMouseMove = function (evt) {
		document.removeEventListener('mousemove', onMouseMove);
		var index = Array.prototype.slice.call(this.panels).indexOf(evt.target);
		if (index > -1) {
			this.onMouseOver();
			this.onPanelMouseOver(index);
		}
	}.bind(this);
	document.addEventListener('mousemove', onMouseMove, false);
};

proto.onPanelMouseOver = function (index) {
	if (this.currentIndex != index) {
		this.removeExpandClass();
		this.currentIndex = index;
		this.addExpandClass();
	}
};

proto.onMouseOver = function (evt) {
	this.el.removeEventListener('mouseover', this.onMouseOver);
	this.el.addEventListener('mouseout', this.onMouseOut, false);
	this.el.classList.add('is-hovered');
};

proto.onMouseOut = function (evt) {
	if (isMouseOut(evt)) {
		this.el.removeEventListener('mouseout', this.onMouseOut);
		this.el.addEventListener('mouseover', this.onMouseOver, false);
		this.el.classList.remove('is-hovered');

		if (this.currentIndex > -1) {
			this.removeExpandClass();
			this.currentIndex = -1;
		}
	}
};

proto.enable = function () {
	if (this.el) {
		this.el.addEventListener('mouseover', this.onMouseOver, false);
		this.addListenerToPanels();
	}
};

proto.disable = function () {
	this.el.removeEventListener('mouseover', this.onMouseOver);
	this.el.removeEventListener('mouseout', this.onMouseOut);
	this.removeListenerFromPanels();
};

module.exports = Panels;
