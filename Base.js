/*
Script: Base.js
	Contains the <Base> class.

License:
	MIT-style license.
*/

/*
Class: Base
	Extend this class to add DOM load groups (by selector) and automatic event attachment.

Example:
	>var Test = Base.extend({
	>
	>	initialize: function() {
	>		this.parent();				// call Base constructor
	>	},
	>
	>	elements: {
	>		load: {						// elements in 'load' are loaded on instanciation
	>			rows: '.row'
	>		},
	>		links: {
	>			my_link: 'a.my_link'
	>		}
	>	},
	>
	>	onMyLinkClick: function(e, el) {
	>		console.log('my link clicked!');
	>	}
	>});
	>
	>console.log(Test.elements.rows);		// [ element, element ]
	>console.log(Test.elements.my_link);	// null
	>
	>Test.loadElements('links');
	>console.log(Test.elements.my_link);	// element
*/

var Base = new Class({
	
	initialize: function() {
		if (this.elements.load)
			this.loadElements('load');
	},
	
	loadElement: function(name, group) {
		if (name == 'filter') return false;
		
		var filter		= this.elements[group].filter;
		var selector 	= this.elements[group][name];
		
		var elements	= $ES(selector, (filter) ? $$(filter)[0] : null);
		
		var eventName	= 'on' + name.split('_').map(function(item) { return item.capitalize(); }).join('');
		var regex		= new RegExp(eventName + '[a-zA-Z]+');
		
		// addEvent for fn matches
		for (fn in this) {
			if ($type(this[fn]) != 'function') continue;
			if (regex.test(fn)) {
				var event 	= fn.substring(eventName.length).toLowerCase();
								
				elements.each(function(item) {
					item.removeEvents(event);
					item.addEvent(event, this[fn].bindWithEvent(this, [ item, this.el ]));
				}, this);
			}
		}
			
		this.el[name] = elements;
		
		// force array
		if (!this.elements.force_array.contains(name) && this.el[name].length == 1)
			this.el[name] = this.el[name][0];
		
		return this.el[name];
	},
	
	loadElements: function(group) {
		for (name in this.elements[group])
			this.loadElement(name, group);
	},
	
	unloadElement: function(name, group, type) {
		if (this.el[name]) {
			this.el[name].removeEvents(type);
			delete this.el[name];
		}
	},
	
	unloadElements: function(group) {
		for (name in this.elements[group])
			this.unloadElement(name, group);
	}
});