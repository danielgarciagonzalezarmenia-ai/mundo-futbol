// Configuración SDK de Firebase para Mundo Futbol
const firebaseConfig = {
  apiKey: "AIzaSyAIXqu1LL6G8LsdtKNgbh6VoGnVdTakMns",
  authDomain: "mundo-futbol-39711.firebaseapp.com",
  projectId: "mundo-futbol-39711",
  storageBucket: "mundo-futbol-39711.firebasestorage.app",
  messagingSenderId: "99443819214",
  appId: "1:99443819214:web:f7fe9565cf4c6168b6c69f",
  measurementId: "G-JQCJ7293NJ"
};

const FIREBASE_VAPID_KEY = "BMnS5mx1uRojsX4E3gHWQ2XnJye8RmQDpSNoxNO-n-EiGdqDBycjevWzL9gbvMENKDWb9ZcVT9R8KYHg8BG7FYc";

// Inicializar Firebase globalmente si el SDK está cargado
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
  
  // Soporte básico para notificaciones si está disponible en el navegador
  if (firebase.messaging.isSupported()) {
    window.messaging = firebase.messaging();
    
    // Iniciar el flujo de suscripción automática a notificaciones push
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initPushSubscriptionFlow, 4000); // Mostrar 4 segundos después de cargar
    });
  } else {
    console.warn("[Firebase] El navegador no soporta Firebase Cloud Messaging.");
  }
  
  console.log("%c[Firebase] Inicializado correctamente.", "color:#4caf50;font-weight:bold");
} else {
  console.error("[Firebase] Error: El SDK de Firebase no está cargado. Revisa tus CDN.");
}

/**
 * Lógica para mostrar la invitación premium a recibir alertas push
 */
