var Table = Base.extend({
  // Your table DOM should look like this:
  // container
  //  .title (optional)
  //  .categories (optional)
  //  .header (optional)
  //  .table
  //    (rows)
  //  .paginate (optional)
  initialize: function(container, options) {
    this.container = container;
    this.options   = { map: false, pagination_url: false };
    this.elements  = {
      table: {
        filter:     container,
        title:      '.title',
        categories: '.categories',
        table:      '.table',
        paginate:   '.paginate'
      }
    };
    
    this.parent();
    this.setOptions(options);
    
    if (this.options.map) {
      this.map = new Gmap(this.options.map);
      this.reload.delay(200, this);
    } else
      this.reload();
    
    this.attachTitle();
  },
  onCategoriesClick: function(e) {
    e.stop();
    if (e.target.tagName != 'A') return;
    var href = this.options.pagination_url + (this.options.pagination_url.indexOf('?') > -1 ? '&' : '?') + 'category=' + e.target.innerHTML;
    var old_span = $ES('span', this.el.categories[0])[0];
    var span = new Element('span');
    var a = new Element('a');
    span.setHTML(e.target.innerHTML);
    a.setHTML(old_span.innerHTML);
    a.setProperty('href', '#');
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
  reload: function() {
    this.loadElements('table');
    
    // rows mouseover
    this.el.table.getChildren().each(function(item, index) {
      this.fireEvent('onRowAdd', [ item, index, $ES('form', item)[0] ]);
      
      item.addEvent('click', function(e) {
        if (item.getStyle('height').toInt() == 0) return;
        this.fireEvent('onRowClick', [ item, index, e ]);
      }.bindWithEvent(this));
      
      item.addEvent('mouseover', function(e) {
        if (item.getStyle('height').toInt() == 0) return;
        item.addClass('mouseover');
        this.fireEvent('onRowOver', [ item, index ]);
      }.bindWithEvent(this));
    
      item.addEvent('mouseout', function(e) {
        if (item.getStyle('height').toInt() == 0) return;
        item.removeClass('mouseover');
        this.fireEvent('onRowOut', [ item, index ]);
      }.bindWithEvent(this));
    }, this);
    
    this.fireEvent('onRowAddFinished');
    
    // pagination
    this.attachPagination();
  },
  attachPagination: function() {
    content = $ES('.content', this.container)[0];
    $ES('.pagination a', this.container).addEvent('click', function(e) {
      e.stop();
      Global.Indicator.show();
      this.el.title.removeClass('on');
      var href = e.target.getProperty('href');
      if (this.options.pagination_url)
        href = this.options.pagination_url + (this.options.pagination_url.indexOf('?') > -1 ? '&' : '?') + href.split('?')[1];
      new Ajax(href, {
        method: 'get',
        onComplete: function(r) {
          var json  = Json.evaluate(r);
          var slide = e.target.getParent().getChildren().filter(function(item) { return item.hasClass('current') || item == e.target; });
          slide = { 'margin-left': 600 * (slide[0] == e.target ? 1 : -1) };
          content.getFx(500).start(slide).chain(function() {
            this.reloadContent(json.pages);
            Global.Indicator.hide();
          }.bind(this));
        }.bind(this)
      }).request();
    }.bindWithEvent(this));
  },
  attachTitle: function() {
    if (!this.el.title) return;
    this.el.title.addEvent('click', function(e) {
      e.stop();
      
      var shrink = true;
      var on  = $ES('.arrow .on', this.el.title);
      var off = $ES('.arrow .off', this.el.title);
      
      if (!on || !off) return;
      
      // title fold
      if (this.el.title.hasClass('on')) {
        this.el.title.removeClass('on');
        off.show();
        on.hide();
        shrink = false;
      } else {
        this.el.title.addClass('on');
        on.show();
        off.hide();
      }
      
      this.el.table.getChildren().each(function(row) {
        row.show();
        if (shrink && !this.offsetHeight) this.offsetHeight = row.offsetHeight;
        new Fx.Styles(row, {'duration': 300, 'wait': false}).start({
  				height: shrink ? 0 : this.offsetHeight
  			});
      });
    }.bindWithEvent(this));
  },
  reloadContent: function(content) {
    this.el.table.getChildren().each(function(item, index) {
      this.fireEvent('onRowRemove', [ item, index ]);
    }, this);
    var div = new Element('div');
    div.setHTML(content);
    this.el.table.getPrevious().remove(); // hr
    this.el.table.getPrevious().remove(); // header
    if (this.el.table.getNext())
      this.el.table.getNext().remove();   // pagination
    this.el.table.remove();
    div.getChildren().each(function(item) { item.injectInside(this.container); }, this);
    this.reload();
  }
});

Table.implement(new Events);
Table.implement(new Options);