(function() {
  var key = '63553ed7d05ed693bec4af3e09d22e4c';
  var units = document.querySelectorAll('.ad-unit');
  if (!units.length) return;
  var idx = 0;
  function loadNext() {
    if (idx >= units.length) return;
    var unit = units[idx++];
    var id = 'ad-container-' + idx;
    unit.id = id;
    atOptions = {
      'key': key,
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'container': id,
      'params': {}
    };
    var s = document.createElement('script');
    s.src = 'https://www.highperformanceformat.com/' + key + '/invoke.js';
    s.onload = loadNext;
    s.onerror = loadNext;
    unit.appendChild(s);
  }
  loadNext();
})();
