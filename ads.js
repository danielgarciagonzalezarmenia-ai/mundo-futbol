(function() {
  var key = '63553ed7d05ed693bec4af3e09d22e4c';
  var units = document.querySelectorAll('.ad-unit');
  if (!units.length) return;
  window.atOptions = {
    'key': key,
    'format': 'iframe',
    'height': 90,
    'width': 728,
    'params': {}
  };
  units.forEach(function(unit) {
    var s = document.createElement('script');
    s.src = 'https://www.highperformanceformat.com/' + key + '/invoke.js';
    s.async = false;
    unit.appendChild(s);
  });
})();
