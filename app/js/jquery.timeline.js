!function ($) {

  "use strict"; // jshint ;_;


 /* Timeline CLASS DEFINITION
  * ==================== */

  var Timeline = function (element, options) {
    this.init(element, options);
  };

  Timeline.prototype = {

    constructor: Timeline,

    init: function (element, options) {
      this.R = Raphael(element);
      this.options = $.extend({}, $.fn.timeline.defaults, options);

      // Definde R custom attributes
      this.R.customAttributes.segment = function (x, y, r, a1, a2) {
        var flag = (a2 - a1) > 180;

        a1 = (a1 % 360) * Math.PI / 180;
        a2 = (a2 % 360) * Math.PI / 180;

        return {
          path: [["M", x, y], ["l", r * Math.cos(a1), r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)], ["z"]]
        };
      };

      this.R.customAttributes.arc = function (x, y, r, a1, a2) {
        var flag = (a2 - a1) > 180;

        a1 = (a1 % 360) * Math.PI / 180;
        a2 = (a2 % 360) * Math.PI / 180;

        return {
          path: [["M", x + r * Math.cos(a1), y + r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)]]
        };
      };

      // Default active slice
      this.slice_active = null;

      // Init slices set
      this.slices = [];

      // Draw slices
      this.draw(this.options.slices);
    },

    draw: function (slices) {
      var options = this.options,
        that = this,
        i;

      slices = this.datesToGrades(slices);

      for (i in slices) {
        // Check for colors. Set default if missing
        if (slices[i].color === undefined) {
          slices[i].color = options.colors_default[i % options.colors_default.length];
        }
      }

      slices = this.addMissingSlices(slices);

      slices = this.computeTimeRanges(slices);

      slices = this.setActiveSlice(slices);

      // Add top lines
      this.R.path('M0 0.5L187 0.5').attr({stroke: options.color_blue});
      this.R.path('M0 1.5L187 1.5').attr({stroke: options.color_blue_light});

      for (i in slices) {
        // Draw
        this.slices.push(this.draw_slice(slices[i]));
      }

      // Draw inner circle
      this.inner = {
        circle: that.R.circle(94, 78, 33).attr({fill: "#ffffff", "stroke-width": 0}),
        text: that.R.text(94, 78, that.year).attr({font: '700 18px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif', fill: options.color_blue}),
        line: that.R.path('M94 91L94 111').attr({stroke: options.color_gray})
      };
    },

    draw_wires: function (x, y, r, a1, a2, color_w1, color_w2) {
      var wires = this.R.set(),
        a_middle = (((a1 + a2) / 2) + (a2 < a1 ? 180 : 0)) % 360,
        a_middle_rad = (a_middle % 360) * Math.PI / 180,
        is_bottom = a_middle <= 180,
        is_left = a_middle > 90 && a_middle < 270;

      color_w1 = color_w1 || this.options.color_blue;
      color_w2 = color_w2 || this.options.color_blue_light;

      if (is_bottom) {
        // First line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~((is_left ? 6 : -6) + x + r * Math.cos(a_middle_rad)), ~~(y + 2 + r * Math.sin(a_middle_rad)) + 0.5],
            ["l", ~~(is_left ? (-r - 10 - r * Math.cos(a_middle_rad)) : (r + 10 - r * Math.cos(a_middle_rad))) + 0.5, 0],
            ["l", 0, -~~(y + 2 + r * Math.sin(a_middle_rad)) - 0.5]
          ],
          stroke: color_w1
        }));

        // Second line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~((is_left ? 6 : -6) + x + r * Math.cos(a_middle_rad)), ~~(y + 2 + r * Math.sin(a_middle_rad)) + 1.5],
            ["l", ~~(is_left ? (-r - 11 - r * Math.cos(a_middle_rad)) : (r + 11 - r * Math.cos(a_middle_rad))) + 0.5, 0],
            ["l", 0, -~~(y + 2 + r * Math.sin(a_middle_rad)) - 0.5]
          ],
          stroke: color_w2
        }));
      } else {
        // First line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~(x + r * Math.cos(a_middle_rad)) + 0.5, ~~(y + 4 + r * Math.sin(a_middle_rad))],
            ["L", ~~(x + r * Math.cos(a_middle_rad)) + 0.5, 0]
          ],
          stroke: color_w1
        }));

        // Second line
        wires.push(this.R.path().attr({
          path: [
            ["M", ~~(x + r * Math.cos(a_middle_rad)) + 0.5 - (is_left ? 1 : -1), ~~(y + 4 + r * Math.sin(a_middle_rad))],
            ["L", ~~(x + r * Math.cos(a_middle_rad)) + 0.5 - (is_left ? 1 : -1), 1]
          ],
          stroke: color_w2
        }));
      }

      return wires;
    },

    draw_slice: function (slice) {
      var options = this.options,
        that = this;

      // Create wires
      slice._wires = this.draw_wires(94, 78, 67, slice.from_grade, slice.to_grade, options.color_blue, options.color_blue_light)
        .attr({opacity: 0});
      // Create arc
      slice._arc = this.R.path()
        .attr({
          arc: [94, 78, 64, slice.from_grade, slice.to_grade],
          "stroke-width": 3,
          stroke: options.color_blue,
          opacity: options.slice_faded_opacity
        });

      // Create slice
      slice._piece = this.R.path()
        .attr({
          segment: [94, 78, 59, slice.from_grade, slice.to_grade],
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
            that.slice_active._arc.attr({opacity: options.slice_faded_opacity});
          }
        }).mouseout(function () {
          // change opacity
          this.attr({opacity: options.slice_faded_opacity});
          // change html contents
          options.title_element.innerHTML = options.timeline_title_default;
          options.timerange_element.innerHTML = options.timeline_timerange_default;
          slice._wires.attr({opacity: 0});
          slice._arc.attr({opacity: options.slice_faded_opacity});

          that.slice_active._piece.attr({opacity: 1});
          that.slice_active._wires.attr({opacity: 1});
          that.slice_active._arc.attr({opacity: 1});
        });

      if (slice.active === true) {
        this.slice_active = slice;
        slice._piece.attr({opacity: 1});
        slice._wires.attr({opacity: 1});
        slice._arc.attr({opacity: 1});

        // Store default title and timeline
        options.timeline_title_default = slice.title;
        options.timeline_timerange_default = slice.timerange;

        // Set default title and timeline
        options.title_element.innerHTML = slice.title;
        options.timerange_element.innerHTML = slice.timerange;
      }

      return slice;
    },

    redraw: function (slices) {
      // Delete previously drawn objects
      this.clean();

      // Draw
      this.draw(slices);
    },

    clean: function () {
      $.each(this.slices, function (index, slice) {
        // Remove each Raphael object and set
        slice._wires.remove();
        slice._arc.remove();
        slice._piece.remove();
      });

      // Empty array
      this.slices = [];
    },

    datesToGrades: function (slices) {
      var that = this,
        time_start = null,
        time_end = null,
        time_zero_grade,
        milisecondsInOneGrade = 1000 * 60 * 60 * 24 * 365 / 360;

      // Find minimax and maximal time intervals
      $.each(slices, function (index, slice) {
        if (time_start === null || time_start > that.dateToUTCMiliseconds(slice.from)) {
          time_start = that.dateToUTCMiliseconds(slice.from);
        }
        if (time_end === null || time_end < that.dateToUTCMiliseconds(slice.to)) {
          time_end = that.dateToUTCMiliseconds(slice.to);
        }
      });

      // 90 grades is first day of last year
      // 0 grades will be first day of last year minus 3 months
      time_zero_grade = Date.UTC(new Date(time_end).getFullYear() - 1, 9, 1);

      // Store current year
      this.year = new Date(time_end).getFullYear();

      // Transform dates to grades
      for (var index in slices) {
        slices[index].from_grade = (that.dateToUTCMiliseconds(slices[index].from) - time_zero_grade) / milisecondsInOneGrade;
        slices[index].to_grade = (that.dateToUTCMiliseconds(slices[index].to) - time_zero_grade) / milisecondsInOneGrade;
      }

      return slices;
    },

    // Parse yyyy-mm-dd hh:mm:ss
    // Parse using custom function as standart parse function is implementation dependant
    // Returns number of miliseconds from midnight January 1 1970
    dateToUTCMiliseconds: function (date) {
      var parts = date.match(/(\d+)/g);
      return Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5] || 0); // months are 0-based
    },

    addMissingSlices: function (slices) {
      var that = this,
        slices_count = slices.length,
        slice_prev,
        slice_next;

      // Sort slices
      slices.sort(function (a, b) {return that.dateToUTCMiliseconds(a.from) - that.dateToUTCMiliseconds(b.from); });

      for (var index = 0; index < slices_count; index++) {
        slice_prev = slices[index];
        slice_next = slices[(index + 1) % slices_count];

        if (this.dateToUTCMiliseconds(slice_prev.to) != this.dateToUTCMiliseconds(slice_next.from)) {
          slices.push({
            title: slice_next.title + that.options.slice_title_append,
            from: slice_prev.to,
            to: slice_next.from,
            from_grade: slice_prev.to_grade,
            to_grade: slice_next.from_grade,
            color: that.shadeColor(slice_next.color, that.options.slice_missing_shade)
          });
        }
      }

      return slices;
    },

    computeTimeRanges: function (slices) {
      var date_from,
        date_to,
        month_names = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

      for (var i = slices.length - 1; i >= 0; i--) {
        if (slices[i].timerange === undefined) {
          date_from = new Date(this.dateToUTCMiliseconds(slices[i].from));
          date_to = new Date(this.dateToUTCMiliseconds(slices[i].to));

          if (date_from.getUTCMonth() == date_to.getUTCMonth()) {
            slices[i].timerange = month_names[date_from.getUTCMonth()] + " " + date_from.getUTCDate() + " - " + date_to.getUTCDate();
          } else {
            slices[i].timerange = month_names[date_from.getUTCMonth()] + " " + date_from.getUTCDate() + " - " + month_names[date_to.getUTCMonth()] + " " + date_to.getUTCDate();
          }
        }
      }

      return slices;
    },

    setActiveSlice: function (slices) {
      var slices_count = slices.length;

      // transform date into miliseconds
      if (isNaN(parseInt(this.options.now, 10)) || !isFinite(this.options.now)) {
        this.options.now = this.dateToUTCMiliseconds(this.options.now);
      }

      // Find active slice and set it as active
      for (var index = 0; index < slices_count; index++) {
        if (this.dateToUTCMiliseconds(slices[index].from) < this.options.now && this.dateToUTCMiliseconds(slices[index].to) > this.options.now) {
          slices[index].active = true;
          break;
        }
      }

      return slices;
    },

    // Source http://stackoverflow.com/a/13542669/1194327
    shadeColor: function (color, percent) {
      var num = parseInt(color.slice(1), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;

      return "#" + (
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 +
        (G < 255 ? G < 1 ? 0 : G : 255)
      ).toString(16).slice(1);
    }

  };


 /* Timeline PLUGIN DEFINITION
  * ===================== */

  $.fn.timeline = function (option) {
    var parent_arguments = Array.prototype.slice.call(arguments);

    return this.each(function () {
      var $this = $(this),
        data = $this.data('timeline'),
        options = typeof option == 'object' && option;

      if (!data) {
        $this.data('timeline', (data = new Timeline(this, options)));
      }

      if (typeof option == 'string') {
        data[option].apply(data, parent_arguments.slice(1));
      }
    });
  };

  $.fn.timeline.Constructor = Timeline;

  $.fn.timeline.defaults = {
    color_blue: '#3089b6',
    color_blue_light: '#bff2ff',
    color_gray: '#e7e7ea',
    slice_faded_opacity: 0.2,
    title_element: '',
    timerange_element: '',
    colors_default: ['#d3d2d7', '#fb1714', '#fde733', '#92f13d', '#16d53d', '#419ca6', '#03588c'],
    slices: [],
    slice_title_append: ' soon',
    slice_missing_shade: 30,
    now: new Date().getTime()
  };

}(window.jQuery);
