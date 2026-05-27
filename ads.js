window.atAsyncOptions = [];
var adKeys = ['63553ed7d05ed693bec4af3e09d22e4c'];
var units = document.querySelectorAll('.ad-unit');
units.forEach(function(unit, idx) {
  var id = 'adc-' + idx;
  unit.id = id;
  window.atAsyncOptions.push({
    'key': adKeys[idx % adKeys.length],
    'format': 'iframe',
    'height': 90,
    'width': 728,
    'container': id,
    'params': {}
  });
});