function initPushSubscriptionFlow() {
  // Evitar SmartTVs / AndroidTVs que no soportan notificaciones nativas de navegador
  if (/TV|SmartTV|AndroidTV|AppleTV|Roku|Tizen|Web0S|Cast|BRAVIA|MundoFutbolTV/i.test(navigator.userAgent)) {
    return;
  }

  // Si ya está suscrito o ya canceló antes, no mostrar
  if (localStorage.getItem('mf_push_subscribed') === '1' || localStorage.getItem('mf_push_rejected') === '1') {
    return;
  }

  // Comprobar estado de permiso de notificación actual
  if (Notification.permission === 'granted') {
    // Si ya está concedido el permiso del navegador, registrar/actualizar el token silenciosamente
    registerFcmTokenSilently();
    return;
  } else if (Notification.permission === 'denied') {
    return; // Rechazado a nivel navegador
  }

  // Crear un banner premium flotante con diseño Glassmorphism y glow neon
  const banner = document.createElement('div');
  banner.id = 'pushPromptBanner';
  banner.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    max-width: 380px;
    background: rgba(18, 18, 28, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(249, 115, 22, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(249, 115, 22, 0.15);
    border-radius: 16px;
    padding: 20px;
    z-index: 100000;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: pushSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  `;

  banner.innerHTML = `
    <div style="display:flex; gap:12px; align-items:flex-start;">
      <div style="background:rgba(249, 115, 22, 0.1); padding:10px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bell-glow" style="animation: bellWobble 2.5s ease-in-out infinite;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      </div>
      <div style="flex:1;">
        <h4 style="margin:0 0 4px 0; font-size:0.95rem; font-weight:700; color:#fff; letter-spacing:-0.01em;">¡Alerta de Partidos en Vivo!</h4>
        <p style="margin:0; font-size:0.8rem; color:#a1a1aa; line-height:1.4;">¿Quieres recibir avisos en pantalla cuando jueguen tus equipos favoritos en vivo? ¡No te pierdas ningún gol!</p>
      </div>
    </div>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button onclick="dismissPushPrompt()" style="background:none; border:none; color:#a1a1aa; font-size:0.8rem; font-weight:600; cursor:pointer; padding:6px 12px; border-radius:var(--radius-pill); transition:background 0.2s;">Quizás luego</button>
      <button onclick="subscribeUserToPush()" style="background:var(--gradient-primary); border:none; color:#fff; font-size:0.8rem; font-weight:700; cursor:pointer; padding:8px 18px; border-radius:var(--radius-pill); box-shadow:0 4px 12px rgba(249,115,22,0.3); transition:all 0.3s;">🔔 Activar Alertas</button>
    </div>
    <style>
      @keyframes pushSlideUp {
        from { opacity:0; transform:translateY(40px) scale(0.95); }
        to { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes bellWobble {
        0%, 100% { transform: rotate(0); }
        15% { transform: rotate(15deg); }
        30% { transform: rotate(-15deg); }
        45% { transform: rotate(10deg); }
        60% { transform: rotate(-10deg); }
        75% { transform: rotate(4deg); }
        85% { transform: rotate(-4deg); }
      }
    </style>
  `;

  document.body.appendChild(banner);
}

// Cerrar el diálogo push
function dismissPushPrompt() {
  const banner = document.getElementById('pushPromptBanner');
  if (banner) {
    banner.style.animation = 'pushSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => banner.remove(), 400);
  }
  localStorage.setItem('mf_push_rejected', '1');
}

// Suscribir al usuario (Pedir permiso y obtener token FCM)
function subscribeUserToPush() {
  if (typeof messaging === 'undefined') return;

  Notification.requestPermission().then(async (permission) => {
    if (permission === 'granted') {
      try {
        console.log('[FCM] Permiso otorgado. Solicitando token FCM...');
        
        // Obtener el token único del dispositivo
        const token = await messaging.getToken({ vapidKey: FIREBASE_VAPID_KEY });
        
        if (token) {
          console.log('[FCM] Token recibido:', token);
          
          // Registrar en Firestore
          await db.collection('subscriptions').doc(token).set({
            token: token,
            userAgent: navigator.userAgent,
            subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          console.log('[Firestore] Dispositivo registrado correctamente.');
          localStorage.setItem('mf_push_subscribed', '1');
          
          // Cerrar banner con una animación de éxito
          const banner = document.getElementById('pushPromptBanner');
          if (banner) {
            banner.innerHTML = `
              <div style="display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; padding:10px 0;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <h4 style="margin:0; font-size:0.95rem; color:#fff;">¡Suscrito con Éxito!</h4>
                <p style="margin:0; font-size:0.75rem; color:#a1a1aa;">Te avisaremos tan pronto comiencen los partidos.</p>
              </div>
            `;
            setTimeout(() => {
              banner.style.animation = 'pushSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
              setTimeout(() => banner.remove(), 400);
            }, 3000);
          }
        } else {
          console.error('[FCM] No se pudo obtener el token de mensajería.');
          alert('Hubo un problema al registrar notificaciones. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('[FCM] Error en el flujo de suscripción:', error);
        alert('Error al registrar notificaciones: ' + error.message);
      }
    } else {
      console.warn('[FCM] El usuario denegó el permiso de notificaciones.');
      dismissPushPrompt();
    }
  });
}

// Registrar el token silenciosamente (si el permiso ya estaba concedido)
async function registerFcmTokenSilently() {
  if (typeof messaging === 'undefined' || typeof db === 'undefined') return;

  try {
    const token = await messaging.getToken({ vapidKey: FIREBASE_VAPID_KEY });
    if (token) {
      // Actualizar el token y marca de tiempo en Firestore silenciosamente
      await db.collection('subscriptions').doc(token).set({
        token: token,
        userAgent: navigator.userAgent,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log('[FCM] Token de suscripción actualizado silenciosamente.');
      localStorage.setItem('mf_push_subscribed', '1');
    }
  } catch (error) {
    console.error('[FCM] Error al registrar token de forma silenciosa:', error);
  }
}
