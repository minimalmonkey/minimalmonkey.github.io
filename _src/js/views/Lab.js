'use strict';

var BaseView = require('./BaseView');

function Labs () {
	//
}

var proto = Labs.prototype = new BaseView();

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
	document.body.classList.add('is-darktheme');
};

module.exports = Labs;
