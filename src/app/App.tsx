import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import PlayerRegistration from "./components/PlayerRegistration";
import SecretNumber from "./components/SecretNumber";
import ChallengePhase from "./components/ChallengePhase";
import ActionSelection, { type ActionType } from "./components/ActionSelection";
import PlayerSelection from "./components/PlayerSelection";

function resolveApiBase() {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const hostname = window.location.hostname || "localhost";
    return `${protocol}//${hostname}:4000`;
  }

  return "http://localhost:4000";
}

const API_BASE = resolveApiBase();
const SESSION_STORAGE_KEY = "betrayal-session-v1";
const PLAYER_NAME_STORAGE_KEY = "betrayal-player-name-v1";

type Phase = "waiting" | "mission" | "number" | "challenge" | "action" | "results" | "finished";

interface PlayerItem {
  playerId: string;
  playerName: string;
  lives: number;
  alive: boolean;
  isHost?: boolean;
}

interface PendingPlayer {
  playerId: string;
  playerName: string;
}

interface MeState {
  playerId: string;
  playerName: string;
  lives: number;
  alive: boolean;
  role: string | null;
  roleLabel: string | null;
  mission: string | null;
  secretNumber: number | null;
  numberHidden: boolean;
}

interface ResolutionAction {
  playerId: string;
  playerName: string;
  actionType: string;
  targetPlayerName: string | null;
}

interface ResolutionLifeChange {
  playerId: string;
  playerName: string;
  before: number;
  after: number;
  gained: number;
  lost: number;
  delta: number;
  eliminated: boolean;
}

interface ResolutionFinding {
  targetPlayerName: string;
  targetNumber: number;
  targetAction: string;
}

interface RoundEventInfo {
  id: string;
  title: string;
  text: string;
}

interface FinalAward {
  title: string;
  playerNames: string[];
  value: number;
}

interface GameSnapshot {
  gameCode: string;
  status: string;
  phase: Phase;
  round: number;
  hostPlayerId: string;
  players: PlayerItem[];
  canStart: boolean;
  me: MeState | null;
  challenge: { challengeId: string; text: string } | null;
  roundEvent: RoundEventInfo | null;
  pendingPlayers: PendingPlayer[];
  availableTargets: Array<{ playerId: string; playerName: string; lives: number }>;
  mySubmittedAction: {
    actionType: ActionType;
    targetPlayerId: string | null;
    guessedNumber?: number | null;
  } | null;
  lastResolution: {
    roundId: string;
    challengeText: string;
    roundEvent: RoundEventInfo | null;
    actionReveal: ResolutionAction[];
    lifeChanges: ResolutionLifeChange[];
    privateFindings: ResolutionFinding[];
    resolutionLog: string[];
    accusationResults: Array<{
      playerName: string;
      targetPlayerName: string;
      guessedNumber: number;
      actualNumber: number;
      hit: boolean;
    }>;
  } | null;
  winner: { playerId: string; playerName: string; reason: string; detail: string } | null;
  finalAwards: FinalAward[] | null;
  config: {
    targetedActions: ActionType[];
    minPlayers: number;
    maxPlayers: number;
    initialLives: number;
    maxLives: number;
    maxDamagePerRound: number;
  };
}

interface Session {
  gameCode: string;
  playerId: string;
}

function readStoredPlayerName() {
  return localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || "";
}

function readStoredSession(): Session | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Session;
    if (parsed.gameCode && parsed.playerId) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la solicitud.");
  }
  return data as T;
}

