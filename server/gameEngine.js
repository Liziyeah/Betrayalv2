import { customAlphabet, nanoid } from "nanoid";

const GAME_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const createGameCode = customAlphabet(GAME_CODE_ALPHABET, 6);

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;
const INITIAL_LIVES = 3;
const MAX_LIVES = 4;
const MAX_DAMAGE_PER_ROUND = 2;

const ACTIONS = ["proteger", "traicionar", "investigar", "negociar", "acusar"];
const TARGETED_ACTIONS = new Set(["proteger", "traicionar", "investigar", "negociar", "acusar"]);

const ROLE_DEFINITIONS = {
  adivino: { label: "Adivino", mission: "Acierta 2 numeros usando la accion Acusar." },
  angel: { label: "Angel", mission: "Logra 2 protecciones exitosas y sigue con vida." },
  traidor: { label: "Traidor", mission: "Causa 2 eliminaciones." },
  investigador: { label: "Investigador", mission: "Investiga a 3 jugadores distintos." },
  diplomatico: { label: "Diplomatico", mission: "Logra 2 negociaciones exitosas." },
  caotico: { label: "Caotico", mission: "Cambia el desafio en 2 rondas y sigue con vida." },
};

const AVAILABLE_ROLES = Object.keys(ROLE_DEFINITIONS);

const CHALLENGES = [
  { id: "odd_loses_1", text: "Los numeros IMPARES pierden vida esta ronda.", matches: (n) => n % 2 !== 0 },
  { id: "even_loses_1", text: "Los numeros PARES pierden vida esta ronda.", matches: (n) => n % 2 === 0 },
  { id: "low_loses_1", text: "Los numeros del 1 al 5 pierden vida esta ronda.", matches: (n) => n <= 5 },
  { id: "high_loses_1", text: "Los numeros del 6 al 10 pierden vida esta ronda.", matches: (n) => n >= 6 },
  { id: "prime_loses_1", text: "Los numeros PRIMOS pierden vida esta ronda.", matches: (n) => [2, 3, 5, 7].includes(n) },
];

const ROUND_EVENTS = [
  {
    id: "intercambio",
    title: "Intercambio",
    text: "Pasen su carta fisica al jugador de la izquierda. (Evento fisico, sin efecto en app).",
  },
  { id: "silencio", title: "Silencio", text: "Solo 2 jugadores pueden hablar durante la negociacion." },
  {
    id: "doble_riesgo",
    title: "Doble Riesgo",
    text: "Desafio y traiciones base de 1 dano ahora hacen 2 dano.",
  },
  { id: "confianza", title: "Confianza", text: "Toda negociacion exitosa da 2 vidas en vez de 1." },
];

const games = new Map();

function throwError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function sanitizeName(value) {
  const name = String(value || "").trim().slice(0, 20);
  if (!name) throwError("El nombre del jugador es obligatorio.");
  return name;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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

function getAlivePlayers(game) {
  return game.playerOrder.map((id) => game.players.get(id)).filter((p) => p && p.alive);
}

function uniqueGameCode() {
  let attempts = 0;
  while (attempts < 25) {
    const code = createGameCode();
    if (!games.has(code)) return code;
    attempts += 1;
  }
  throwError("No se pudo generar un codigo de partida. Intenta de nuevo.", 500);
}

function createPlayer(name) {
  return {
    id: nanoid(10),
    name: sanitizeName(name),
    lives: INITIAL_LIVES,
    alive: true,
    role: null,
    roleLabel: null,
    mission: null,
    stats: {
      accusationHits: 0,
      successfulProtects: 0,
      eliminations: 0,
      successfulNegotiations: 0,
      investigationsPerformed: 0,
      betrayalsPerformed: 0,
      chaosChallengeChanges: 0,
      investigatedTargetIds: new Set(),
    },
  };
}

function ensureGame(gameCode) {
  const game = games.get(String(gameCode || "").trim().toUpperCase());
  if (!game) throwError("Partida no encontrada.", 404);
  return game;
}

function ensurePlayer(game, playerId) {
  const player = game.players.get(playerId);
  if (!player) throwError("Jugador no encontrado en esta partida.", 404);
  return player;
}

function ensureHost(game, playerId) {
  if (game.hostPlayerId !== playerId) throwError("Solo el host puede ejecutar esta accion.", 403);
}

function ensureCanJoin(game) {
  if (game.phase !== "waiting") throwError("La partida ya inicio. No se pueden unir mas jugadores.");
  if (game.playerOrder.length >= MAX_PLAYERS) throwError(`La partida admite maximo ${MAX_PLAYERS} jugadores.`);
}

function assignRoles(game) {
  const deck = [];
  while (deck.length < game.playerOrder.length) deck.push(...shuffle(AVAILABLE_ROLES));
  for (let i = 0; i < game.playerOrder.length; i += 1) {
    const player = game.players.get(game.playerOrder[i]);
    const role = deck[i];
    player.role = role;
    player.roleLabel = ROLE_DEFINITIONS[role].label;
    player.mission = ROLE_DEFINITIONS[role].mission;
  }
}

function pickChallenge(excludedId) {
  const pool = CHALLENGES.filter((challenge) => challenge.id !== excludedId);
  const candidates = pool.length > 0 ? pool : CHALLENGES;
  return candidates[randomIntInclusive(0, candidates.length - 1)];
}

function pickRoundEvent() {
  if (Math.random() >= 0.2) return null;
  return ROUND_EVENTS[randomIntInclusive(0, ROUND_EVENTS.length - 1)];
}

function startRound(game) {
  const challenge = pickChallenge(game.currentRound?.challenge?.id);
  const roundEvent = pickRoundEvent();
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
    roundEvent,
    numbers,
    submissions,
    findingsByPlayer: new Map(),
    publicSummary: [],
    lifeChanges: [],
    eliminatedPlayerIds: [],
    resolutionLog: [],
    accusationResults: [],
    canceledDamages: [],
  };
}

