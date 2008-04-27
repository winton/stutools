/*
Script: Dialog.js
	Contains the <Dialog>, <Dialog.Input>, and <Dialog.Simple> classes, and an Element prototype.

License:
	MIT-style license.
*/

/*
Class: Dialog
	The Dialog class generates Lightbox dependent dialogs (or, centered floating windows). A dialog is rendered using a minimum of two templates.
	
	- (a) the dialog template, which is used every time you render the dialog
	- (b) content template(s)
	
	The dialog template must have ${content} where you wish the content to be.
	Any options you pass to the Dialog constructor or <Dialog.render> can be used by the dialog template.
	
	More about templates: http://trimpath.com/project/wiki/JavaScriptTemplateSyntax

Arguments:
	template - The ID of the dialog template.
	options - See *options* and *events*.
	
Options:
	id - Content template will be discovered at "template_dialog_" + id. Holds precedence over title.
	show_delete - Show :class => 'delete' and associate onRemove to its click event.
	title - Content template will be discovered at "template_dialog_" + title.gsub(' ', '_').toLowerCase()

Events:
	onClose - Fires when :class => 'close' is clicked or <Dialog.hide> is called.
	onOpen - Fires when <Dialog.show> is called.
	onReady - Fires after dialog has completely faded in.
	onRemove - Fires when :class => 'delete' is clicked.
	onSubmit - Fires when :class => 'submit' is clicked.

Example:
	*HTML*
	
	(a) Dialog template
	><textarea id="template_dialog">
	>	<div id="${id}">
	>		<b>${title}</b>
	>		<br/>
	>		${content}
	>	</div>
	></textarea>
	
	(b) Content template
	><textarea id="template_dialog_content">
	>	<form action="/action">
	>		Name: <%= text_field_tag "name" %>
	>		<%= submit_tag 'Login', :class => 'submit' %>
	>		<%= image_tag 'indicator.gif', :class => 'indicator', :style => 'display:none' %>
	>		<%= link_to 'Close Me', '#', :class => 'close' %>
	>	</form>
	></textarea>
 	
	*Javascript*
	
	>var dialog = new Dialog('template_dialog', {
	>	id: 		'content',
	>	title: 		'Edit Record'
	>
	>	onClose: 	Dialog.Events.close.remove,
	>	onOpen: 	Dialog.Events.open.reset,
	>	onReady: 	Dialog.Events.ready.focus,
	>	onSubmit: 	Dialog.Events.submit.send
	>}).render().show();
*/

