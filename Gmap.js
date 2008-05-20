var Gmap = new Class({
	initialize: function(options) {
	  this.options = { id: 'map', width: 600, height: 300 };
	  this.setOptions(options);
	  
	  $each(this.create, function(item, key) { this.create[key] = this.create[key].bind(this); }, this);
	  $each(this.remove, function(item, key) { this.remove[key] = this.remove[key].bind(this); }, this);
	  
	  this.container = $(this.options.id);
    this.map       = new GMap2(this.container, { size: new GSize(this.options.width, this.options.height) });
    this.geocoder  = new GClientGeocoder();
    
    this.map.setCenter(new GLatLng(0, 0), 4);
    this.markers = {};
    
    this.changeZoomImage();
    this.elasticizeMap();
    this.killGoogleLogo();
    
    document.body.onunload = GUnload;
	},
	create: {
    imageUrl: function(type, num, highlight) {
      return '/images/markers/' + type + '/' + (highlight ? 'highlights/' : '') + (num+1) + '.png';
    },
    icon: function(type, num) {
      var icon = new GIcon();
      icon.image  = this.create.imageUrl(type, num);
      icon.shadow = '/images/markers/shadow.png';
      icon.shadowSize = new GSize(45, 34);
      icon.iconSize   = new GSize(27, 34);
  		icon.iconAnchor = new GPoint(5, 33);
  		return icon;
    },
    marker: function(latlng, type, num) {
      var marker = new GMarker(latlng, { icon: this.create.icon(type, num), zIndexProcess: function() { return 100 - num; } });

      GEvent.addListener(marker, 'mouseover', function() {
        this.highlight(true, type, num);
        this.fireEvent('onMarkerOver', [marker, type, num]);
      }.bind(this));
      
      GEvent.addListener(marker, 'mouseout',  function() {
        this.highlight(false, type, num);
        this.fireEvent('onMarkerOut', [marker, type, num]);
      }.bind(this));
        
      this.markers[type] = this.markers[type] || {};
      if (this.markers[type][num]) this.remove.marker(type, num);
      this.markers[type][num] = marker;
      this.map.addOverlay(marker);
      
      return marker;
    }
  },
  remove: {
    marker: function(type, num) {
      this.map.removeOverlay(this.markers[type][num]);
    },
    markers: function() {
      this.eachMarker(function(marker, type, num) { this.remove.marker(type, num); }, this);
    }
  },
  highlight: function(on, type, num) {
    this.markers[type][num].setImage(this.create.imageUrl(type, num, on));
  },
	changeZoomImage: function() {
	  this.map.addControl(new GSmallZoomControl());
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
	eachMarker: function(fn, bind) {
	  if (!this.markers) return;
	  $each(this.markers, function(value, key) {
      $each(value, function(v, k) { fn.bind(bind)(this.markers[key][k], key, k); }, this);
    }, this);
	},
	elasticizeMap: function() {
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
          this.map.setCenter(point, 13);
      }.bind(this));
  },
	zoomAllMarkers: function() {
	  var bounds = new GLatLngBounds();
	  this.eachMarker(function(marker) { bounds.extend(marker.getPoint()); }, this);
	  
	  var center = bounds.getCenter();
	  this.map.setCenter(center);
	  this.map.setZoom(this.map.getBoundsZoomLevel(bounds));
	  
	  var new_top = this.map.fromContainerPixelToLatLng(new GPoint(0, -25));
	  bounds.extend(new GLatLng(new_top.lat(), center.lng()));
	  
	  this.map.setCenter(bounds.getCenter());
	  this.map.setZoom(this.map.getBoundsZoomLevel(bounds));
	}
});

Gmap.implement(new Events);
Gmap.implement(new Options);