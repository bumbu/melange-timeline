$(function() {
  var R = Raphael('timeline-body'),
    color_blue = '#3089b6',
    color_blue_light = '#bff2ff',
    color_gray = '#e7e7ea',
    slice_active,
    slice_opacity = 0.2,
    timeline_title_default = timeline.title_element.innerHTML,
    timeline_timerange_default = timeline.timerange_element.innerHTML
    ;

  R.customAttributes.segment = function (x, y, r, a1, a2, color) {
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

  R.customAttributes.arc = function (x, y, r, a1, a2) {
    var flag = (a2 - a1) > 180,
      clr = (a2 - a1) / 360;

    a1 = (a1 % 360) * Math.PI / 180;
    a2 = (a2 % 360) * Math.PI / 180;

    return {
      path: [["M", x + r * Math.cos(a1), y + r * Math.sin(a1)], ["A", r, r, 0, +flag, 1, x + r * Math.cos(a2), y + r * Math.sin(a2)]]
    };
  };

  // Add top lines
  R.path('M0 0.5L187 0.5').attr({stroke: color_blue});
  R.path('M0 1.5L187 1.5').attr({stroke: color_blue_light});

  var circle_outer = R.circle(94, 78, 64).attr({stroke: color_blue, "stroke-width": 3, opacity: 0.25}),
    draw_wires = function (x, y, r, a1, a2, colorw1, colorw2) {
      var wires = R.set(),
        a_middle = (((a1 + a2) / 2) + (a2 < a1 ? 180 : 0)) % 360,
        a_middle_rad = (a_middle % 360) * Math.PI / 180,
        is_bottom = a_middle <= 180,
        is_left = a_middle > 90 && a_middle < 270,
        _path;

      if (is_bottom) {
        // First line
        wires.push(R.path().attr({
          path: [
            ["M", ~~((is_left ? 6 : -6) + x + r * Math.cos(a_middle_rad)), ~~(y + 2 + r * Math.sin(a_middle_rad)) + 0.5]
          , ["l", ~~(is_left ? (-r - 10 - r * Math.cos(a_middle_rad)) : (r + 10 - r * Math.cos(a_middle_rad))) + 0.5, 0]
          , ["l", 0, -~~(y + 2 + r * Math.sin(a_middle_rad)) - 0.5]
          ]
        , stroke: colorw1
        }))

        // Second line
        wires.push(R.path().attr({
          path: [
            ["M", ~~((is_left ? 6 : -6) + x + r * Math.cos(a_middle_rad)), ~~(y + 2 + r * Math.sin(a_middle_rad)) + 1.5]
          , ["l", ~~(is_left ? (-r - 11 - r * Math.cos(a_middle_rad)) : (r + 11 - r * Math.cos(a_middle_rad))) + 0.5, 0]
          , ["l", 0, -~~(y + 2 + r * Math.sin(a_middle_rad)) - 0.5]
          ]
        , stroke: colorw2
        }))
      } else {
        // First line
        wires.push(R.path().attr({
          path: [
            ["M", ~~(x + r * Math.cos(a_middle_rad)) + 0.5, ~~(y + 4 + r * Math.sin(a_middle_rad))]
          , ["L", ~~(x + r * Math.cos(a_middle_rad)) + 0.5, 0]
          ]
        , stroke: colorw1
        }))

        // Second line
        wires.push(R.path().attr({
          path: [
            ["M", ~~(x + r * Math.cos(a_middle_rad)) + 0.5 - (is_left ? 1 : -1), ~~(y + 4 + r * Math.sin(a_middle_rad))]
          , ["L", ~~(x + r * Math.cos(a_middle_rad)) + 0.5 - (is_left ? 1 : -1), 1]
          ]
        , stroke: colorw2
        }))
      }

      return wires;
    },
    draw_slice = function (slice) {
      // Create wires
      slice._wires = draw_wires(94, 78, 67, slice.from, slice.to, color_blue, color_blue_light)
        .attr({opacity: 0});
      // Create arc
      slice._arc = R.path()
        .attr({arc: [94, 78, 64, slice.from, slice.to], "stroke-width": 3, stroke: color_blue, opacity: 0});

      // Create slice
      slice._piece = R.path()
        .attr({segment: [94, 78, 59, slice.from, slice.to, slice.color], "stroke-width": 0})
        .mouseover(function () {
          // change opacity
          this.attr({opacity: 1});
          // change html contents
          timeline.title_element.innerHTML = slice.title;
          timeline.timerange_element.innerHTML = slice.timerange;
          slice._wires.attr({opacity: 1});
          slice._arc.attr({opacity: 1});

          if (slice != slice_active) {
            slice_active._piece.attr({opacity: slice_opacity});
            slice_active._wires.attr({opacity: 0});
            slice_active._arc.attr({opacity: 0});
          }

        }).mouseout(function () {
          // change opacity
          this.attr({opacity: slice_opacity});
          // change html contents
          timeline.title_element.innerHTML = timeline_title_default;
          timeline.timerange_element.innerHTML = timeline_timerange_default;
          slice._wires.attr({opacity: 0});
          slice._arc.attr({opacity: 0});

          slice_active._piece.attr({opacity: 1});
          slice_active._wires.attr({opacity: 1});
          slice_active._arc.attr({opacity: 1});
        });

      if (slice.active === true) {
        slice_active = slice;
        slice._piece.attr({opacity: 1});
        slice._wires.attr({opacity: 1});
        slice._arc.attr({opacity: 1});
      }
    };

  for (i = 0, ii = timeline.slices.length; i < ii; i++) {
    draw_slice(timeline.slices[i]);
  }

  var circle_inner = R.circle(94, 78, 33).attr({fill: "#ffffff", "stroke-width": 0}),
    year = R.text(94, 78, "2013").attr({font: '700 18px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif', fill: color_blue}),
    inner_line = R.path('M94 91L94 111').attr({stroke: color_gray, "stroke-width": 1});

});
