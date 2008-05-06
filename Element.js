/*
Script: Element.js
	Contains Element prototypes.

License:
	MIT-style license.
*/

/*
Structure: Element
	Extensions to the native Element object.
*/

Element.extend({
	
	/*
	Property: childOf
		Traverses the DOM to find an ID or class name.
	
	Arguments:
		id - The ID (default) or class name.
		isClass - (optional) Search by class name if true.
	*/
	
	childOf: function(options) {
		var element = this;
		do {
			if (options.className && $(element).hasClass(options.className)) return element;
			if (options.id && element.id == options.id) return element;
			if (options.tag && element.tagName == options.tag.toUpperCase()) return element;
		} while ((element.tagName != 'HTML') && (element = $(element.parentNode)));
		return false;
	},
	
	/*
	Property: hide
		Sets display:none.
	*/
	
	hide: function() {
		this.setStyle('display', 'none');
		return this;
	},
	
	/*
	Property: idWithoutPrefix
		Cuts a prefix off the front of an ID (like "record_21") and returns it.
	
	Arguments:
		prefix - the word before the number
	*/
	
	idWithoutPrefix: function(prefix) {
		return this.id.substring((prefix + '_').length);
	},
	
	/*
	Property: fadeIn
		Fades in an element.
	
	Arguments:
		duration - Fade duration in miliseconds.
		onComplete - The function to call when the fade finishes.
		bind - Bind onComplete to this object.
	*/
	
	fadeIn: function(duration, onComplete, bind) {
		this.getFx(duration ? duration : 200, onComplete, bind).set({ opacity:0 });
		this.show();
		this.fx.start({ opacity:1 });
	},
	
	/*
	Property: fadeOut
		Fades out an element.
	
	Arguments:
		duration - Fade duration in miliseconds.
		onComplete - The function to call when the fade finishes.
		bind - Bind onComplete to this object.
	*/
	
	fadeOut: function(duration, onComplete, bind) {
	  this.getFx(duration ? duration : 200, onComplete, bind).start({ opacity:0 });
	},
	
	/*
	Property: focusFirst
		Focus or select the first input of a form.
	
	Arguments:
		select - (optional) Select the first element instead of focusing.
	*/
	
	focusFirst: function(select) {
		var found = false;
		$ES('input, textarea', this).each(function(el) {
			if ((el.tagName == 'TEXTAREA' || el.type == 'text') && el.visible() && !found) {
			  el.focus();
				if (select) el.select();
				found = true;
			}
		});
	},
	
	/*
	Property: getFx
		Creates this.fx, a new Fx.Styles object, if it does not exist.
	*/
	
	getFx: function(duration, onComplete, bind, options) {
	  options = options || {};
	  if (duration) options.duration = duration;
		if (!this.fx) this.fx = new Fx.Styles(this);
		this.fx.setOptions($extend({ wait:false, duration:200 }, options));
		this.fx.$events = this.fx.$events || {};
    this.fx.$events.onComplete = onComplete ? [ onComplete.bind(bind) ] : [];
    return this.fx;
	},
	
	/*
	Property: parentIdByClass
		Traverses the DOM to find an element ID (without prefix) with a certain class name.
	
	Arguments:
		class_name - The class name to traverse for. See <Element.childOf>.
		prefix - The ID prefix. See <Element.idWithoutPrefix>.
	*/
	
	parentIdByClass: function(class_name, prefix) {
		var el = this.childOf(class_name, true);
	 	return (prefix) ? el.idWithoutPrefix('course') : el.id;
	},
	
	/*
	Property: render
		Uses Trimpath to render a template.
	
	Arguments:
		data - (Object) Template variables.
		return_html - Return a string instead of an Element.
	*/
	
	render: function(data, return_html) {
		var html = TrimPath.processDOMTemplate(this.id, $merge({}, data));
		if (!return_html) {
		  var el = new Element('div');
		  el.setHTML(html);
		  html = el.getFirst();
		}
		return html;
	},
	
	/*
	Property: selectFirst
		Select the first element of a form.
	*/
	
	selectFirst: function() {
		this.focusFirst(true);
	},
	
	/*
	Property: selectValue
		Many ways to select an option in a select box.
	
	Arguments:
		value - Option innerHTML to select.
		defaultSelected - Set defaultSelected for found value.
		searchByValue - Search by option value instead of innerHTML.
	*/
	
	selectValue: function(value, defaultSelected, searchByValue) {
		var found = false;
		$A(this.options).each(function(option, index) {
			if ((searchByValue && option.value == value) || (!searchByValue && option.innerHTML == value)) {
				found = true;
				if (defaultSelected) {
					option.defaultSelected = true;
					this.selectedIndex = index;
				} else
					this.selectedIndex = index;
			} else if (defaultSelected)
				option.defaultSelected = false;
		}, this);
		return found;
	},
	
	/*
	Property: show
		Set display to nothing.
	*/
	
	show: function() {
		this.setStyle('display', '');
	},
	
	/*
	Property: toObject
		Turns a form into an object.
	*/
	
	toObject: function(){
		var obj = {};
		$$(this.getElementsByTagName('input'), this.getElementsByTagName('select'), this.getElementsByTagName('textarea')).each(function(el){
			var name = $(el).name;
			var value = el.getValue();
			if (!el.disabled && $chk(value)){
				var qs = function(val){
					obj[name] = val;
				};
				if ($type(value) == 'array') value.each(qs);
				else qs(value);
			}
		});
		return obj;
	},
	
	/*
	Property: visible
		Returns visibility as boolean.
	*/
	
	visible: function() {
		return (this.style.display != 'none');
	}
});