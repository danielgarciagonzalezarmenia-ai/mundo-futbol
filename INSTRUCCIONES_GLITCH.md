# Instrucciones para desplegar el proxy en Glitch.com

## ¿Qué es Glitch.com?
Glitch.com es una plataforma gratuita para crear y desplegar aplicaciones web. No requiere tarjeta de crédito y es muy fácil de usar.

## Pasos para desplegar:

1. **Ve a https://glitch.com**
2. **Crea una cuenta** (puedes usar tu cuenta de GitHub)
3. **Crea un nuevo proyecto**:
   - Haz clic en "New Project"
   - Selecciona "glitch-hello-node" (o cualquier template de Node.js)
4. **Reemplaza el código**:
   - Abre el archivo `server.js` en Glitch
   - Borra todo el contenido
   - Copia el contenido de `glitch-proxy.js` de tu proyecto
   - Pégalo en `server.js` de Glitch
5. **Reemplaza package.json**:
   - Abre el archivo `package.json` en Glitch
   - Reemplaza con:
   ```json
   {
     "name": "mundo-futbol-proxy",
     "version": "1.0.0",
     "description": "Proxy para streams HLS",
     "main": "server.js",
     "scripts": {
       "start": "node server.js"
     },
     "dependencies": {
       "express": "^4.18.2"
     }
   }
   ```
6. **Guarda los cambios** (se guarda automáticamente)
7. **Obtén la URL**:
   - Glitch te dará una URL como: `https://tu-proyecto.glitch.me`
   - Tu endpoint de proxy será: `https://tu-proyecto.glitch.me/api/proxy?url=`

## Ejemplo de uso:
Si tu proyecto se llama `mundo-futbol-proxy`, la URL será:
`https://mundo-futbol-proxy.glitch.me/api/proxy?url=TU_STREAM_URL`

## Ventajas de Glitch:
- ✅ Gratis (sin tarjeta de crédito)
- ✅ Fácil de usar
- ✅ No requiere configuración compleja
- ✅ Se despliega automáticamente
- ✅ Funciona 24/7 (con límites de uso)

## Limitaciones:
- El proyecto se "duerme" si no hay actividad por 5 minutos
- Se despierta automáticamente cuando alguien hace una petición
- Límites de uso en el plan gratuito
