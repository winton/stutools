var Table = Base.extend({
  // Your table DOM should look like this:
  // container
  //  .title (optional)
  //  .categories (optional)
  //  .header (optional)
  //  .content
  //    (rows)
  initialize: function(container, options) {
    this.container = container;
    this.options   = {
      map: false,
      pagination_url: false,
      row_height: 30,
      tips: false,
      
      onRowAdd:         Class.empty,
      onRowAddFinished: Class.empty,
      onRowRemove:      Class.empty,
      onRowClick:       Class.empty,
      onRowOver:        Class.empty,
      onRowOut:         Class.empty,
      onTitleClick:     Class.empty
      
    };
    this.elements  = {
      table: {
        filter:     container,
        title:      '.title',
        categories: '.categories',
        content:    '.content'
      }
    };
    
    this.parent();
    this.setOptions(options);
    
    if (this.options.tips)
      this.setOptions({
        onRowAddFinished: function() {
          var images = $ES('.tip', this.container);
          images.each(function(item, index) {
            item.setProperty('title', "::<img src='" + item.getProperty('alt') + "' />");
            item.setProperty('alt', '');
          });
          new Tips(images, {
            fixed:     false,
            showDelay: 0,
            hideDelay: 0,
            onShow: function(t) { t.fadeIn(100); },
            onHide: function(t) { if (t.fadeOut) t.fadeOut(100); }
          });
        }
      });
    
    if (this.options.map) {
      this.map = this.options.map.width ? new Gmap(this.options.map) : this.options.map;
      this.attach.delay(200, this);
    } else
      this.attach();
  },
  onCategoriesClick: function(e) {
    e.stop();
    if (e.target.tagName != 'A') return;
    var href = this.options.pagination_url + (this.options.pagination_url.indexOf('?') > -1 ? '&' : '?') + 'category=' + e.target.innerHTML;
    var old_span = $ES('span', this.el.categories[0])[0];
    var span = new Element('span');
    var a = new Element('a', { href: '#' });
    span.setHTML(e.target.innerHTML);
    a.setHTML(old_span.innerHTML);
    old_span.replaceWith(a);
    e.target.replaceWith(span);
    Global.Indicator.show();
    new Ajax(href, {
      method: 'get',
      onComplete: function(r) {
        var json = Json.evaluate(r);
        this.reloadContent(json.pages);
        Global.Indicator.hide();
      }.bind(this)
    }).request();
  },
  onTitleClick: function(e, el, els, disable_event) {
    if (e) e.stop();
    
    var shrink;
    var on  = $ES('.arrow .on',  this.el.title);
    var off = $ES('.arrow .off', this.el.title);
    
    if (!on || !off) return;
    
    // title fold
    if (this.el.title.hasClass('on')) {
      this.el.title.removeClass('on');
      off.show();
      on.hide();
      shrink = true;
    } else {
      this.el.title.addClass('on');
      on.show();
      off.hide();
      shrink = false;
    }
    
    this.el.content.getChildren().each(function(row) {
      row.show();
      $(row).getFx(300).start({ height: shrink ? 0 : this.options.row_height });
    }, this);
    
    if (!disable_event)
      this.fireEvent('onTitleClick', [ this.el.title, shrink ]);
  },
  attach: function() {
    this.loadElements('table');
    
    var fn = function(item, index) {
      var form = $ES('form', item)[0];
      this.fireEvent('onRowAdd', [ item, index, form ]);
    
      item.addEvent('click', function(e) {
        e.stop();
        if (item.getStyle('height').toInt() == 0) return;
        this.fireEvent('onRowClick', [ item, index, form ]);
      }.bindWithEvent(this));
    
      item.addEvent('mouseover', function(e) {
        if (item.getStyle('height').toInt() == 0) return;
        item.addClass('mouseover');
        this.fireEvent('onRowOver', [ item, index, form ]);
      }.bindWithEvent(this));
  
      item.addEvent('mouseout', function(e) {
        if (item.getStyle('height').toInt() == 0) return;
        item.removeClass('mouseover');
        this.fireEvent('onRowOut', [ item, index, form ]);
      }.bindWithEvent(this));
    };
    
    this.el.content.getChildren().each(fn, this);
    this.fireEvent('onRowAddFinished');
    
    this.attachPagination();
  },
  attachPagination: function() {
    $ES('.pagination a', this.container).addEvent('click', function(e) {
      e.stop();
      var slide = e.target.getParent().getChildren().filter(function(item) { return item.hasClass('current') || item == e.target; });
      this.reload(e.target.getProperty('href'), slide[0] == e.target ? 1 : -1);
    }.bindWithEvent(this));
  },
  reload: function(href, slide) {
    href  = href  || '?';
    slide = slide || 0;
    if (this.options.pagination_url)
      href = this.options.pagination_url + (this.options.pagination_url.indexOf('?') > -1 ? '&' : '?') + href.split('?')[1];
    Global.Indicator.show();
    this.el.title.removeClass('on');
    new Ajax(href, {
      method: 'get',
      onComplete: function(r) {
        var json  = Json.evaluate(r);
        slide = { 'margin-left': 600 * slide };
        this.el.content.getFx(500).start(slide).chain(function() {
          this.reloadContent(json.pages);
          Global.Indicator.hide();
        }.bind(this));
      }.bind(this)
    }).request();
  },
  reloadContent: function(content) {
    this.el.content.getChildren().each(function(item, index) {
      this.fireEvent('onRowRemove', [ item, index ]);
    }, this);
    
    var hr = $ES('.hr', this.container)[0];
    var header = $ES('.header', this.container)[0];
    var pagination = $ES('.pagination', this.container)[0];
    if (hr) hr.remove();
    if (header) header.remove();
    if (pagination) pagination.remove();
    this.el.content.remove();
    
    var div = new Element('div');
    div.setHTML(content);
    div.getChildren().each(function(item) { item.injectInside(this.container); }, this);
    this.attach();
  }
});

Table.implement(new Events);
Table.implement(new Options);