export default function App() {
  const [playerName, setPlayerName] = useState(readStoredPlayerName);
  const [session, setSession] = useState<Session | null>(readStoredSession);
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, playerName);
  }, [playerName]);

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSnapshot(null);
      return;
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    apiRequest<{ snapshot: GameSnapshot }>(
      `/api/games/${session.gameCode}/state?playerId=${session.playerId}`,
    )
      .then((response) => {
        if (!cancelled) {
          setSnapshot(response.snapshot);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setErrorMessage(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const socket = io(API_BASE, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("game:subscribe", {
        gameCode: session.gameCode,
        playerId: session.playerId,
      });
    });

    socket.on("game:update", (nextSnapshot: GameSnapshot) => {
      setSnapshot(nextSnapshot);
      setErrorMessage("");
    });

    socket.on("game:error", (payload: { message: string }) => {
      setErrorMessage(payload?.message || "Error de conexion en tiempo real.");
    });

    return () => {
      socket.disconnect();
    };
  }, [session?.gameCode, session?.playerId]);

  useEffect(() => {
    if (snapshot?.phase !== "action") {
      setSelectedAction(null);
    }
  }, [snapshot?.phase]);

  const needsTarget = useMemo(() => {
    const targeted = snapshot?.config.targetedActions || [];
    return (action: ActionType) => targeted.includes(action);
  }, [snapshot?.config.targetedActions]);

  const myPending = Boolean(
    snapshot &&
      session &&
      snapshot.pendingPlayers.some((pendingPlayer) => pendingPlayer.playerId === session.playerId),
  );

  async function createGame() {
    if (!playerName.trim()) return;
    setIsBusy(true);
    setErrorMessage("");
    try {
      const response = await apiRequest<{
        gameCode: string;
        playerId: string;
        snapshot: GameSnapshot;
      }>("/api/games", {
        method: "POST",
        body: JSON.stringify({ playerName }),
      });
      setSession({
        gameCode: response.gameCode,
        playerId: response.playerId,
      });
      setSnapshot(response.snapshot);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function joinGame() {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) return;
    setIsBusy(true);
    setErrorMessage("");
    try {
      const response = await apiRequest<{
        gameCode: string;
        playerId: string;
        snapshot: GameSnapshot;
      }>(`/api/games/${normalizedCode}/join`, {
        method: "POST",
        body: JSON.stringify({ playerName }),
      });

      setSession({
        gameCode: response.gameCode,
        playerId: response.playerId,
      });
      setSnapshot(response.snapshot);
      setShowJoinForm(false);
      setJoinCode("");
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function startGame() {
    if (!session) return;
    setIsBusy(true);
    setErrorMessage("");
    try {
      const response = await apiRequest<{ snapshot: GameSnapshot }>(
        `/api/games/${session.gameCode}/start`,
        {
          method: "POST",
          body: JSON.stringify({ playerId: session.playerId }),
        },
      );
      setSnapshot(response.snapshot);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function sendReady() {
    if (!session || !snapshot) return;
    if (!myPending) return;

    setIsBusy(true);
    setErrorMessage("");
    try {
      const response = await apiRequest<{ snapshot: GameSnapshot }>(
        `/api/games/${session.gameCode}/ready`,
        {
          method: "POST",
          body: JSON.stringify({ playerId: session.playerId }),
        },
      );
      setSnapshot(response.snapshot);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function submitAction(
    actionType: ActionType,
    targetPlayerId: string | null,
    guessedNumber?: number,
  ) {
    if (!session) return;
    setIsBusy(true);
    setErrorMessage("");
    try {
      const response = await apiRequest<{ snapshot: GameSnapshot }>(
        `/api/games/${session.gameCode}/action`,
        {
          method: "POST",
          body: JSON.stringify({
            playerId: session.playerId,
            actionType,
            targetPlayerId,
            guessedNumber: guessedNumber ?? null,
          }),
        },
      );
      setSnapshot(response.snapshot);
      setSelectedAction(null);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  function leaveSession() {
    setSession(null);
    setSnapshot(null);
    setJoinCode("");
    setShowJoinForm(false);
    setSelectedAction(null);
    setErrorMessage("");
  }

  function renderMenu() {
    return (
      <div className="relative size-full bg-gradient-to-b from-[#161519] to-[#af0e20] text-white">
        <div className="absolute inset-x-0 top-[34px] text-center px-3">
          <p className="text-[10px] font-bold tracking-wide">BETRAYAL</p>
          <p className="text-[6px] text-[#efe6e5] mt-1">Conectado como {playerName}</p>
        </div>

        <div className="absolute left-[10px] right-[10px] top-[115px] bg-[#f9eeee] rounded-[12px] p-[10px] text-[#473133]">
          <p className="text-[8px] font-bold">Selecciona una opcion</p>
          <p className="text-[5px] mt-1">Crea una nueva partida o unete con codigo.</p>

          <button
            type="button"
            onClick={createGame}
            disabled={isBusy}
            className="mt-4 w-full h-[24px] rounded-full bg-[#473133] text-[#f9eeee] text-[6px] font-bold disabled:opacity-60"
          >
            Crear partida
          </button>

          <button
            type="button"
            onClick={() => setShowJoinForm((value) => !value)}
            disabled={isBusy}
            className="mt-2 w-full h-[24px] rounded-full bg-[#af0e20] text-white text-[6px] font-bold disabled:opacity-60"
          >
            Unirse a partida
          </button>

          {showJoinForm && (
            <div className="mt-3">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.slice(0, 6))}
                placeholder="Codigo de 6 caracteres"
                className="w-full h-[22px] rounded-md border border-[#473133] bg-white px-2 text-[6px] uppercase"
              />
              <button
                type="button"
                onClick={joinGame}
                disabled={isBusy || joinCode.trim().length !== 6}
                className="mt-2 w-full h-[22px] rounded-full bg-[#161519] text-white text-[6px] font-bold disabled:opacity-60"
              >
                Confirmar union
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderWaitingRoom(currentSnapshot: GameSnapshot) {
    return (
      <div className="relative size-full bg-[#161519] text-[#f9eeee]">
        <div className="absolute inset-x-0 top-[18px] text-center">
          <p className="text-[9px] font-bold">Sala de espera</p>
          <p className="text-[6px] text-[#9b9b9b] mt-1">Codigo: {currentSnapshot.gameCode}</p>
        </div>

        <div className="absolute left-[10px] right-[10px] top-[64px] bottom-[66px] rounded-[10px] bg-[#232028] border border-[#3c3744] p-2 overflow-y-auto">
          {currentSnapshot.players.map((player) => (
            <div
              key={player.playerId}
              className="h-[20px] mb-1 rounded-[6px] bg-[#2f2a36] px-2 flex items-center justify-between text-[6px]"
            >
              <span className="truncate">{player.playerName}</span>
              <span className="text-[#9b9b9b]">{player.isHost ? "HOST" : "LISTO"}</span>
            </div>
          ))}
        </div>

        <div className="absolute left-[10px] right-[10px] bottom-[12px]">
          {currentSnapshot.canStart ? (
            <button
              type="button"
              onClick={startGame}
              disabled={isBusy}
              className="w-full h-[24px] rounded-full bg-[#af0e20] text-white text-[6px] font-bold disabled:opacity-60"
            >
              Empezar partida
            </button>
          ) : (
            <div className="text-[5px] text-center text-[#9b9b9b]">
              Esperando host o mas jugadores (minimo {currentSnapshot.config.minPlayers}).
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderMission(currentSnapshot: GameSnapshot) {
    return (
      <div className="relative size-full bg-[#161519] text-[#f9eeee]">
        <div className="absolute inset-x-0 top-[24px] text-center px-3">
          <p className="text-[10px] font-bold">Mision secreta</p>
          <p className="text-[6px] mt-1 text-[#9b9b9b]">Tu rol es:</p>
          <p className="text-[9px] font-bold text-[#af0e20] mt-1">
            {currentSnapshot.me?.roleLabel || "Sin rol"}
          </p>
        </div>

        <div className="absolute left-[10px] right-[10px] top-[95px] rounded-[10px] bg-[#232028] border border-[#3c3744] p-3">
          <p className="text-[6px] leading-[8px] text-[#efe6e5]">
            {currentSnapshot.me?.mission || "Mision no disponible."}
          </p>
        </div>

        <button
          type="button"
          onClick={sendReady}
          disabled={isBusy || !myPending}
          className={`absolute left-[10px] right-[10px] bottom-[14px] h-[24px] rounded-full text-[6px] font-bold ${
            myPending ? "bg-[#af0e20] text-white" : "bg-[#3a3a3a] text-[#d0d0d0]"
          }`}
        >
          {myPending ? "Continuar" : "Esperando a los demas..."}
        </button>
      </div>
    );
  }

  function renderResults(currentSnapshot: GameSnapshot) {
    const resolution = currentSnapshot.lastResolution;
    const winner = currentSnapshot.winner;
    const awards = currentSnapshot.finalAwards || [];

    return (
      <div className="relative size-full bg-[#161519] text-[#f9eeee]">
        <div className="absolute inset-x-0 top-[14px] text-center px-2">
          <p className="text-[9px] font-bold">Resultados de ronda</p>
          <p className="text-[5px] text-[#9b9b9b] mt-1">
            Ronda {currentSnapshot.round} - {resolution?.challengeText || "Sin desafio"}
          </p>
          {resolution?.roundEvent ? (
            <p className="text-[5px] text-[#d9c0c8] mt-[2px]">
              Evento: {resolution.roundEvent.title}
            </p>
          ) : null}
        </div>

        <div className="absolute left-[8px] right-[8px] top-[44px] bottom-[64px] rounded-[10px] bg-[#232028] border border-[#3c3744] p-2 overflow-y-auto">
          {resolution?.lifeChanges.map((change) => (
            <div
              key={change.playerId}
              className="mb-1 rounded-[6px] bg-[#2f2a36] p-[4px] text-[5px] leading-[7px]"
            >
              <div className="flex justify-between">
                <span className="truncate">{change.playerName}</span>
                <span>
                  {change.before} -&gt; {change.after}
                </span>
              </div>
              <div className="text-[#9b9b9b]">
                +{change.gained} / -{change.lost}
                {change.eliminated ? " (eliminado)" : ""}
              </div>
            </div>
          ))}

          {(resolution?.privateFindings || []).length > 0 && (
            <div className="mt-2 rounded-[6px] bg-[#1f1a24] p-1">
              <p className="text-[5px] font-bold text-[#af0e20]">Investigacion privada</p>
              {resolution?.privateFindings.map((finding, index) => (
                <p key={`${finding.targetPlayerName}-${index}`} className="text-[5px] leading-[7px]">
                  {finding.targetPlayerName}: numero {finding.targetNumber}, accion{" "}
                  {finding.targetAction}
                </p>
              ))}
            </div>
          )}

          {(resolution?.accusationResults || []).length > 0 && (
            <div className="mt-2 rounded-[6px] bg-[#1f1a24] p-1">
              <p className="text-[5px] font-bold text-[#af0e20]">Acusaciones</p>
              {resolution?.accusationResults.map((item, index) => (
                <p key={`${item.playerName}-${index}`} className="text-[5px] leading-[7px]">
                  {item.playerName} dijo {item.guessedNumber} a {item.targetPlayerName}:{" "}
                  {item.hit ? "ACIERTO" : "FALLO"}
                </p>
              ))}
            </div>
          )}

          {(resolution?.resolutionLog || []).length > 0 && (
            <div className="mt-2 rounded-[6px] bg-[#1f1a24] p-1">
              <p className="text-[5px] font-bold text-[#af0e20]">Orden de resolucion</p>
              {resolution?.resolutionLog.map((line, index) => (
                <p key={`log-${index}`} className="text-[5px] leading-[7px]">
                  {index + 1}. {line}
                </p>
              ))}
            </div>
          )}

          {currentSnapshot.phase === "finished" && awards.length > 0 && (
            <div className="mt-2 rounded-[6px] bg-[#1f1a24] p-1">
              <p className="text-[5px] font-bold text-[#af0e20]">Titulos finales</p>
              {awards.map((award) => (
                <p key={award.title} className="text-[5px] leading-[7px]">
                  {award.title}: {award.playerNames.join(", ")}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="absolute left-[8px] right-[8px] bottom-[10px]">
          {winner ? (
            <div className="mb-1 text-center text-[5px] text-[#efe6e5]">
              Ganador: <span className="text-[#af0e20] font-bold">{winner.playerName}</span> (
              {winner.detail})
            </div>
          ) : null}

          {currentSnapshot.phase === "results" ? (
            <button
              type="button"
              onClick={sendReady}
              disabled={isBusy || !myPending}
              className={`w-full h-[24px] rounded-full text-[6px] font-bold ${
                myPending ? "bg-[#af0e20] text-white" : "bg-[#3a3a3a] text-[#d0d0d0]"
              }`}
            >
              {myPending ? "Continuar" : "Esperando a los demas..."}
            </button>
          ) : (
            <button
              type="button"
              onClick={leaveSession}
              className="w-full h-[24px] rounded-full bg-[#af0e20] text-white text-[6px] font-bold"
            >
              Salir de la partida
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderGame() {
    if (!snapshot) {
      return (
        <div className="relative size-full bg-[#161519] text-[#f9eeee] flex items-center justify-center text-[6px]">
          Cargando estado de la partida...
        </div>
      );
    }

    if (snapshot.phase === "waiting") {
      return renderWaitingRoom(snapshot);
    }

    if (snapshot.phase === "mission") {
      return renderMission(snapshot);
    }

    if (snapshot.phase === "number") {
      return (
        <SecretNumber
          number={snapshot.me?.secretNumber ?? null}
          hidden={Boolean(snapshot.me?.numberHidden)}
          waitingForOthers={!myPending}
          onContinue={sendReady}
        />
      );
    }

    if (snapshot.phase === "challenge") {
      return (
        <ChallengePhase
          challengeText={snapshot.challenge?.text || "Sin desafio disponible."}
          roundEvent={snapshot.roundEvent}
          waitingForOthers={!myPending}
          onContinue={sendReady}
        />
      );
    }

    if (snapshot.phase === "action") {
      if (snapshot.mySubmittedAction) {
        return (
          <div className="relative size-full bg-[#161519] text-[#f9eeee] flex flex-col items-center justify-center px-4 text-center">
            <p className="text-[9px] font-bold">Accion enviada</p>
            <p className="text-[6px] text-[#9b9b9b] mt-2">
              Esperando a que todos los jugadores elijan su accion secreta.
            </p>
          </div>
        );
      }

      if (selectedAction && needsTarget(selectedAction)) {
        return (
          <PlayerSelection
            selectedAction={selectedAction}
            players={snapshot.availableTargets}
            disabled={isBusy}
            onConfirm={(targetPlayerId, guessedNumber) =>
              submitAction(selectedAction, targetPlayerId, guessedNumber)
            }
          />
        );
      }

      return (
        <ActionSelection
          disabled={isBusy}
          initialAction={selectedAction}
          onConfirm={(actionType) => {
            if (needsTarget(actionType)) {
              setSelectedAction(actionType);
              return;
            }
            submitAction(actionType, null);
          }}
        />
      );
    }

    return renderResults(snapshot);
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="relative w-[158px] h-[348px] bg-white rounded-lg shadow-2xl overflow-hidden">
        {!playerName ? (
          <PlayerRegistration onContinue={setPlayerName} />
        ) : !session ? (
          renderMenu()
        ) : (
          renderGame()
        )}
      </div>

      {(errorMessage || session) && (
        <div className="absolute left-2 bottom-2 bg-black/80 text-white p-2 rounded text-[10px] w-[280px]">
          {session ? (
            <p>
              Partida: {session.gameCode} | Jugador: {playerName}
            </p>
          ) : (
            <p>Jugador: {playerName}</p>
          )}
          {errorMessage ? <p className="text-[#ff8e8e] mt-1">{errorMessage}</p> : null}
          {session ? (
            <button
              type="button"
              onClick={leaveSession}
              className="mt-1 text-[10px] underline text-[#f4c5ca]"
            >
              Salir de la partida
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
