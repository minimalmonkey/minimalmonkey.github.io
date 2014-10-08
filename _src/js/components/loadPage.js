'use strict';

module.exports = function loadPage (url, callback) {

	var selectors = Array.prototype.slice.call(arguments).splice(2);
	var req = new XMLHttpRequest();

	req.onload = function () {

		if (req.readyState === 4) {
			if (req.status === 200) {

				var fragment = document.createDocumentFragment();
				fragment.appendChild(document.createElement('body'));
				var body = fragment.querySelector('body');
				body.innerHTML = this.responseText;

				var elements = [];
				var i = selectors.length;

				while (i--) {
					elements[i] = fragment.querySelectorAll(selectors[i]);
				}

				// callback.apply(this, elements.length ? [url].concat(elements) : [url, this.responseText]);
				// temp - simulate slow / random load time
				setTimeout(function () {
					callback.apply(this, elements.length ? [url].concat(elements) : [url, this.responseText]);
				}.bind(this), 2000 + (Math.random() * 500));
			}
		}
	};

	req.open('get', url, true);
	req.send();
};
