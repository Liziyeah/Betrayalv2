# Betrayalv2

Implementacion web del juego de mentiras, alianzas y supervivencia para 3 a 6 jugadores.

## Stack actual

- Frontend: React + Vite
- Backend realtime: Node.js + Express + Socket.IO

## Ejecucion

1. Instala dependencias:

```bash
npm install
```

2. Levanta frontend + backend al mismo tiempo:

```bash
npm run dev:all
```

3. Si prefieres levantar por separado:

```bash
npm run server
npm run dev
```

## Puertos

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173` (por defecto Vite)

## Acceso desde otros dispositivos en la misma red (LAN)

1. Inicia el proyecto:

```bash
npm run dev:all
```

2. Identifica la IP local de tu PC (Windows):

```bash
ipconfig
```

Busca la IPv4 activa, por ejemplo `192.168.1.25`.

3. En otro dispositivo conectado a la misma red Wi-Fi/LAN, abre:

```text
http://TU_IP_LOCAL:5173
```

Ejemplo: `http://192.168.1.25:5173`

4. Si no carga, habilita reglas de Firewall de Windows para Node.js en red privada (puertos `5173` y `4000`).

### Configuracion opcional de API

Si quieres forzar manualmente la URL del backend:

```bash
set VITE_API_URL=http://TU_IP_LOCAL:4000
npm run dev
```

## Flujo soportado

- Registro de nombre
- Crear o unirse a partida por codigo
- Sala de espera (host inicia la partida)
- Mision y rol secreto
- Numero secreto por ronda (Adivino oculto)
- Desafio de ronda
- Seleccion de accion secreta y objetivo
- Resolucion de ronda, vidas y eliminaciones
- Condiciones de victoria por mision o supervivencia
