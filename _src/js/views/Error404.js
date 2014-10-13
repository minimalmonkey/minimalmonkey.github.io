'use strict';

var BaseView = require('./BaseView');

function Error404 () {
	if (document.body.classList.contains('is-404', 'is-intro')) {
		// doesn't have an intro at the moment so listen to siteheader instead
		this.listenToTransitionEnd(document.getElementById('siteheader'), this.onIntroComplete.bind(this));
	}
}

var proto = Error404.prototype = new BaseView();

proto.hasPage = function (url) {
	// override and always return true until real labs page exists
	return true;
};

proto.hide = function (nextState) {
	switch (nextState) {
		case 'panels' :
			// TODO: add delay then remove whatever view we have here
			document.body.classList.add('is-transition-panelsbelow');
			window.requestAnimationFrame(this.onHidden.bind(this));
			break;

		default :
			// TODO: add default
	}
};

proto.show = function (fromState, lastUrl) {
	//
};

module.exports = Error404;
