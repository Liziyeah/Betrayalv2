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
