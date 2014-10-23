'use strict';

module.exports = function removeEventListenerList (list, type, listener) {
	var i = list.length;
	while (i--) {
		list[i].removeEventListener(type, listener);
	}
};
