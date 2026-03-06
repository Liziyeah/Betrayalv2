import { customAlphabet, nanoid } from "nanoid";

const GAME_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const createGameCode = customAlphabet(GAME_CODE_ALPHABET, 6);

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;

const TARGETED_ACTIONS = new Set(["proteger", "traicionar", "investigar", "negociar"]);
const ACTIONS = ["proteger", "traicionar", "investigar", "negociar"];

const ROLE_DEFINITIONS = {
  adivino: {
    label: "Adivino",
    mission:
      "Descubre correctamente el numero secreto de al menos 2 jugadores (investigando) o sobrevive como ultimo jugador.",
  },
  angel: {
    label: "Angel",
    mission:
      "Protege exitosamente a jugadores al menos 2 veces y mantente con vida.",
  },
  traidor: {
    label: "Traidor",
    mission:
      "Elimina al menos 2 jugadores o llega al final entre los ultimos 2 con vida.",
  },
  investigador: {
    label: "Investigador",
    mission:
      "Revela informacion de al menos 3 jugadores durante la partida y sigue con vida.",
  },
  diplomatico: {
    label: "Diplomatico",
    mission:
      "Logra al menos 2 negociaciones exitosas y mantente con vida.",
  },
};

const AVAILABLE_ROLES = Object.keys(ROLE_DEFINITIONS);

const CHALLENGES = [
  {
    id: "odd_loses_1",
    text: "Los numeros IMPARES perderan 1 vida esta ronda.",
    matches: (number) => number % 2 !== 0,
  },
  {
    id: "even_loses_1",
    text: "Los numeros PARES perderan 1 vida esta ronda.",
    matches: (number) => number % 2 === 0,
  },
  {
    id: "low_loses_1",
    text: "Los numeros del 1 al 5 perderan 1 vida esta ronda.",
    matches: (number) => number <= 5,
  },
  {
    id: "high_loses_1",
    text: "Los numeros del 6 al 10 perderan 1 vida esta ronda.",
    matches: (number) => number >= 6,
  },
  {
    id: "prime_loses_1",
    text: "Los numeros PRIMOS perderan 1 vida esta ronda.",
    matches: (number) => [2, 3, 5, 7].includes(number),
  },
];

const games = new Map();

function throwError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function sanitizeName(value) {
  const name = String(value || "").trim().slice(0, 20);
  if (!name) {
    throwError("El nombre del jugador es obligatorio.");
  }
  return name;
}

function getAlivePlayers(game) {
  return game.playerOrder
    .map((playerId) => game.players.get(playerId))
    .filter((player) => player && player.alive);
}

function uniqueGameCode() {
  let attempts = 0;
  while (attempts < 25) {
    const gameCode = createGameCode();
    if (!games.has(gameCode)) {
      return gameCode;
    }
    attempts += 1;
  }
  throwError("No se pudo generar un codigo de partida. Intenta de nuevo.", 500);
}

function randomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createPlayer(name) {
  return {
    id: nanoid(10),
    name: sanitizeName(name),
    lives: 3,
    alive: true,
    role: null,
    roleLabel: null,
    mission: null,
    stats: {
      discoveries: 0,
      successfulProtects: 0,
      eliminations: 0,
      revealedInfos: 0,
      successfulNegotiations: 0,
    },
  };
}

function ensureGame(gameCode) {
  const game = games.get(String(gameCode || "").trim().toUpperCase());
  if (!game) {
    throwError("Partida no encontrada.", 404);
  }
  return game;
}

function ensurePlayer(game, playerId) {
  const player = game.players.get(playerId);
  if (!player) {
    throwError("Jugador no encontrado en esta partida.", 404);
  }
  return player;
}

function ensureHost(game, playerId) {
  if (game.hostPlayerId !== playerId) {
    throwError("Solo el host puede ejecutar esta accion.", 403);
  }
}

function ensureCanJoin(game) {
  if (game.phase !== "waiting") {
    throwError("La partida ya inicio. No se pueden unir mas jugadores.");
  }
  if (game.playerOrder.length >= MAX_PLAYERS) {
    throwError(`La partida admite maximo ${MAX_PLAYERS} jugadores.`);
  }
}

function assignRoles(game) {
  const roleDeck = [];
  while (roleDeck.length < game.playerOrder.length) {
    roleDeck.push(...shuffle(AVAILABLE_ROLES));
  }

  for (let i = 0; i < game.playerOrder.length; i += 1) {
    const playerId = game.playerOrder[i];
    const roleKey = roleDeck[i];
    const roleDefinition = ROLE_DEFINITIONS[roleKey];
    const player = game.players.get(playerId);
    player.role = roleKey;
    player.roleLabel = roleDefinition.label;
    player.mission = roleDefinition.mission;
  }
}

