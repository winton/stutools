var Table = Base.extend({
  // Your table DOM should look like this:
  // container
  //  .title (optional)
  //  .categories (optional)
  //  .table
  //    (rows)
  //  .paginate (optional)
  initialize: function(container, options) {
    this.container = container;
    this.options   = { map: false };
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
  },
  reload: function() {
    this.loadElements('table');
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
      } else {
        this.el.title.addClass('on');
        on.show();
        off.hide();
        shrink = false;
      }
      
      this.el.table.getChildren().each(function(row) {
        row.show();
        new Fx.Styles(row, {'duration': 300, 'wait': false}).start({
					height: shrink ? 0 : row.getHeight()
				});
      });
    }.bindWithEvent(this));
    
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
      new Ajax(e.target.getProperty('href'), {
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
  reloadContent: function(content) {
    this.el.table.getChildren().each(function(item, index) {
      this.fireEvent('onRowRemove', [ item, index ]);
    }, this);
    this.container.setHTML(content);
    this.reload();
  }
});

Table.implement(new Events);
Table.implement(new Options);