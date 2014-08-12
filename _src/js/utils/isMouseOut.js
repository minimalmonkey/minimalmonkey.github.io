'use strict';

/**
 * @name isMouseOut
 * Loops through event target parent elements to see if mouse
 * has left or just event bubbling from child element.
 *
 * @kind function
 *
 * @param {MouseEvent} evt
 *        The DOM MouseEvent trigged by `mouseout`.
 *
 * @returns {Boolean} Returns true if mouse has left parent.
 */
module.exports = function isMouseOut (evt) {

	var target = evt.currentTarget ? evt.currentTarget: evt.srcElement;
	var child = evt.relatedTarget ? evt.relatedTarget : evt.toElement;

	if (child) {
		while (child.parentElement) {
			if (target === child) {
				return false;
			}
			child = child.parentElement;
		}
	}

	return true;
};
