import http from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import {
  createGameSession,
  getGame,
  getPublicState,
  getSnapshot,
  joinGameSession,
  readyPlayer,
  serializeError,
  startGameSession,
  submitPlayerAction,
} from "./gameEngine.js";

const PORT = Number(process.env.PORT || 4000);

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

function gameRoom(gameCode) {
  return `game:${gameCode}`;
}

function playerRoom(playerId) {
  return `player:${playerId}`;
}

function pushGameUpdate(gameCode) {
  const game = getGame(gameCode);
  io.to(gameRoom(game.code)).emit("game:public", getPublicState(game.code));
  for (const playerId of game.playerOrder) {
    io.to(playerRoom(playerId)).emit("game:update", getSnapshot(game.code, playerId));
  }
}

function handleRequest(handler) {
  return (req, res) => {
    try {
      handler(req, res);
    } catch (error) {
      const serialized = serializeError(error);
      res.status(serialized.statusCode).json({ error: serialized.message });
    }
  };
}

app.get(
  "/api/health",
  handleRequest((_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  }),
);

app.post(
  "/api/games",
  handleRequest((req, res) => {
    const { playerName } = req.body || {};
    const { game, player } = createGameSession(playerName);
    pushGameUpdate(game.code);
    res.status(201).json({
      gameCode: game.code,
      playerId: player.id,
      snapshot: getSnapshot(game.code, player.id),
    });
  }),
);

app.post(
  "/api/games/:gameCode/join",
  handleRequest((req, res) => {
    const { gameCode } = req.params;
    const { playerName } = req.body || {};
    const { game, player } = joinGameSession(gameCode, playerName);
    pushGameUpdate(game.code);
    res.status(201).json({
      gameCode: game.code,
      playerId: player.id,
      snapshot: getSnapshot(game.code, player.id),
    });
  }),
);

app.post(
  "/api/games/:gameCode/start",
  handleRequest((req, res) => {
    const { gameCode } = req.params;
    const { playerId } = req.body || {};
    const game = startGameSession(gameCode, playerId);
    pushGameUpdate(game.code);
    res.json({
      snapshot: getSnapshot(game.code, playerId),
    });
  }),
);

app.post(
  "/api/games/:gameCode/ready",
  handleRequest((req, res) => {
    const { gameCode } = req.params;
    const { playerId } = req.body || {};
    const game = readyPlayer(gameCode, playerId);
    pushGameUpdate(game.code);
    res.json({
      snapshot: getSnapshot(game.code, playerId),
    });
  }),
);

app.post(
  "/api/games/:gameCode/action",
  handleRequest((req, res) => {
    const { gameCode } = req.params;
    const game = submitPlayerAction(gameCode, req.body || {});
    pushGameUpdate(game.code);
    res.json({
      snapshot: getSnapshot(game.code, req.body?.playerId),
    });
  }),
);

app.get(
  "/api/games/:gameCode/state",
  handleRequest((req, res) => {
    const { gameCode } = req.params;
    const playerId = String(req.query.playerId || "");
    const snapshot = getSnapshot(gameCode, playerId);
    res.json({ snapshot });
  }),
);

io.on("connection", (socket) => {
  socket.on("game:subscribe", ({ gameCode, playerId }) => {
    try {
      const game = getGame(gameCode);
      socket.join(gameRoom(game.code));
      if (playerId) {
        socket.join(playerRoom(playerId));
        socket.emit("game:update", getSnapshot(game.code, playerId));
      } else {
        socket.emit("game:public", getPublicState(game.code));
      }
    } catch (error) {
      const serialized = serializeError(error);
      socket.emit("game:error", serialized);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Betrayal server listening on http://localhost:${PORT}`);
});
