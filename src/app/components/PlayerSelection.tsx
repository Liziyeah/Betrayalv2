import { useEffect, useState } from "react";
import imgImage18 from "@/assets/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";
import type { ActionType } from "./ActionSelection";

export interface SelectablePlayer {
  playerId: string;
  playerName: string;
  lives: number;
}

interface PlayerSelectionProps {
  selectedAction: ActionType;
  players: SelectablePlayer[];
  disabled?: boolean;
  onConfirm: (targetPlayerId: string, guessedNumber?: number) => void;
}

const ACTION_INSTRUCTIONS: Record<ActionType, string> = {
  proteger: "Selecciona a quien deseas proteger.",
  traicionar: "Selecciona a quien deseas traicionar.",
  investigar: "Selecciona a quien deseas investigar.",
  negociar: "Selecciona con quien deseas negociar.",
  acusar: "Selecciona a quien acusas y el numero que crees.",
};

const ACTION_LABELS: Record<ActionType, string> = {
  proteger: "P",
  traicionar: "T",
  investigar: "I",
  negociar: "N",
  acusar: "A",
};

export default function PlayerSelection({
  selectedAction,
  players,
  disabled = false,
  onConfirm,
}: PlayerSelectionProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [guessedNumber, setGuessedNumber] = useState(5);

  useEffect(() => {
    setSelectedPlayerId(null);
    setGuessedNumber(5);
  }, [selectedAction, players.length]);

  return (
    <div className="relative size-full">
      <div className="absolute bg-[#161519] h-[348.002px] left-0 overflow-clip top-0 w-[157.999px]">
        <div className="absolute h-[123.554px] left-0 rounded-[8.989px] top-0 w-[157.999px]">
          <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none rounded-[8.989px]">
            <img
              alt=""
              className="absolute h-[158.48%] left-[-62.35%] max-w-none top-[-31.6%] w-[220.32%]"
              src={imgImage18}
            />
          </div>
        </div>

        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[11.402px] left-[9.77px] text-[#f9eeee] text-[10.278px] top-[20px] w-[138px]">
          Elige un jugador
        </p>

        <div className="absolute left-[9.77px] top-[34px] flex items-center gap-[4px] w-[138px]">
          <span className="text-[10px] text-white font-bold">{ACTION_LABELS[selectedAction]}</span>
          <p className="font-['Lufga:Regular',sans-serif] leading-[7.5px] text-[#9b9b9b] text-[5.2px]">
            {ACTION_INSTRUCTIONS[selectedAction]}
          </p>
        </div>

        <div className="absolute left-[9.77px] top-[52px] w-[138px] h-[207px] space-y-[6px] overflow-y-auto pr-[2px]">
          {players.map((player) => (
            <button
              key={player.playerId}
              type="button"
              onClick={() => setSelectedPlayerId(player.playerId)}
              disabled={disabled}
              className="relative h-[38px] w-full cursor-pointer disabled:cursor-not-allowed"
            >
              {selectedPlayerId === player.playerId && (
                <div className="absolute inset-[-4px] bg-[#af0e20] opacity-20 blur-[12px] rounded-[8px]" />
              )}

              <div
                className={`relative bg-gradient-to-r from-[#242230] to-[#1a1820] rounded-[8px] h-full w-full border-[1.5px] transition-all ${
                  selectedPlayerId === player.playerId
                    ? "border-[#af0e20] shadow-[0px_0px_12px_0px_rgba(175,14,32,0.5)]"
                    : "border-[#2a2832]"
                }`}
              >
                <div className="absolute left-[8px] top-[50%] -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-gradient-to-br from-[#3a3844] to-[#2a2832] flex items-center justify-center text-[10px] border-[1px] border-[#3a3844] text-white font-bold">
                  {player.playerName.slice(0, 1).toUpperCase()}
                </div>
                <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[8px] left-[38px] text-[#f9eeee] text-[6.8px] top-[8px] text-left w-[78px] truncate">
                  {player.playerName}
                </p>
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[6.5px] left-[38px] text-[#9b9b9b] text-[5px] top-[20px]">
                  Vidas: {player.lives}
                </p>

                {selectedPlayerId === player.playerId && (
                  <div className="absolute right-[8px] top-[50%] -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-[#af0e20] flex items-center justify-center">
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          ))}

          {players.length === 0 && (
            <div className="h-full flex items-center justify-center text-[6px] text-[#9b9b9b] font-medium px-2 text-center">
              No hay jugadores disponibles para esta accion.
            </div>
          )}
        </div>

        {selectedAction === "acusar" && (
          <div className="absolute left-[9.77px] top-[258px] w-[138px] h-[20px] rounded-[8px] bg-[#2a2430] border border-[#3a3342] flex items-center justify-between px-2">
            <span className="text-[5.2px] text-[#9b9b9b]">Numero que acusas</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled || guessedNumber <= 1}
                onClick={() => setGuessedNumber((value) => Math.max(1, value - 1))}
                className="text-[9px] text-white disabled:opacity-40"
              >
                -
              </button>
              <span className="text-[7px] text-white font-bold w-[10px] text-center">{guessedNumber}</span>
              <button
                type="button"
                disabled={disabled || guessedNumber >= 10}
                onClick={() => setGuessedNumber((value) => Math.min(10, value + 1))}
                className="text-[9px] text-white disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => selectedPlayerId && onConfirm(selectedPlayerId, guessedNumber)}
          disabled={!selectedPlayerId || disabled || players.length === 0}
          className={`absolute h-[25.93px] left-[9.77px] rounded-[599.298px] top-[282px] w-[138px] transition-all ${
            selectedPlayerId && !disabled && players.length > 0
              ? "bg-[#af0e20] shadow-[0px_0px_11.986px_0px_rgba(175,14,32,0.6)] cursor-pointer"
              : "bg-[#3a3a3a] cursor-not-allowed opacity-50"
          }`}
        >
          <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[25.93px] justify-center leading-[0] left-[78px] text-[7.292px] text-center text-white top-[12.96px] w-[100px]">
            <p className="leading-[11.343px]">Confirmar objetivo</p>
          </div>
        </button>
      </div>
    </div>
  );
}
