'use strict';

function Header () {
	this.el = document.getElementById('siteheader');
	this.pageContent = document.getElementById('pagecontent');
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
}

var proto = Header.prototype;

proto.open = function (key) {
	this.isOpen = true;
	this.el.classList.remove('is-collapsed');
	this.pageContent.classList.add('is-disabled');
	this.hideCurrent();
	this.pages[key].nav.classList.add('is-selected');
	this.pages[key].page.classList.add('is-visible');
};

proto.close = function () {
	this.isOpen = false;
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