$(function () {
  var $textarea = $('#timeline-textarea'),
    $redraw = $('#timeline-redraw'),
    $timeline = $('#timeline-body');

  $redraw.on('click', function (ev) {
    ev.preventDefault();

    $timeline.timeline('redraw', JSON.parse($textarea.val()));
  });
});
