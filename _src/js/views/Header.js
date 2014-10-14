'use strict';

var transitionEndEvent = require('../utils/transitionEndEvent')();

var BaseView = require('./BaseView');

function Header () {
	this.el = document.getElementById('siteheader');
	this.pageContent = document.getElementById('pagecontent');
	this.closeButton = document.getElementById('siteheader-close');

	this.closeURL = '/';
	this.pages = {};
	var pages = document.querySelectorAll('.siteheader-page');
	var url;
	var i = pages.length;
	while (i--) {
		url = pages[i].id.split('-')[0];
		this.pages['/' + url + '/'] = {
			nav: document.querySelector('.sitenav a[href*="' + url + '"]'),
			page: pages[i]
		};
	}

	this.listenToTransitionEnd(this.el, this.onIntroComplete.bind(this));
}

var proto = Header.prototype = new BaseView();

proto.open = function (key, lastURL) {
	this.el.classList.remove('is-collapsed');
	this.pageContent.classList.add('is-disabled');
	this.hideCurrent();
	this.pages[key].nav.classList.add('is-selected');
	this.pages[key].page.classList.add('is-visible');

	if (lastURL) {
		this.closeURL = lastURL;
		this.closeButton.href = lastURL;
	}
};

proto.close = function () {
	this.el.classList.add('is-collapsed');
	this.pageContent.classList.remove('is-disabled');
	this.hideCurrent();
};

proto.hideCurrent = function () {
	var currentNav = document.querySelector('.sitenavlink.is-selected');
	if (currentNav) {
		currentNav.classList.remove('is-selected');
	}

	var currentPage = document.querySelector('.siteheader-page.is-visible');
	if (currentPage) {
		currentPage.classList.remove('is-visible');
	}
};

proto.getPageLinks = function () {
	var links = document.querySelectorAll('.sitenavlink[data-router]');
	var pathnames = [];
	var i = links.length;
	while (i--) {
		pathnames[i] = links[i].pathname;
	}
	return pathnames;
};

module.exports = Header;