function allAlivePlayersReady(game) {
  const alivePlayers = getAlivePlayers(game);
  return alivePlayers.every((player) => game.readyByPlayer.has(player.id));
}

function clearReady(game) {
  game.readyByPlayer.clear();
}

function registerFinding(currentRound, playerId, finding) {
  if (!currentRound.findingsByPlayer.has(playerId)) currentRound.findingsByPlayer.set(playerId, []);
  currentRound.findingsByPlayer.get(playerId).push(finding);
}

function addDamageSource(damageSourcesByPlayer, targetPlayerId, source) {
  if (!damageSourcesByPlayer.has(targetPlayerId)) damageSourcesByPlayer.set(targetPlayerId, []);
  damageSourcesByPlayer.get(targetPlayerId).push(source);
}
function buildActionReveal(game) {
  if (!game.currentRound) return [];

  const reveal = [];
  for (const player of getAlivePlayers(game)) {
    const submission = game.currentRound.submissions.get(player.id);
    if (!submission) continue;
    const target = submission.targetPlayerId ? game.players.get(submission.targetPlayerId) : null;
    reveal.push({
      playerId: player.id,
      playerName: player.name,
      actionType: submission.actionType,
      targetPlayerId: target?.id ?? null,
      targetPlayerName: target?.name ?? null,
      guessedNumber: submission.guessedNumber ?? null,
    });
  }

  return reveal;
}

