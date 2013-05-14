$(function() {
  var r = Raphael('timeline-body'),
    color_blue = '#3089b6',
    color_blue_light = '#bff2ff',
    color_gray = '#e7e7ea',
    slice_active,
    slice_opacity = 0.6,
    timeline_title_default = timeline.title_element.innerHTML,
    timeline_timerange_default = timeline.timerange_element.innerHTML
    ;

  r.customAttributes.segment = function (x, y, r, a1, a2, color) {
    var flag = (a2 - a1) > 180,
      clr = (a2 - a1) / 360;

    a1 = (a1 % 360) * Math.PI / 180;
    a2 = (a2 % 360) * Math.PI / 180;

    return {
      path: [["M", x, y], ["l", r * Math.cos(a1), r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)], ["z"]],
      fill: color,
      opacity: slice_opacity
    };
  };

  r.customAttributes.arc = function (x, y, r, a1, a2) {
    var flag = (a2 - a1) > 180,
      clr = (a2 - a1) / 360;

    a1 = (a1 % 360) * Math.PI / 180;
    a2 = (a2 % 360) * Math.PI / 180;

    return {
      path: [["M", x + r * Math.cos(a1), y + r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)]]
    };
  };

  // Add top lines
  r.path('M0 0L187 0').attr({stroke: color_blue});
  r.path('M0 1L187 1').attr({stroke: color_blue_light});

  var circle_outer = r.circle(94, 78, 64).attr({stroke: color_blue, "stroke-width": 3, opacity: 0.25});

  for (i = 0, ii = timeline.slices.length; i < ii; i++) {

    (function (slice) {
      // Create arc
      slice._arc = r.path()
        .attr({arc: [94, 78, 64, slice.from, slice.to], "stroke-width": 3, stroke: color_blue, opacity: 0});

      // Create slice
      slice._piece = r
        .path()
        .attr({segment: [94, 78, 59, slice.from, slice.to, slice.color], "stroke-width": 0})
        .mouseover(function () {
          // change opacity
          this.attr({opacity: 1});
          // change html contents
          timeline.title_element.innerHTML = slice.title;
          timeline.timerange_element.innerHTML = slice.timerange;
          slice._arc.attr({opacity: 1});

          if (slice != slice_active) {
            slice_active._piece.attr({opacity: slice_opacity});
            slice_active._arc.attr({opacity: 0});
          }

        }).mouseout(function () {
          // change opacity
          this.attr({opacity: slice_opacity});
          // change html contents
          timeline.title_element.innerHTML = timeline_title_default;
          timeline.timerange_element.innerHTML = timeline_timerange_default;
          slice._arc.attr({opacity: 0});

          slice_active._piece.attr({opacity: 1});
          slice_active._arc.attr({opacity: 1});
        });

      if (slice.active === true) {
        slice_active = slice;
        slice._piece.attr({opacity: 1});
        slice._arc.attr({opacity: 1});
      }

    })(timeline.slices[i]);

  }

  var circle_inner = r.circle(94, 78, 33).attr({fill: "#ffffff", "stroke-width": 0}),
    year = r.text(94, 78, "2013").attr({font: '700 18px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif', fill: color_blue}),
    inner_line = r.path('M94 91L94 111').attr({stroke: color_gray, "stroke-width": 1});

});