var Dialog = Base.extend({
  elements: {
    load: {}, container: {}, dialog: { close: '.close', form: 'form', submit: '.submit' }
	},
  options: {
		elements: {}, events: {},
		
	  onShow: 	  Class.empty,  // must call dialog.show(), this.ready()
		onHide:     Class.empty,
		onSubmit:   Class.empty,
		onResponse: Class.empty,
		
		centered: false, lightbox: false,
		injectInside: null, template_dialog: '#template_dialog', trigger: null
	},
	initialize: function(template, options) {
	  this.options.template = this.options.trigger = '#' + template;
	  
	  this.elements.load.template = '#template_' + template;
	  this.elements.load.template_dialog = this.options.template_dialog;
	  this.elements.dialog.filter = this.elements.container.dialog = '#dialog_' + template;
	  
	  this.setOptions(options);
	  this.options.trigger = $$(this.options.trigger);
	  $extend(this.elements.dialog, this.options.elements);
		$extend(this,	this.options.events);
	  
	  this.parent();
	  
	  if (this.options.centered)
	    window.addEvent('resize', this.resize.bind(this));
	  if (this.options.lightbox)
	    Global.Lightbox.attachDialog(this);
	  if (this.options.trigger)
	    this.options.trigger.addEvent('click', function(e) { this.show(); }.bindWithEvent(this));
	  
	  console.log()
  },
  
  // Events
  
  onCloseClick: function(e) {
		this.hide();
		e.stop();
	},
	onFormKeyDown: function(e) {
		if (e.key == 'esc')		this.hide();
		if (e.key == 'enter' && e.target.tagName != 'TEXTAREA')	this.submit(e);
	},
	onFormSubmit: function(e) {
		e.stop();
	},
	onSubmitClick: function(e) {
		this.submit(e);
	},

	/*
	Property: hide
		Hides the dialog and its associated Lightbox.

	Arguments:
		keep_lightbox - (optional) Hide the dialog but not Lightbox if true.
	*/

	hide: function(keep_lightbox) {
		if (this.el.dialog) this.fireEvent.pass([ 'onHide', [ this.el.dialog, keep_lightbox] ], this);
	},
	
	/*
	Property: ready
		Focuses the form.
	*/
	
	ready: function() {
	  this.el.dialog.focusFirst();
	},
	
	/*
	Property: render
		Renders the content template into the dialog template and inserts resulting HTML into the DOM.

	Arguments:
		data - (optional) { name: value } Template variables used to render content, if content option not present.
	*/
	
	render: function(data) {
	  data.content = data.content || this.el.template.render(data);
	  var dialog = this.el.dialog_template.render(data);
	  dialog.id = this.options.template;
	  
	  if (this.el.dialog) {
	    this.el.dialog.replaceWith(dialog);
	    if (this.options.centered) this.el.dialog.center();
	  } else
	    dialog.injectInside(this.options.injectInside || document.body);
		
		this.loadElements('container');
		this.loadElements('dialog');
		return this;
	},
	
	/*
	Property: render_remote
		Renders content from a remote source.

	Arguments:
		options - See <Dialog.render>. Additional options below.
		
	Options:
		url - The URL for the remote request.
	*/
	
	render_remote: function(options) {
		Global.Indicator.show();
		
		var url = options.url;
		delete options.url;
		
		new Ajax(url, {
			onComplete: function(response) {
				response = Json.evaluate(response).content;
				
				this.render(Object.extend(options, { content: response }));
				this.show();
				
				Global.Indicator.hide();
			}.bind(this),
			method: 'get'
		}).request();
		
		return this;
	},
	
	resize: function() {
		if (!this.el.dialog) return false;
		if (this.el.dialog && this.el.dialog.visible())
			this.el.dialog.center();
		return true;
	},
	
	/*
	Property: show
		Shows the dialog and its associated Lightbox.
	*/
	
	show: function(data) {
	  if (!this.el.dialog) this.render(data);
	  if (this.options.centered) {
	    this.el.dialog.setStyles({
	      display:  '',
  			opacity: 	0,
  			position: 'absolute'
  		});
  		this.el.dialog.center();
	  }
	  if (this.options.lightbox) {
	    Global.Lightbox.detach();
  		Global.Lightbox.addEvent('onClick', this.hide.bind(this));
  	}
		this.fireEvent('onShow', this.el.dialog);
		return this;
	},
	
	/*
	Property: submit
		Submits the dialog form.
	*/
	
	submit: function(e) {
	  e.stop();
		if (this.el.form.hasClass('no_ajax'))
			this.el.form.submit();
		else {
		  this.fireEvent('onSubmit', this.el.dialog);
		  this.el.form.send({
				onComplete: function(r) {
				  this.fireEvent('onResponse', [ this.el.dialog, Json.evaluate(r) ]);
				}.bind(this)
			});
		}
	}
});

Dialog.implement(new Events);
Dialog.implement(new Options);

/*
Class: Dialog.Input
	Returns a generic form handling <Dialog> instance.

Arguments:
	template - The ID of the dialog template.
	options - See <Dialog> options.

Example:
	> var dialog_input = Dialog.Input('template_dialog', { title: 'Log In' });
*/

Dialog.Input = function(template, options) {
	options = (options) ? options : {};
	
	var submit = options.onSubmit;
	delete options.onSubmit;
	
	$extend(options, {
		onClose: 	Dialog.Events.onClose.remove,
		onOpen: 	Dialog.Events.onOpen.reset,
		onReady: 	Dialog.Events.onReady.focus
	});
	
	var dialog = new Dialog(template, options);
	
	dialog.setOptions({
		onSubmit: (submit) ?
			Dialog.Events.onSubmit.send.pass(submit.bind(dialog), dialog) :
			Dialog.Events.onSubmit.send
	});
	
	return dialog;
};

/*
Class: Dialog.Simple
	Returns a very generic (content only) <Dialog> instance.

Arguments:
	template - The ID of the dialog template.
	options - See <Dialog> options.

Example:
	> var dialog = Dialog.Simple('template_dialog', { title: 'My Content' });
*/

Dialog.Simple = function(template, options) {
	options = options ? options : {};
	
	$extend(options, {
		onClose: 	Dialog.Events.onClose.remove
	});
	
	return new Dialog(template, options);
};

Element.extend({
	center: function() {
		var width 	= this.getSize().size.x;
		var height 	= this.getSize().size.y;

		this.setStyles({
			position: 'absolute',
			left: (Window.getWidth() / 2 - width / 2) + Window.getScrollLeft() + 'px',
			top:  (Window.getHeight() / 2 - height / 2) + Window.getScrollTop() + 'px'
		});
	}
});