'use strict';

module.exports = function setColor (element, color) {
	if (element.dataset.color) {
		element.classList.remove('color-' + element.dataset.color);
	}
	if (color) {
		element.dataset.color = color;
		element.classList.add('color-' + color);
	}
};
