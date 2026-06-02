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
  document.write('<script src="' + (isMobile ? 'app-mobile' : 'app-pc') + '.js?v=' + ver + '" defer><\/script>');
})();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
(function() {
  var deferredPrompt = null;
  var installBtn = document.getElementById('installBtn');
  var pwaCard = document.getElementById('pwaInstallCard');
  var pwaBtn = document.getElementById('pwaInstallBtn');

  function showInstallUI() {
    if (installBtn) installBtn.style.display = '';
    if (pwaCard) pwaCard.style.display = 'block';
  }

  function hideInstallUI() {
    if (installBtn) installBtn.style.display = 'none';
    if (pwaCard) pwaCard.style.display = 'none';
  }

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallUI();
  });

  function triggerPrompt() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(result) {
      if (result.outcome === 'accepted') {
        hideInstallUI();
      }
      deferredPrompt = null;
    });
  }

  if (installBtn) installBtn.addEventListener('click', triggerPrompt);
  if (pwaBtn) pwaBtn.addEventListener('click', triggerPrompt);

  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone;
  if (isIos) {
    showInstallUI();
    var iosHandler = function() {
      alert('Para instalar en iOS: toca el botón Compartir y selecciona "Agregar a Pantalla de Inicio"');
    };
    if (installBtn) {
      installBtn.textContent = 'Instalar';
      installBtn.onclick = iosHandler;
    }
    if (pwaBtn) {
      pwaBtn.onclick = iosHandler;
      var desc = document.getElementById('pwaInstallDesc');
      if (desc) desc.textContent = 'Toca Compartir → Agregar a Pantalla de Inicio en tu iPhone/iPad';
    }
  } else {
    // Si es un dispositivo móvil y el prompt antes de instalar no se ha disparado aún,
    // podemos mostrar el botón para guiar al usuario a agregarlo manualmente.
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      if (pwaCard) pwaCard.style.display = 'block';
      if (pwaBtn && !pwaBtn.onclick) {
        pwaBtn.addEventListener('click', function() {
          if (deferredPrompt) {
            triggerPrompt();
          } else {
            alert('Para instalar MundoFutbol: abre el menú de tu navegador (los tres puntos arriba a la derecha) y pulsa "Instalar aplicación" o "Agregar a la pantalla principal".');
          }
        });
      }
    }
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
