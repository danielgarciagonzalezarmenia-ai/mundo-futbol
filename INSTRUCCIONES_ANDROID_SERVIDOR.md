# Instrucciones para configurar Android como servidor

## Requisitos
- Celular Android
- Conexión a internet estable
- Cargador conectado 24/7
- Termux (aplicación de terminal para Android)

## Paso 1: Instalar Termux
1. Ve a Google Play Store
2. Busca "Termux"
3. Instala Termux
4. Abre Termux

## Paso 2: Actualizar Termux
En Termux, ejecuta:
```bash
pkg update && pkg upgrade
```

## Paso 3: Instalar Node.js en Termux
En Termux, ejecuta:
```bash
pkg install nodejs
```

Verificar instalación:
```bash
node --version
```

## Paso 4: Instalar dependencias
En Termux, ejecuta:
```bash
pkg install git
pkg install nano
```

## Paso 5: Copiar archivos al celular

**Opción A: Usar git (RECOMENDADO)**
```bash
cd ~
git clone https://github.com/danielgarciagonzalezarmenia-ai/mundo-futbol.git
cd mundo-futbol
npm install
```

**Opción B: Copiar manualmente**
1. Conecta el celular a la PC
2. Copia la carpeta del proyecto al celular
3. En Termux, navega a la carpeta copiada

## Paso 6: Instalar ngrok en Termux
En Termux, ejecuta:
```bash
pkg install wget
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
mv ngrok /usr/local/bin/
```

## Paso 7: Autenticar ngrok
1. Ve a https://ngrok.com
2. Crea una cuenta gratuita
3. Inicia sesión
4. Ve a "Your Authtoken" en el dashboard
5. Copia tu token
6. En Termux, ejecuta:
```bash
ngrok authtoken TU_TOKEN
```

## Paso 8: Iniciar el servidor
En Termux, en la carpeta del proyecto:
```bash
node server.js
```

Deja esta terminal abierta (el servidor está corriendo).

## Paso 9: Crear el túnel con ngrok
Abre OTRA instancia de Termux:
```bash
ngrok http 3000
```

ngrok te mostrará una URL como: `https://abcd-1234.ngrok-free.app`

**COPIA ESA URL** y me la dices.

## Paso 10: Configurar energía del celular

**Para que el celular no se apague:**
1. Ve a **Configuración** → **Batería**
2. Desactiva "Ahorro de batería"
3. Configura "Mantener pantalla encendida mientras carga"
4. Desactiva "Suspender si no se usa"

**Para que no se bloquee:**
1. Ve a **Configuración** → **Pantalla**
2. Configura "Tiempo de espera de la pantalla" a 30 minutos o más
3. O usa una app como "Keep Screen On"

## Paso 11: Mantener el servidor activo

**Requisitos:**
- Celular conectado a corriente 24/7
- Internet funcionando siempre
- Termux corriendo en background
- Servidor node.js corriendo
- ngrok corriendo

**Para mantener Termux en background:**
1. En Termux, presiona el botón de recientes
2. Termux se mantendrá en background
3. No cierres Termux completamente

## Paso 12: Integrar URL en la aplicación

Cuando me des la URL de ngrok:
1. La integro en `app-pc.js` y `app-mobile.js`
2. Subo los cambios
3. Verificamos que funcione

## Limitaciones de ngrok gratuito:
- La URL cambia cada vez que reinicias ngrok
- Límite de conexiones simultáneas
- Se puede desconectar después de inactividad prolongada

## Solución para URL permanente:
Opcional: Usar ngrok con dominio personal (requiere plan de pago ~$8 USD/mes)

## Ventajas de usar Android vs PC:
- Consume ~5-10% de energía de PC
- Costo de batería: ~$2-5 USD/mes vs $20-30 USD/mes de PC
- Más fácil de mantener
- IP residencial real