function pickChallenge(excludedChallengeId) {
  const pool = CHALLENGES.filter((challenge) => challenge.id !== excludedChallengeId);
  const candidates = pool.length > 0 ? pool : CHALLENGES;
  return candidates[randomIntInclusive(0, candidates.length - 1)];
}

function startRound(game) {
  const challenge = pickChallenge(game.currentRound?.challenge?.id);
  const numbers = new Map();
  const submissions = new Map();

  for (const player of getAlivePlayers(game)) {
    numbers.set(player.id, randomIntInclusive(1, 10));
    submissions.set(player.id, null);
  }

  game.round += 1;
  game.phase = "number";
  game.readyByPlayer.clear();
  game.currentRound = {
    id: `R${game.round}`,
    challenge,
    numbers,
    submissions,
    findingsByPlayer: new Map(),
    publicSummary: [],
    lifeChanges: [],
    eliminatedPlayerIds: [],
  };
}

function allAlivePlayersReady(game) {
  const alivePlayers = getAlivePlayers(game);
  return alivePlayers.every((player) => game.readyByPlayer.has(player.id));
}

function clearReady(game) {
  game.readyByPlayer.clear();
}

function buildActionReveal(game) {
  if (!game.currentRound) {
    return [];
  }

  const reveal = [];
  for (const player of getAlivePlayers(game)) {
    const submission = game.currentRound.submissions.get(player.id);
    if (!submission) {
      continue;
    }
    const target = submission.targetPlayerId
      ? game.players.get(submission.targetPlayerId)
      : null;
    reveal.push({
      playerId: player.id,
      playerName: player.name,
      actionType: submission.actionType,
      targetPlayerId: target?.id ?? null,
      targetPlayerName: target?.name ?? null,
    });
  }
  return reveal;
}

function evaluateMissionWinner(game) {
  const alivePlayers = getAlivePlayers(game);
  const aliveCount = alivePlayers.length;

  for (const player of alivePlayers) {
    const { role, stats } = player;

    if (role === "adivino" && stats.discoveries >= 2) {
      return {
        playerId: player.id,
        playerName: player.name,
        reason: "mision",
        detail: "Adivino descubrio al menos 2 numeros secretos.",
      };
    }

    if (role === "angel" && stats.successfulProtects >= 2) {
      return {
        playerId: player.id,
        playerName: player.name,
        reason: "mision",
        detail: "Angel logro al menos 2 protecciones exitosas.",
      };
    }

    if (role === "traidor" && (stats.eliminations >= 2 || aliveCount <= 2)) {
      return {
        playerId: player.id,
        playerName: player.name,
        reason: "mision",
        detail:
          stats.eliminations >= 2
            ? "Traidor elimino al menos 2 jugadores."
            : "Traidor quedo entre los ultimos 2 con vida.",
      };
    }

    if (role === "investigador" && stats.revealedInfos >= 3) {
      return {
        playerId: player.id,
        playerName: player.name,
        reason: "mision",
        detail: "Investigador revelo informacion de al menos 3 jugadores.",
      };
    }

    if (role === "diplomatico" && stats.successfulNegotiations >= 2) {
      return {
        playerId: player.id,
        playerName: player.name,
        reason: "mision",
        detail: "Diplomatico logro al menos 2 negociaciones exitosas.",
      };
    }
  }

  return null;
}

function evaluateSurvivalWinner(game) {
  const alivePlayers = getAlivePlayers(game);
  if (alivePlayers.length === 1) {
    const winner = alivePlayers[0];
    return {
      playerId: winner.id,
      playerName: winner.name,
      reason: "supervivencia",
      detail: "Es el ultimo jugador con vida.",
    };
  }
  return null;
}

function registerFinding(game, playerId, finding) {
  if (!game.currentRound.findingsByPlayer.has(playerId)) {
    game.currentRound.findingsByPlayer.set(playerId, []);
  }
  game.currentRound.findingsByPlayer.get(playerId).push(finding);
}

