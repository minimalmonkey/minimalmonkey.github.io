'use strict';

var BaseView = require('./BaseView');

function Labs () {
	//
}

var proto = Labs.prototype = new BaseView();

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

// proto.show = function () {
// 	//
// };

module.exports = Labs;
