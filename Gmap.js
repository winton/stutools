var Gmap = new Class({
	initialize: function(options) {
	  if (!Global.google_maps_loaded)
	    new Asset.javascript(Global.google_maps_js, { id: 'gmap_js' });
	  
    var timer;
    timer = (function() {
      if (Gmap.loaded) { clearTimeout(timer); Gmap.queue.each(function(item) { item(); }); }
    }).periodical(10);
	  
    $each([ 'map', 'marker' ], function(obj) {
      $each(this[obj], function(item, key) { this[obj][key] = Gmap.waitUntilLoaded(this[obj][key], this); }, this);
    }, this);
	  
	  Gmap.waitUntilLoaded(function() {
	    this.options = { id: 'map', width: 600, height: 300 };
  	  this.setOptions(options);
  	  
  	  this.container = $(this.options.id);
      this.gmap      = new GMap2(this.container, { size: new GSize(this.options.width, this.options.height) });
      this.geocoder  = new GClientGeocoder();

      this.gmap.setCenter(new GLatLng(0, 0), 4);
      this.markers = {};

      this.map.changeZoomImage();
      this.map.elasticize();
      this.map.killGoogleLogo();

      window.onunload = function() { GUnload(); };
	  }, this)();
	},
	map: {
	  changeZoomImage: function() {
  	  this.gmap.addControl(new GSmallZoomControl());
      var map_last = $('map').getLast();
      map_last.hide();

      var timer;
      timer = (function() {
        if (map_last.getFirst()) {
          $clear(timer);
          map_last.getFirst().setProperty('src', '/images/map_zoom.png');
          map_last.show();
        }
      }).periodical(100);
  	},
	  elasticize: function() {
  	  var fx = new Fx.Styles($('map'), { duration: 1500, wait: false, transition: Fx.Transitions.Elastic.easeOut });
      var og_top = this.container.getPosition().y;
      window.addEvent('scroll', function() {
        var top = window.getScrollTop();
        if (top > og_top) fx.start({ top: top - og_top + 15 });
        else fx.start({ top: 0 });
      }.bind(this));
  	},
  	killGoogleLogo: function() {
  	  var children = $('map').getChildren();
      children[1].setStyle('opacity', 0);
      children[2].setStyle('opacity', 0);
  	},
  	showAddress: function(address) {
      this.geocoder.getLatLng(address,
        function(point) {
          if (!point)
            alert(address + " not found");
          else
            this.gmap.setCenter(point, 13);
        }.bind(this));
    },
  	zoomAllMarkers: function() {
  	  var bounds = new GLatLngBounds();
  	  this.marker.each(function(marker) { bounds.extend(marker.getPoint()); }, this);

  	  var center = bounds.getCenter();
  	  this.gmap.setCenter(center);
  	  this.gmap.setZoom(this.gmap.getBoundsZoomLevel(bounds));

  	  var new_top = this.gmap.fromContainerPixelToLatLng(new GPoint(0, -25));
  	  bounds.extend(new GLatLng(new_top.lat(), center.lng()));

  	  this.gmap.setCenter(bounds.getCenter());
  	  this.gmap.setZoom(this.gmap.getBoundsZoomLevel(bounds));
  	}
	},
	marker: {
	  create: function(latlng, type, num) {
      var marker = new GMarker(latlng, {
        icon: this.marker.icon(type, num), zIndexProcess: function() { return 100 - num; }
      });

      GEvent.addListener(marker, 'mouseover', function() {
        this.marker.highlight(true, type, num);
        this.fireEvent('onMarkerOver', [marker, type, num]);
      }.bind(this));
      
      GEvent.addListener(marker, 'mouseout',  function() {
        this.marker.highlight(false, type, num);
        this.fireEvent('onMarkerOut', [marker, type, num]);
      }.bind(this));
        
      this.markers[type] = this.markers[type] || {};
      if (this.markers[type][num]) this.marker.remove(type, num);
      this.markers[type][num] = marker;
      this.gmap.addOverlay(marker);
      
      return marker;
    },
    remove: function(type, num) {
      this.gmap.removeOverlay(this.markers[type][num]);
    },
    remove_all: function() {
      this.marker.each(function(marker, type, num) { this.marker.remove(type, num); }, this);
    },
    highlight: function(on, type, num) {
      this.markers[type][num].setImage(this.marker.imageUrl(type, num, on));
    },
    imageUrl: function(type, num, highlight) {
      return '/images/markers/' + type + '/' + (highlight ? 'highlights/' : '') + (num+1) + '.png';
    },
    icon: function(type, num) {
      var icon = new GIcon();
      icon.image  = this.marker.imageUrl(type, num);
      icon.shadow = '/images/markers/shadow.png';
      icon.shadowSize = new GSize(45, 34);
      icon.iconSize   = new GSize(27, 34);
  		icon.iconAnchor = new GPoint(5, 33);
  		return icon;
    },
  	each: function(fn, bind) {
  	  if (!this.markers) return;
  	  $each(this.markers, function(value, key) {
        $each(value, function(v, k) { fn.bind(bind)(this.markers[key][k], key, k); }, this);
      }, this);
  	}
	}
});

Gmap.implement(new Events);
Gmap.implement(new Options);

Gmap.queue = [];
Gmap.googleMapsLoaded = function() { Gmap.loaded = true; };
Gmap.waitUntilLoaded  = function(fn, bind) {
  return function() {
    bind = bind || this;
    var args = $A(arguments);
    if (Gmap.loaded) return fn.pass(args, bind)();
    else Gmap.queue.push(fn.pass(args, bind));
    return false;
  };
};