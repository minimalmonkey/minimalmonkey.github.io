'use strict';

var createPageItem = require('../utils/createPageItem');
var waitAnimationFrames = require('../utils/waitAnimationFrames');

var BaseView = require('./BaseView');
var Greyscale = require('../lab/Greyscale');

function Labs () {
	this.el = document.getElementById('lab') || createPageItem('lab', 'div', 'pagecontent-item', 'is-hidden');
	this.canvas = document.createElement('canvas');
	this.el.appendChild(this.canvas);
	this.greyscale = new Greyscale(this.canvas);

	if (document.body.classList.contains('is-lab')) {
		// doesn't have an intro at the moment so listen to sitenav instead
		this.listenToTransitionEnd(document.getElementById('sitenav'), this.onIntroComplete.bind(this));
		this.greyscale.enable();
	}
}

var proto = Labs.prototype = new BaseView();

proto.prepare = function () {
	document.body.classList.add('is-darktheme');
	this.el.classList.remove('is-hidden');
	this.greyscale.enable();
};

proto.hasPage = function (url) {
	// override and always return true until real labs page exists
	return true;
};

proto.hide = function (nextState) {
	switch (nextState) {
		case 'panels' :
			// TODO: add delay then remove whatever view we have here
			document.body.classList.add('is-transition-panelsbelow');
			document.body.classList.remove('is-darktheme');
			window.requestAnimationFrame(this.onHidden.bind(this));
			break;

		default :
			// TODO: add default
	}
};

proto.show = function (fromState, lastUrl) {
	window.requestAnimationFrame(this.onShowed.bind(this));
};

proto.enable = function () {
	//
};

proto.disable = function () {
	this.el.classList.add('is-hidden');
	this.greyscale.disable();
};

module.exports = Labs;
