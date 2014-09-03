'use strict';

module.exports = function createPageItem (id) {
	var el = document.createElement('div');
	el.id = id;
	el.classList.add(id, 'pagecontent-item', 'is-hidden');
	document.getElementById('pagecontent').appendChild(el);
	return el;
};
