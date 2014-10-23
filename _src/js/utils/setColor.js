'use strict';

module.exports = function setColor (element, color) {
	var current = element.dataset.color;
	if (current) {
		if (current === color) {
			return;
		}
		element.classList.remove('color-' + current);
	}
	if (color) {
		element.dataset.color = color;
		element.classList.add('color-' + color);
	}
	else {
		element.dataset.color = null;
	}
};