function evaluateMissionWinner(game) {
  for (const playerId of game.playerOrder) {
    const player = game.players.get(playerId);
    if (!player) continue;
    const { role, stats } = player;

    if (role === "adivino" && stats.accusationHits >= 2) {
      return { playerId: player.id, playerName: player.name, reason: "mision", detail: "Adivino acerto 2 numeros con Acusar." };
    }
    if (role === "angel" && player.alive && stats.successfulProtects >= 2) {
      return { playerId: player.id, playerName: player.name, reason: "mision", detail: "Angel logro 2 protecciones exitosas y sobrevivio." };
    }
    if (role === "traidor" && stats.eliminations >= 2) {
      return { playerId: player.id, playerName: player.name, reason: "mision", detail: "Traidor logro 2 eliminaciones." };
    }
    if (role === "investigador" && stats.investigatedTargetIds.size >= 3) {
      return { playerId: player.id, playerName: player.name, reason: "mision", detail: "Investigador estudio 3 jugadores distintos." };
    }
    if (role === "diplomatico" && stats.successfulNegotiations >= 2) {
      return { playerId: player.id, playerName: player.name, reason: "mision", detail: "Diplomatico logro 2 negociaciones exitosas." };
    }
    if (role === "caotico" && player.alive && stats.chaosChallengeChanges >= 2) {
      return { playerId: player.id, playerName: player.name, reason: "mision", detail: "Caotico altero 2 rondas y sobrevivio." };
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

function topAward(players, title, metric) {
  let maxValue = -1;
  for (const player of players) maxValue = Math.max(maxValue, metric(player));

  if (maxValue <= 0) {
    return { title, playerNames: ["Sin datos"], value: 0 };
  }

  return {
    title,
    playerNames: players.filter((player) => metric(player) === maxValue).map((player) => player.name),
    value: maxValue,
  };
}

function buildFinalAwards(game) {
  const players = game.playerOrder.map((id) => game.players.get(id)).filter(Boolean);
  const alivePlayers = players.filter((player) => player.alive);

  return [
    topAward(players, "mas traiciones", (player) => player.stats.betrayalsPerformed),
    topAward(players, "mas protecciones", (player) => player.stats.successfulProtects),
    topAward(players, "mas negociaciones", (player) => player.stats.successfulNegotiations),
    topAward(players, "mas investigaciones", (player) => player.stats.investigationsPerformed),
    {
      title: "ultimo sobreviviente",
      playerNames: alivePlayers.length > 0 ? alivePlayers.map((player) => player.name) : [game.winner?.playerName || "Nadie"],
      value: alivePlayers.length > 0 ? 1 : 0,
    },
  ];
}

function resolveRound(game) {
  const currentRound = game.currentRound;
  if (!currentRound) throwError("No hay ronda activa para resolver.");

  const alivePlayers = getAlivePlayers(game);
  const protectedByTarget = new Map();
  const healingByPlayer = new Map();
  const damageSourcesByPlayer = new Map();
  const resolutionLog = [];
  const accusationResults = [];

  for (const player of alivePlayers) {
    healingByPlayer.set(player.id, 0);
    damageSourcesByPlayer.set(player.id, []);
  }

  // 1. Caotico cambia desafio
  const livingChaotics = alivePlayers.filter((player) => player.role === "caotico");
  if (livingChaotics.length > 0) {
    const caotico = livingChaotics[0];
    const oldChallenge = currentRound.challenge;
    const newChallenge = pickChallenge(oldChallenge.id);
    currentRound.challenge = newChallenge;
    if (newChallenge.id !== oldChallenge.id) {
      caotico.stats.chaosChallengeChanges += 1;
      resolutionLog.push(`Caotico ${caotico.name} cambio el desafio.`);
    } else {
      resolutionLog.push(`Caotico ${caotico.name} intento cambiar el desafio.`);
    }
  } else {
    resolutionLog.push("No hubo Caotico vivo para cambiar el desafio.");
  }

  // 2. Investigar + Acusar
  for (const player of alivePlayers) {
    const submission = currentRound.submissions.get(player.id);
    if (!submission) continue;

    if (submission.actionType === "investigar" && submission.targetPlayerId) {
      const target = game.players.get(submission.targetPlayerId);
      if (!target) continue;
      const targetSubmission = currentRound.submissions.get(target.id);

      registerFinding(currentRound, player.id, {
        targetPlayerId: target.id,
        targetPlayerName: target.name,
        targetNumber: currentRound.numbers.get(target.id),
        targetAction: targetSubmission?.actionType || "sin_accion",
      });

      player.stats.investigationsPerformed += 1;
      player.stats.investigatedTargetIds.add(target.id);
      resolutionLog.push(`${player.name} investigo a ${target.name}.`);
    }

    if (submission.actionType === "acusar" && submission.targetPlayerId) {
      const target = game.players.get(submission.targetPlayerId);
      if (!target) continue;
      const targetNumber = currentRound.numbers.get(target.id);
      const hit = Number(submission.guessedNumber) === targetNumber;

      accusationResults.push({
        playerId: player.id,
        playerName: player.name,
        targetPlayerId: target.id,
        targetPlayerName: target.name,
        guessedNumber: submission.guessedNumber,
        actualNumber: targetNumber,
        hit,
      });

      if (hit) {
        if (player.role === "adivino") {
          player.stats.accusationHits += 1;
        } else {
          healingByPlayer.set(player.id, healingByPlayer.get(player.id) + 1);
        }
      }

      resolutionLog.push(`${player.name} acuso a ${target.name}: ${hit ? "ACERTO" : "FALLO"}.`);
    }
  }

  // 3. Proteger
  for (const player of alivePlayers) {
    const submission = currentRound.submissions.get(player.id);
    if (!submission || submission.actionType !== "proteger" || !submission.targetPlayerId) continue;

    if (!protectedByTarget.has(submission.targetPlayerId)) protectedByTarget.set(submission.targetPlayerId, []);
    protectedByTarget.get(submission.targetPlayerId).push(player.id);
    resolutionLog.push(`${player.name} protegio a ${game.players.get(submission.targetPlayerId)?.name}.`);
  }

  // 4. Negociar
  const negotiationPairs = new Set();
  for (const player of alivePlayers) {
    const submission = currentRound.submissions.get(player.id);
    if (!submission || submission.actionType !== "negociar" || !submission.targetPlayerId) continue;

    const counterpart = currentRound.submissions.get(submission.targetPlayerId);
    if (!counterpart || counterpart.actionType !== "negociar" || counterpart.targetPlayerId !== player.id) continue;

    const pairKey = [player.id, submission.targetPlayerId].sort().join(":");
    if (negotiationPairs.has(pairKey)) continue;
    negotiationPairs.add(pairKey);

    const participantA = game.players.get(player.id);
    const participantB = game.players.get(submission.targetPlayerId);
    if (!participantA || !participantB) continue;

    let healAmount = currentRound.roundEvent?.id === "confianza" ? 2 : 1;
    if (participantA.role === "diplomatico" || participantB.role === "diplomatico") {
      healAmount = Math.max(healAmount, 2);
    }

    healingByPlayer.set(participantA.id, healingByPlayer.get(participantA.id) + healAmount);
    healingByPlayer.set(participantB.id, healingByPlayer.get(participantB.id) + healAmount);
    participantA.stats.successfulNegotiations += 1;
    participantB.stats.successfulNegotiations += 1;

    resolutionLog.push(`${participantA.name} y ${participantB.name} negociaron (+${healAmount}).`);
  }

  // 5. Traicionar
  for (const player of alivePlayers) {
    const submission = currentRound.submissions.get(player.id);
    if (!submission || submission.actionType !== "traicionar" || !submission.targetPlayerId) continue;

    player.stats.betrayalsPerformed += 1;
    let damage = 1;
    if (player.role === "traidor") damage = 2;
    else if (currentRound.roundEvent?.id === "doble_riesgo") damage = 2;

    addDamageSource(damageSourcesByPlayer, submission.targetPlayerId, {
      type: "traicion",
      amount: damage,
      sourcePlayerId: player.id,
      sourcePlayerName: player.name,
    });

    resolutionLog.push(`${player.name} traiciono a ${game.players.get(submission.targetPlayerId)?.name} (-${damage}).`);
  }

  // 6. Aplicar desafio
  const challengeDamage = currentRound.roundEvent?.id === "doble_riesgo" ? 2 : 1;
  for (const player of alivePlayers) {
    const number = currentRound.numbers.get(player.id);
    if (!currentRound.challenge.matches(number)) continue;

    addDamageSource(damageSourcesByPlayer, player.id, {
      type: "desafio",
      amount: challengeDamage,
      sourcePlayerId: null,
      sourcePlayerName: "desafio",
    });

    resolutionLog.push(`Desafio afecto a ${player.name} (-${challengeDamage}).`);
  }
  // 7. Actualizar vidas (proteccion + tope de dano)
  const eliminatedPlayerIds = [];
  const lifeChanges = [];
  const canceledDamages = [];
  const effectiveDamageSourcesByPlayer = new Map();

  for (const player of alivePlayers) {
    const before = player.lives;
    const queuedSources = [...(damageSourcesByPlayer.get(player.id) || [])];
    const protectors = protectedByTarget.get(player.id) || [];

    if (protectors.length > 0 && queuedSources.length > 0) {
      const canceled = queuedSources.shift();
      canceledDamages.push({
        targetPlayerId: player.id,
        targetPlayerName: player.name,
        canceledType: canceled.type,
        canceledAmount: canceled.amount,
      });

      for (const protectorId of protectors) {
        const protector = game.players.get(protectorId);
        if (!protector) continue;
        protector.stats.successfulProtects += 1;
        healingByPlayer.set(protector.id, healingByPlayer.get(protector.id) + 1);
      }

      resolutionLog.push(`${player.name} estaba PROTEGIDO: se cancelo su primer dano.`);
    }

    effectiveDamageSourcesByPlayer.set(player.id, queuedSources);

    const rawLoss = queuedSources.reduce((total, source) => total + source.amount, 0);
    const appliedLoss = Math.min(rawLoss, MAX_DAMAGE_PER_ROUND);
    const gained = healingByPlayer.get(player.id) || 0;

    player.lives = clamp(before + gained - appliedLoss, 0, MAX_LIVES);
    if (player.lives <= 0) {
      player.alive = false;
      eliminatedPlayerIds.push(player.id);
    }

    lifeChanges.push({
      playerId: player.id,
      playerName: player.name,
      before,
      after: player.lives,
      gained,
      rawLoss,
      lost: appliedLoss,
      delta: player.lives - before,
      eliminated: !player.alive,
    });
  }

  for (const eliminatedPlayerId of eliminatedPlayerIds) {
    const effectiveSources = effectiveDamageSourcesByPlayer.get(eliminatedPlayerId) || [];
    const betrayerIds = new Set(
      effectiveSources
        .filter((source) => source.type === "traicion" && source.sourcePlayerId)
        .map((source) => source.sourcePlayerId),
    );

    for (const betrayerId of betrayerIds) {
      const betrayer = game.players.get(betrayerId);
      if (betrayer) betrayer.stats.eliminations += 1;
    }
  }

  // 8. Revisar ganador
  const missionWinner = evaluateMissionWinner(game);
  const survivalWinner = evaluateSurvivalWinner(game);
  game.winner = missionWinner || survivalWinner || null;

  if (game.winner) {
    game.status = "finished";
    game.finalAwards = buildFinalAwards(game);
  }

  currentRound.eliminatedPlayerIds = eliminatedPlayerIds;
  currentRound.lifeChanges = lifeChanges;
  currentRound.publicSummary = buildActionReveal(game);
  currentRound.resolutionLog = resolutionLog;
  currentRound.accusationResults = accusationResults;
  currentRound.canceledDamages = canceledDamages;

  game.lastResolution = {
    roundId: currentRound.id,
    challengeText: currentRound.challenge.text,
    roundEvent: currentRound.roundEvent,
    actionReveal: currentRound.publicSummary,
    lifeChanges: currentRound.lifeChanges,
    eliminatedPlayerIds: currentRound.eliminatedPlayerIds,
    findingsByPlayer: currentRound.findingsByPlayer,
    resolutionLog: currentRound.resolutionLog,
    accusationResults: currentRound.accusationResults,
    canceledDamages: currentRound.canceledDamages,
  };

  game.phase = "results";
  clearReady(game);
}

function validateTarget(game, actorPlayerId, targetPlayerId) {
  if (!targetPlayerId) throwError("Debes seleccionar un jugador objetivo.");
  if (targetPlayerId === actorPlayerId) throwError("No puedes seleccionarte a ti mismo.");
  const target = game.players.get(targetPlayerId);
  if (!target || !target.alive) throwError("El jugador objetivo no esta disponible.");
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
    finalAwards: null,
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
  if (game.phase !== "waiting") throwError("La partida ya fue iniciada.");
  if (game.playerOrder.length < MIN_PLAYERS) throwError(`Se requieren al menos ${MIN_PLAYERS} jugadores para iniciar.`);
  if (game.playerOrder.length > MAX_PLAYERS) throwError(`La partida solo permite ${MAX_PLAYERS} jugadores.`);

  assignRoles(game);
  game.phase = "mission";
  game.status = "in_progress";
  game.finalAwards = null;
  clearReady(game);

  return game;
}

function markReady(gameCode, playerId) {
  const game = ensureGame(gameCode);
  const player = ensurePlayer(game, playerId);
  if (!player.alive && game.phase !== "results") return game;

  if (!["mission", "number", "challenge", "results"].includes(game.phase)) {
    throwError("No es una fase de confirmacion.");
  }

  game.readyByPlayer.add(player.id);
  if (!allAlivePlayersReady(game)) return game;

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
  if (game.phase !== "action") throwError("No es fase de acciones.");

  const { playerId, actionType, targetPlayerId = null, guessedNumber = null } = payload || {};
  const player = ensurePlayer(game, playerId);
  if (!player.alive) throwError("Los jugadores eliminados no pueden actuar.");
  if (!ACTIONS.includes(actionType)) throwError("Accion invalida.");
  if (!game.currentRound) throwError("No hay ronda activa.");

  if (TARGETED_ACTIONS.has(actionType)) validateTarget(game, player.id, targetPlayerId);

  if (actionType === "acusar") {
    const normalizedGuess = Number(guessedNumber);
    if (!Number.isInteger(normalizedGuess) || normalizedGuess < 1 || normalizedGuess > 10) {
      throwError("Debes indicar un numero entre 1 y 10 para Acusar.");
    }
  }

  game.currentRound.submissions.set(player.id, {
    actionType,
    targetPlayerId: TARGETED_ACTIONS.has(actionType) ? targetPlayerId : null,
    guessedNumber: actionType === "acusar" ? Number(guessedNumber) : null,
    submittedAt: new Date().toISOString(),
  });

  const allSubmitted = getAlivePlayers(game).every((alivePlayer) =>
    Boolean(game.currentRound.submissions.get(alivePlayer.id)),
  );

  if (allSubmitted) resolveRound(game);

  return game;
}

function getSecretNumberForPlayer(game, player) {
  if (!game.currentRound || !player.alive) return { number: null, hidden: false };

  const number = game.currentRound.numbers.get(player.id);
  if (player.role === "adivino" && ["number", "challenge", "action"].includes(game.phase)) {
    return { number: null, hidden: true };
  }

  return { number, hidden: false };
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

function serializeStats(player) {
  return {
    accusationHits: player.stats.accusationHits,
    successfulProtects: player.stats.successfulProtects,
    eliminations: player.stats.eliminations,
    successfulNegotiations: player.stats.successfulNegotiations,
    investigationsPerformed: player.stats.investigationsPerformed,
    betrayalsPerformed: player.stats.betrayalsPerformed,
    chaosChallengeChanges: player.stats.chaosChallengeChanges,
    investigatedDistinctCount: player.stats.investigatedTargetIds.size,
  };
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
    canStart: me && me.id === game.hostPlayerId && game.phase === "waiting" && game.playerOrder.length >= MIN_PLAYERS,
    me: me
      ? {
          playerId: me.id,
          playerName: me.name,
          lives: me.lives,
          alive: me.alive,
          role: me.role,
          roleLabel: me.roleLabel,
          mission: me.mission,
          stats: serializeStats(me),
          secretNumber: secretNumber.number,
          numberHidden: secretNumber.hidden,
        }
      : null,
    challenge: game.currentRound
      ? { challengeId: game.currentRound.challenge.id, text: game.currentRound.challenge.text }
      : null,
    roundEvent: game.currentRound?.roundEvent
      ? {
          id: game.currentRound.roundEvent.id,
          title: game.currentRound.roundEvent.title,
          text: game.currentRound.roundEvent.text,
        }
      : null,
    pendingPlayers: getPendingPlayers(game),
    availableActions: ACTIONS,
    availableTargets: me
      ? getAlivePlayers(game)
          .filter((player) => player.id !== me.id)
          .map((player) => ({ playerId: player.id, playerName: player.name, lives: player.lives }))
      : [],
    mySubmittedAction: game.currentRound && me ? game.currentRound.submissions.get(me.id) : null,
    lastResolution: game.lastResolution
      ? {
          roundId: game.lastResolution.roundId,
          challengeText: game.lastResolution.challengeText,
          roundEvent: game.lastResolution.roundEvent,
          actionReveal: game.lastResolution.actionReveal,
          lifeChanges: game.lastResolution.lifeChanges,
          eliminatedPlayerIds: game.lastResolution.eliminatedPlayerIds,
          privateFindings: me ? game.lastResolution.findingsByPlayer.get(me.id) || [] : [],
          resolutionLog: game.lastResolution.resolutionLog,
          accusationResults: game.lastResolution.accusationResults,
          canceledDamages: game.lastResolution.canceledDamages,
        }
      : null,
    winner: game.winner,
    finalAwards: game.finalAwards,
    config: {
      minPlayers: MIN_PLAYERS,
      maxPlayers: MAX_PLAYERS,
      initialLives: INITIAL_LIVES,
      maxLives: MAX_LIVES,
      maxDamagePerRound: MAX_DAMAGE_PER_ROUND,
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
      return { playerId: player.id, playerName: player.name, lives: player.lives, alive: player.alive };
    }),
    pendingPlayers: getPendingPlayers(game),
    winner: game.winner,
    finalAwards: game.finalAwards,
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
