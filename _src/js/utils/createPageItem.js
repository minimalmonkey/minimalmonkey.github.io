'use strict';

module.exports = function createPageItem (id, type) {
	var el = document.createElement(type || 'div');
	el.id = id;
	el.className = Array.prototype.slice.call(arguments).splice(2).concat(id).join(' ');
	document.getElementById('pagecontent').appendChild(el);
	return el;
};