function resolveRound(game) {
  const currentRound = game.currentRound;
  if (!currentRound) {
    throwError("No hay ronda activa para resolver.", 400);
  }

  const alivePlayers = getAlivePlayers(game);
  const damageByPlayer = new Map();
  const healingByPlayer = new Map();
  const protectorsByTarget = new Map();
  const betrayersByTarget = new Map();
  const negotiationPairs = new Set();

  for (const player of alivePlayers) {
    damageByPlayer.set(player.id, 0);
    healingByPlayer.set(player.id, 0);
  }

  for (const player of alivePlayers) {
    const playerNumber = currentRound.numbers.get(player.id);
    if (currentRound.challenge.matches(playerNumber)) {
      damageByPlayer.set(player.id, damageByPlayer.get(player.id) + 1);
    }
  }

  for (const player of alivePlayers) {
    const submission = currentRound.submissions.get(player.id);
    if (!submission) {
      continue;
    }

    if (submission.actionType === "proteger" && submission.targetPlayerId) {
      if (!protectorsByTarget.has(submission.targetPlayerId)) {
        protectorsByTarget.set(submission.targetPlayerId, []);
      }
      protectorsByTarget.get(submission.targetPlayerId).push(player.id);
      healingByPlayer.set(player.id, healingByPlayer.get(player.id) + 1);
    }

    if (submission.actionType === "traicionar" && submission.targetPlayerId) {
      const attackPower = player.role === "traidor" ? 2 : 1;
      damageByPlayer.set(
        submission.targetPlayerId,
        (damageByPlayer.get(submission.targetPlayerId) || 0) + attackPower,
      );
      if (!betrayersByTarget.has(submission.targetPlayerId)) {
        betrayersByTarget.set(submission.targetPlayerId, []);
      }
      betrayersByTarget.get(submission.targetPlayerId).push(player.id);
    }

    if (submission.actionType === "investigar" && submission.targetPlayerId) {
      const target = game.players.get(submission.targetPlayerId);
      const targetSubmission = currentRound.submissions.get(submission.targetPlayerId);
      registerFinding(game, player.id, {
        targetPlayerId: target.id,
        targetPlayerName: target.name,
        targetNumber: currentRound.numbers.get(target.id),
        targetAction: targetSubmission?.actionType || "sin_accion",
      });

      if (player.role === "adivino") {
        player.stats.discoveries += 1;
      }
      if (player.role === "investigador") {
        player.stats.revealedInfos += 1;
      }
    }

    if (submission.actionType === "negociar" && submission.targetPlayerId) {
      const counterpart = currentRound.submissions.get(submission.targetPlayerId);
      if (
        counterpart &&
        counterpart.actionType === "negociar" &&
        counterpart.targetPlayerId === player.id
      ) {
        const pairKey = [player.id, submission.targetPlayerId].sort().join(":");
        if (!negotiationPairs.has(pairKey)) {
          negotiationPairs.add(pairKey);
          const participantA = game.players.get(player.id);
          const participantB = game.players.get(submission.targetPlayerId);
          healingByPlayer.set(participantA.id, healingByPlayer.get(participantA.id) + 1);
          healingByPlayer.set(participantB.id, healingByPlayer.get(participantB.id) + 1);

          if (participantA.role === "diplomatico" || participantB.role === "diplomatico") {
            healingByPlayer.set(participantA.id, healingByPlayer.get(participantA.id) + 1);
            healingByPlayer.set(participantB.id, healingByPlayer.get(participantB.id) + 1);
          }

          participantA.stats.successfulNegotiations += 1;
          participantB.stats.successfulNegotiations += 1;
        }
      }
    }
  }

  for (const [targetPlayerId, protectorIds] of protectorsByTarget.entries()) {
    const preventedDamage = damageByPlayer.get(targetPlayerId) || 0;
    if (preventedDamage > 0) {
      for (const protectorId of protectorIds) {
        const protector = game.players.get(protectorId);
        protector.stats.successfulProtects += 1;
      }
      damageByPlayer.set(targetPlayerId, 0);
    }
  }

  const eliminatedPlayerIds = [];
  const lifeChanges = [];

  for (const player of alivePlayers) {
    const before = player.lives;
    const gained = healingByPlayer.get(player.id) || 0;
    const lost = damageByPlayer.get(player.id) || 0;
    player.lives = player.lives + gained - lost;
    if (player.lives <= 0) {
      player.lives = 0;
      player.alive = false;
      eliminatedPlayerIds.push(player.id);
    }

    lifeChanges.push({
      playerId: player.id,
      playerName: player.name,
      before,
      after: player.lives,
      gained,
      lost,
      delta: player.lives - before,
      eliminated: !player.alive,
    });
  }

  for (const eliminatedPlayerId of eliminatedPlayerIds) {
    const betrayers = betrayersByTarget.get(eliminatedPlayerId) || [];
    for (const betrayerId of betrayers) {
      const betrayer = game.players.get(betrayerId);
      if (betrayer) {
        betrayer.stats.eliminations += 1;
      }
    }
  }

  currentRound.eliminatedPlayerIds = eliminatedPlayerIds;
  currentRound.lifeChanges = lifeChanges;
  currentRound.publicSummary = buildActionReveal(game);

  const missionWinner = evaluateMissionWinner(game);
  const survivalWinner = evaluateSurvivalWinner(game);
  game.winner = missionWinner || survivalWinner || null;
  if (game.winner) {
    game.status = "finished";
  }

  game.lastResolution = {
    roundId: currentRound.id,
    challengeText: currentRound.challenge.text,
    actionReveal: currentRound.publicSummary,
    lifeChanges: currentRound.lifeChanges,
    eliminatedPlayerIds: currentRound.eliminatedPlayerIds,
    findingsByPlayer: currentRound.findingsByPlayer,
  };

  game.phase = "results";
  clearReady(game);
}

