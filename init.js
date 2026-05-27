(function() {
  var meta = document.querySelector('meta[name=app-version]');
  var APP_VERSION = meta ? meta.content : '';
  var v = localStorage.getItem('mfv');
  if (v && v !== APP_VERSION) {
    localStorage.setItem('mfv', APP_VERSION);
    location.reload(true);
  } else if (!v) {
    localStorage.setItem('mfv', APP_VERSION);
  }
})();
console.log('%c[La14HD.com] Streaming Engine v3.2 - Sistema de Distribucion de Contenido', 'font-weight:bold;color:#00bcd4');
console.log('%c[La14HD.com] © 2024 La14HD.com - Todos los derechos reservados.', 'color:#888');
console.log('%c[La14HD.com] Prohibida la reproduccion o distribucion no autorizada.', 'color:#888');
setTimeout(function() {
  var ls = document.getElementById('loadingScreen');
  if (ls) {
    ls.style.opacity = '0';
    ls.style.visibility = 'hidden';
    setTimeout(function() { if (ls.parentNode) ls.parentNode.removeChild(ls); }, 500);
  }
}, 2000);
(function() {
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var ver = (document.querySelector('meta[name=app-version]') || {}).content || '348';
  document.write('<script src="' + (isMobile ? 'app-mobile' : 'app-pc') + '.js?v=' + ver + '"><\/script>');
})();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
(function() {
  var deferredPrompt = null;
  var installBtn = document.getElementById('installBtn');
  if (!installBtn) return;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = '';
  });
  installBtn.addEventListener('click', function() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(result) {
      if (result.outcome === 'accepted') installBtn.style.display = 'none';
      deferredPrompt = null;
    });
  });
  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
  if (isIos) {
    installBtn.style.display = '';
    installBtn.textContent = 'Instalar';
    installBtn.onclick = function() {
      alert('Para instalar: toca Compartir → Agregar a Pantalla de Inicio');
    };
  }
})();
document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-action]');
  if (!btn) return;
  var a = btn.getAttribute('data-action');
  if (a === 'close-player' && typeof closePlayer === 'function') closePlayer();
  else if (a === 'toggle-fullscreen' && typeof toggleFullscreen === 'function') toggleFullscreen();
  else if (a === 'report-issue' && typeof reportChannelIssue === 'function') reportChannelIssue();
  else if (a === 'close-admin') { var el = document.getElementById('page-admin'); if (el) el.style.display = 'none'; }
});
