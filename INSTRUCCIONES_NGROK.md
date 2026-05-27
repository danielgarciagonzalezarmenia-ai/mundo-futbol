# Instrucciones para convertir tu computador en servidor con ngrok

## ¿Qué es ngrok?
ngrok es una herramienta que crea un túnel inverso para exponer tu servidor local a internet. Permite que otros usuarios accedan a tu computador desde cualquier lugar.

## Paso 1: Instalar Node.js (si no lo tienes)
1. Ve a https://nodejs.org
2. Descarga e instala la versión LTS
3. Verifica la instalación: `node --version`

## Paso 2: Instalar ngrok
1. Ve a https://ngrok.com
2. Crea una cuenta gratuita
3. Descarga ngrok para Windows
4. Descomprime el archivo
5. Mueve ngrok.exe a una carpeta fácil de acceder (ej: C:\ngrok)
6. Abre terminal en esa carpeta
7. Autentica: `ngrok authtoken TU_TOKEN` (el token está en tu cuenta de ngrok)

## Paso 3: Configurar el servidor proxy
El archivo `server.js` ya tiene el endpoint `/api/proxy` configurado.

## Paso 4: Iniciar el servidor
1. Abre terminal en la carpeta del proyecto: `c:\Users\Daniel\Desktop\Mundo Futbol`
2. Ejecuta: `node server.js`
3. El servidor estará corriendo en http://localhost:3000

## Paso 5: Crear el túnel con ngrok
1. Abre otro terminal
2. Navega a la carpeta de ngrok: `cd C:\ngrok`
3. Ejecuta: `ngrok http 3000`
4. ngrok te dará una URL como: `https://abcd-1234.ngrok-free.app`
5. Esta URL es tu túnel público

## Paso 6: Usar la URL del túnel
Tu endpoint de proxy será:
`https://abcd-1234.ngrok-free.app/api/proxy?url=TU_STREAM_URL`

## Paso 7: Configurar energía de la laptop
1. Ve a **Configuración** → **Sistema** → **Energía y suspensión**
2. En "Al cerrar la tapa", selecciona **"No hacer nada"** (cuando está conectada a corriente)
3. Conecta la laptop a corriente SIEMPRE

## Paso 8: Mantener el servidor activo
- Laptop conectada a corriente 24/7
- Pantalla cerrada (configurada para no apagar)
- Internet funcionando siempre
- Servidor node.js corriendo
- ngrok corriendo

## Limitaciones de ngrok gratuito:
- La URL cambia cada vez que reinicias ngrok
- Límite de conexiones simultáneas
- Se puede desconectar después de inactividad prolongada

## Solución para URL permanente:
Opcional: Usar ngrok con dominio personal (requiere plan de pago ~$8 USD/mes)