function validateTarget(game, actorPlayerId, targetPlayerId) {
  if (!targetPlayerId) {
    throwError("Debes seleccionar un jugador objetivo.");
  }
  if (targetPlayerId === actorPlayerId) {
    throwError("No puedes seleccionarte a ti mismo.");
  }
  const targetPlayer = game.players.get(targetPlayerId);
  if (!targetPlayer || !targetPlayer.alive) {
    throwError("El jugador objetivo no esta disponible.");
  }
}

function createGame(hostName) {
  const hostPlayer = createPlayer(hostName);
  const gameCode = uniqueGameCode();

  const game = {
    code: gameCode,
    createdAt: new Date().toISOString(),
    status: "waiting",
    phase: "waiting",
    round: 0,
    hostPlayerId: hostPlayer.id,
    playerOrder: [hostPlayer.id],
    players: new Map([[hostPlayer.id, hostPlayer]]),
    readyByPlayer: new Set(),
    currentRound: null,
    lastResolution: null,
    winner: null,
  };

  games.set(game.code, game);
  return { game, player: hostPlayer };
}

function joinGame(gameCode, playerName) {
  const game = ensureGame(gameCode);
  ensureCanJoin(game);
  const player = createPlayer(playerName);
  game.players.set(player.id, player);
  game.playerOrder.push(player.id);
  return { game, player };
}

function startGame(gameCode, playerId) {
  const game = ensureGame(gameCode);
  ensureHost(game, playerId);
  if (game.phase !== "waiting") {
    throwError("La partida ya fue iniciada.");
  }
  if (game.playerOrder.length < MIN_PLAYERS) {
    throwError(`Se requieren al menos ${MIN_PLAYERS} jugadores para iniciar.`);
  }
  if (game.playerOrder.length > MAX_PLAYERS) {
    throwError(`La partida solo permite ${MAX_PLAYERS} jugadores.`);
  }

  assignRoles(game);
  game.phase = "mission";
  game.status = "in_progress";
  clearReady(game);

  return game;
}

function markReady(gameCode, playerId) {
  const game = ensureGame(gameCode);
  const player = ensurePlayer(game, playerId);
  if (!player.alive && game.phase !== "results") {
    return game;
  }

  if (!["mission", "number", "challenge", "results"].includes(game.phase)) {
    throwError("No es una fase de confirmacion.");
  }

  game.readyByPlayer.add(player.id);
  if (!allAlivePlayersReady(game)) {
    return game;
  }

  if (game.phase === "mission") {
    startRound(game);
    return game;
  }

  if (game.phase === "number") {
    game.phase = "challenge";
    clearReady(game);
    return game;
  }

  if (game.phase === "challenge") {
    game.phase = "action";
    clearReady(game);
    return game;
  }

  if (game.phase === "results") {
    if (game.winner) {
      game.phase = "finished";
      return game;
    }
    startRound(game);
    return game;
  }

  return game;
}

function submitAction(gameCode, payload) {
  const game = ensureGame(gameCode);
  if (game.phase !== "action") {
    throwError("No es fase de acciones.");
  }
  const { playerId, actionType, targetPlayerId = null } = payload || {};
  const player = ensurePlayer(game, playerId);
  if (!player.alive) {
    throwError("Los jugadores eliminados no pueden actuar.");
  }
  if (!ACTIONS.includes(actionType)) {
    throwError("Accion invalida.");
  }
  if (!game.currentRound) {
    throwError("No hay ronda activa.");
  }

  if (TARGETED_ACTIONS.has(actionType)) {
    validateTarget(game, player.id, targetPlayerId);
  }

  game.currentRound.submissions.set(player.id, {
    actionType,
    targetPlayerId: TARGETED_ACTIONS.has(actionType) ? targetPlayerId : null,
    submittedAt: new Date().toISOString(),
  });

  const allSubmitted = getAlivePlayers(game).every((alivePlayer) =>
    Boolean(game.currentRound.submissions.get(alivePlayer.id)),
  );

  if (allSubmitted) {
    resolveRound(game);
  }

  return game;
}

