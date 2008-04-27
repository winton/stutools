/*
Script: Lightbox.js
	A class that lightens or darkens the entire page

License:
	MIT-style license.
*/

var Lightbox = new Class({
	initialize: function(container) {
		this.box 	= $(container);
		this.fire	= this.fire.bind(this);
		
		if (this.box)
			this.box.addEvent('click', this.fire);
		
		window.addEvent('resize', function() {
			if (this.box && this.box.visible())
				this.box.expand();
		}.bind(this));
	},
	attachDialog: function(dialog) {
		dialog.addEvent	('onShow', 	this.open.bind(this));
		dialog.addEvent	('onHide', this.close.bind(this));
	},
	detach: function() {
		delete this['$events'];
	},
	fire: function() {
		this.fireEvent('onClick');
	},
	hide: function(dialog, fx, keep_lightbox) {
		if (!keep_lightbox) {
			this.detach();
			this.box.hide();
		}
	},
	show: function(dialog) {
		this.box.expand();
		this.box.show();
	}
});

Lightbox.implement(new Events);
// onClick, onHide, onShow

Element.extend({
	expand: function() {
		this.setStyles({
			top: 		'0px',
			left: 	'0px',
			width: 	Window.getScrollWidth() + 'px',
			height: Window.getScrollHeight() + 'px'
		});
	}
});