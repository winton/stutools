/*
Script: Indicator.js
	A class to easily hide and show a mouse indicator

License:
	MIT-style license.
*/

var Indicator = new Class({
	initialize: function(image) {
		this.container = new Element('div');
		this.container.setHTML('<img src="' + image + '" />');
		this.container.setStyles({ position: 'absolute', opacity: 0, 'z-index': 5000 });
		this.container.injectInside(document.body);
		
		$(document.body).addEvent('mousemove', function(e) {
			this.container.setStyles({
				top: 	e.page.y + 5 + 'px',
				left: e.page.x + 5 + 'px'
			});
		}.bindWithEvent(this));
	},
	show: function() { this.container.fadeIn(500); },
	hide: function() { this.container.fadeOut(500); }
});