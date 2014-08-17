'use strict';

module.exports = function loadPanels (url, callback) {

	var req = new XMLHttpRequest();

	req.onload = function () {

		if (req.readyState === 4) {
			if (req.status === 200) {

				var fragment = document.createDocumentFragment();
				fragment.appendChild(document.createElement('body'));
				var body = fragment.firstElementChild;
				body.innerHTML = this.responseText;

				var panels = fragment.querySelectorAll('#panels .panel');
				var nav = fragment.querySelector('#panels-nav');

				callback.call(this, {
					nav: nav,
					panels: panels
				});
			}
		}
	};

	req.open('get', url, true);
	req.send();
};
