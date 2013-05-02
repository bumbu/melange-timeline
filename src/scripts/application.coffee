$ ->
  console.log('jQuery loaded')

  r = Raphael('timeline-body')
  Raphael.color('#3089b6')
  r.path('M0 0L187 0')
  Raphael.color('#bff2ff')
  r.path('M0 1L187 1')
  r.piechart(100, 100, 66, [55, 20, 13, 32, 5, 1, 2, 10])