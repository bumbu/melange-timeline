!function ($) {

  "use strict"; // jshint ;_;


 /* Timeline CLASS DEFINITION
  * ==================== */

  var Timeline = function (element, options) {
    this.init(element, options)
  };

  Timeline.prototype = {

    constructor: Timeline,

    init: function (element, options) {
      this.R = Raphael(element);
      this.options = $.extend({}, $.fn.timeline.defaults, options);

      // Definde R custom attributes
      this.R.customAttributes.segment = function (x, y, r, a1, a2) {
        var flag = (a2 - a1) > 180,
          clr = (a2 - a1) / 360;

        a1 = (a1 % 360) * Math.PI / 180;
        a2 = (a2 % 360) * Math.PI / 180;

        return {
          path: [["M", x, y], ["l", r * Math.cos(a1), r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)], ["z"]]
        };
      };

      this.R.customAttributes.arc = function (x, y, r, a1, a2) {
        var flag = (a2 - a1) > 180,
          clr = (a2 - a1) / 360;

        a1 = (a1 % 360) * Math.PI / 180;
        a2 = (a2 % 360) * Math.PI / 180;

        return {
          path: [["M", x + r * Math.cos(a1), y + r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)]]
        };
      };

      // Default active slice
      this.slice_active = null;

      // Default titles
      this.options.timeline_title_default = this.options.title_element !== null && this.options.title_element.innerHTML
      this.options.timeline_timerange_default = this.options.timerange_element !== null && this.options.timerange_element.innerHTML
    },

    draw: function (slices) {
      var options = this.options,
        that = this,
        i;

      // Add top lines
      this.R.path('M0 0.5L187 0.5').attr({stroke: options.color_blue});
      this.R.path('M0 1.5L187 1.5').attr({stroke: options.color_blue_light});

      // Draw slices
      for (i in slices) {
        this.draw_slice(slices[i]);
      }

      // Draw inner circle
      this.inner = {
        circle: that.R.circle(94, 78, 33).attr({fill: "#ffffff", "stroke-width": 0}),
        text: that.R.text(94, 78, "2013").attr({font: '700 18px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif', fill: options.color_blue}),
        line: that.R.path('M94 91L94 111').attr({stroke: options.color_gray})
      };
    },

    draw_wires: function (x, y, r, a1, a2, color_w1, color_w2) {
      var wires = this.R.set(),
        a_middle = (((a1 + a2) / 2) + (a2 < a1 ? 180 : 0)) % 360,
        a_middle_rad = (a_middle % 360) * Math.PI / 180,
        is_bottom = a_middle <= 180,
        is_left = a_middle > 90 && a_middle < 270,
        color_w1 = color_w1 || this.options.color_blue
        color_w2 = color_w2 || this.options.color_blue_light;

      if (is_bottom) {
        // First line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~((is_left ? 6 : -6) + x + r * Math.cos(a_middle_rad)), ~~(y + 2 + r * Math.sin(a_middle_rad)) + 0.5]
          , ["l", ~~(is_left ? (-r - 10 - r * Math.cos(a_middle_rad)) : (r + 10 - r * Math.cos(a_middle_rad))) + 0.5, 0]
          , ["l", 0, -~~(y + 2 + r * Math.sin(a_middle_rad)) - 0.5]
          ]
        , stroke: color_w1
        }))

        // Second line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~((is_left ? 6 : -6) + x + r * Math.cos(a_middle_rad)), ~~(y + 2 + r * Math.sin(a_middle_rad)) + 1.5]
          , ["l", ~~(is_left ? (-r - 11 - r * Math.cos(a_middle_rad)) : (r + 11 - r * Math.cos(a_middle_rad))) + 0.5, 0]
          , ["l", 0, -~~(y + 2 + r * Math.sin(a_middle_rad)) - 0.5]
          ]
        , stroke: color_w2
        }))
      } else {
        // First line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~(x + r * Math.cos(a_middle_rad)) + 0.5, ~~(y + 4 + r * Math.sin(a_middle_rad))]
          , ["L", ~~(x + r * Math.cos(a_middle_rad)) + 0.5, 0]
          ]
        , stroke: color_w1
        }))

        // Second line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~(x + r * Math.cos(a_middle_rad)) + 0.5 - (is_left ? 1 : -1), ~~(y + 4 + r * Math.sin(a_middle_rad))]
          , ["L", ~~(x + r * Math.cos(a_middle_rad)) + 0.5 - (is_left ? 1 : -1), 1]
          ]
        , stroke: color_w2
        }))
      }

      return wires;
    },

    draw_slice: function (slice) {
      var options = this.options,
        that = this;

      // Create wires
      slice._wires = this.draw_wires(94, 78, 67, slice.from, slice.to, options.color_blue, options.color_blue_light)
        .attr({opacity: 0});
      // Create arc
      slice._arc = this.R.path()
        .attr({arc: [94, 78, 64, slice.from, slice.to], "stroke-width": 3, stroke: options.color_blue, opacity: 0});

      // Create slice
      slice._piece = this.R.path()
        .attr({
          segment: [94, 78, 59, slice.from, slice.to],
          "stroke-width": 0,
          fill: slice.color,
          opacity: options.slice_faded_opacity
        })
        .mouseover(function () {
          // change opacity
          this.attr({opacity: 1});
          // change html contents
          options.title_element.innerHTML = slice.title;
          options.timerange_element.innerHTML = slice.timerange;
          slice._wires.attr({opacity: 1});
          slice._arc.attr({opacity: 1});

          if (slice != that.slice_active) {
            that.slice_active._piece.attr({opacity: options.slice_faded_opacity});
            that.slice_active._wires.attr({opacity: 0});
            that.slice_active._arc.attr({opacity: 0});
          }
        }).mouseout(function () {
          // change opacity
          this.attr({opacity: options.slice_faded_opacity});
          // change html contents
          options.title_element.innerHTML = options.timeline_title_default;
          options.timerange_element.innerHTML = options.timeline_timerange_default;
          slice._wires.attr({opacity: 0});
          slice._arc.attr({opacity: 0});

          that.slice_active._piece.attr({opacity: 1});
          that.slice_active._wires.attr({opacity: 1});
          that.slice_active._arc.attr({opacity: 1});
        });

      if (slice.active === true) {
        this.slice_active = slice;
        slice._piece.attr({opacity: 1});
        slice._wires.attr({opacity: 1});
        slice._arc.attr({opacity: 1});
      }
    }

  }


 /* Timeline PLUGIN DEFINITION
  * ===================== */

  $.fn.timeline = function ( option ) {
    var parent_arguments = Array.prototype.slice.call(arguments);

    return this.each(function () {
      var $this = $(this),
        data = $this.data('timeline'),
        options = typeof option == 'object' && option;

      if (!data) $this.data('timeline', (data = new Timeline(this, options)));
      if (typeof option == 'string') data[option].apply(data, parent_arguments.slice(1));
    })
  };

  $.fn.timeline.Constructor = Timeline;

  $.fn.timeline.defaults = {
    color_blue: '#3089b6',
    color_blue_light: '#bff2ff',
    color_gray: '#e7e7ea',
    slice_faded_opacity: 0.2,
    title_element: null,
    timerange_element: null
  };

}(window.jQuery);
