'use strict';

function PanelsNav (options) {

	this.el = document.getElementById(options.id);
	this.hide();
}

var proto = PanelsNav.prototype;

proto.isLoading = function (loading) {
	if (loading) {
		this.el.classList.add('is-loading');
		this.show();
	}
	else {
		this.el.classList.remove('is-loading');
	}
};

proto.show = function () {
	this.el.classList.remove('is-hidden');
};

proto.hide = function () {
	this.el.classList.add('is-hidden');
};

proto.getPath = function () {
	return this.el.href;
};

module.exports = PanelsNav;