function getSecretNumberForPlayer(game, player) {
  if (!game.currentRound || !player.alive) {
    return { number: null, hidden: false };
  }

  const assignedNumber = game.currentRound.numbers.get(player.id);
  if (player.role === "adivino" && ["number", "challenge", "action"].includes(game.phase)) {
    return { number: null, hidden: true };
  }

  return { number: assignedNumber, hidden: false };
}

function getPendingPlayers(game) {
  if (["mission", "number", "challenge", "results"].includes(game.phase)) {
    return getAlivePlayers(game)
      .filter((player) => !game.readyByPlayer.has(player.id))
      .map((player) => ({ playerId: player.id, playerName: player.name }));
  }

  if (game.phase === "action" && game.currentRound) {
    return getAlivePlayers(game)
      .filter((player) => !game.currentRound.submissions.get(player.id))
      .map((player) => ({ playerId: player.id, playerName: player.name }));
  }

  return [];
}

export function getSnapshot(gameCode, playerId) {
  const game = ensureGame(gameCode);
  const me = playerId ? ensurePlayer(game, playerId) : null;
  const secretNumber = me ? getSecretNumberForPlayer(game, me) : { number: null, hidden: false };

  return {
    gameCode: game.code,
    status: game.status,
    phase: game.phase,
    round: game.round,
    hostPlayerId: game.hostPlayerId,
    players: game.playerOrder.map((id) => {
      const player = game.players.get(id);
      return {
        playerId: player.id,
        playerName: player.name,
        lives: player.lives,
        alive: player.alive,
        isHost: player.id === game.hostPlayerId,
      };
    }),
    canStart:
      me &&
      me.id === game.hostPlayerId &&
      game.phase === "waiting" &&
      game.playerOrder.length >= MIN_PLAYERS,
    me: me
      ? {
          playerId: me.id,
          playerName: me.name,
          lives: me.lives,
          alive: me.alive,
          role: me.role,
          roleLabel: me.roleLabel,
          mission: me.mission,
          stats: me.stats,
          secretNumber: secretNumber.number,
          numberHidden: secretNumber.hidden,
        }
      : null,
    challenge: game.currentRound
      ? {
          challengeId: game.currentRound.challenge.id,
          text: game.currentRound.challenge.text,
        }
      : null,
    pendingPlayers: getPendingPlayers(game),
    availableActions: ACTIONS,
    availableTargets: me
      ? getAlivePlayers(game)
          .filter((player) => player.id !== me.id)
          .map((player) => ({
            playerId: player.id,
            playerName: player.name,
            lives: player.lives,
          }))
      : [],
    mySubmittedAction:
      game.currentRound && me ? game.currentRound.submissions.get(me.id) : null,
    lastResolution: game.lastResolution
      ? {
          roundId: game.lastResolution.roundId,
          challengeText: game.lastResolution.challengeText,
          actionReveal: game.lastResolution.actionReveal,
          lifeChanges: game.lastResolution.lifeChanges,
          eliminatedPlayerIds: game.lastResolution.eliminatedPlayerIds,
          privateFindings: me
            ? game.lastResolution.findingsByPlayer.get(me.id) || []
            : [],
        }
      : null,
    winner: game.winner,
    config: {
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      targetedActions: Array.from(TARGETED_ACTIONS),
    },
  };
}

export function getPublicState(gameCode) {
  const game = ensureGame(gameCode);
  return {
    gameCode: game.code,
    status: game.status,
    phase: game.phase,
    round: game.round,
    players: game.playerOrder.map((id) => {
      const player = game.players.get(id);
      return {
        playerId: player.id,
        playerName: player.name,
        lives: player.lives,
        alive: player.alive,
      };
    }),
    pendingPlayers: getPendingPlayers(game),
    winner: game.winner,
  };
}

export function getGame(gameCode) {
  return ensureGame(gameCode);
}

export function createGameSession(hostName) {
  return createGame(hostName);
}

export function joinGameSession(gameCode, playerName) {
  return joinGame(gameCode, playerName);
}

export function startGameSession(gameCode, playerId) {
  return startGame(gameCode, playerId);
}

export function readyPlayer(gameCode, playerId) {
  return markReady(gameCode, playerId);
}

export function submitPlayerAction(gameCode, payload) {
  return submitAction(gameCode, payload);
}

export function serializeError(error) {
  return {
    message: error?.message || "Error inesperado",
    statusCode: error?.statusCode || 500,
  };
}
