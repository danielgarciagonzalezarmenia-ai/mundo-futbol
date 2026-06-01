package com.mundofutbol.app;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import java.io.ByteArrayInputStream;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    public void onResume() {
        super.onResume();
        final WebView wv = getBridge().getWebView();
        if (wv != null) {
            // 1. Configuraciones de alto rendimiento para Android TV
            WebSettings settings = wv.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false); // Autoplay transmisiones en TV sin interacción manual
            settings.setCacheMode(WebSettings.LOAD_DEFAULT); // Activar caché persistente para acelerar cargas
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW); // Cargar canales http/https sin bloqueos

            // 2. Definir User Agent personalizado con sufijo de TV para detección precisa en frontend
            String originalUA = settings.getUserAgentString();
            if (originalUA != null && !originalUA.contains("MundoFutbolTV")) {
                settings.setUserAgentString(originalUA + " AndroidTV MundoFutbolTV/1.0");
            }

            // 3. Sobrescribir WebViewClient con interceptor de anuncios de alto rendimiento
            wv.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (isAdUrl(url)) {
                        android.util.Log.d("MundoFutbolTV", "Redirección de publicidad bloqueada nativamente: " + url);
                        return true; // Bloquear navegación a URLs de publicidad
                    }
                    view.loadUrl(url);
                    return true;
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    if (isAdUrl(url)) {
                        android.util.Log.d("MundoFutbolTV", "Redirección de publicidad bloqueada nativamente: " + url);
                        return true;
                    }
                    view.loadUrl(url);
                    return true;
                }

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();
                    if (isAdUrl(url)) {
                        android.util.Log.d("MundoFutbolTV", "Solicitud de red bloqueada nativamente: " + url);
                        // Retornar respuesta vacía (Bloqueo a nivel de red)
                        return new WebResourceResponse(
                            "text/plain", 
                            "UTF-8", 
                            new ByteArrayInputStream("Blocked by MundoFutbol Native TV Engine".getBytes())
                        );
                    }
                    return super.shouldInterceptRequest(view, request);
                }
            });
        }
    }

    // Helper para identificar URLs de publicidad
    private boolean isAdUrl(String url) {
        if (url == null) return false;
        String lowerUrl = url.toLowerCase();
        return lowerUrl.contains("effectivecpmnetwork") ||
               lowerUrl.contains("adsterra") ||
               lowerUrl.contains("popads") ||
               lowerUrl.contains("popcash") ||
               lowerUrl.contains("juicyads") ||
               lowerUrl.contains("exoclick") ||
               lowerUrl.contains("clickunder") ||
               lowerUrl.contains("popunder") ||
               lowerUrl.contains("adnxs") ||
               lowerUrl.contains("adsystem") ||
               lowerUrl.contains("adserve") ||
               lowerUrl.contains("highcpmgate") ||
               lowerUrl.contains("onclickads") ||
               lowerUrl.contains("banner") ||
               lowerUrl.contains("doubleclick") ||
               lowerUrl.contains("googlesyndication");
    }
}
