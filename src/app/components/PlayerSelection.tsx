import imgImage18 from "figma:asset/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";
import { useState } from "react";

type Player = {
  id: string;
  name: string;
  avatar: string;
  lives: number;
};

type ActionType = "proteger" | "traicionar" | "investigar" | "negociar";

interface PlayerSelectionProps {
  selectedAction?: ActionType;
}

export default function PlayerSelection({ selectedAction = "proteger" }: PlayerSelectionProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const players: Player[] = [
    { id: "1", name: "@em512", avatar: "👤", lives: 3 },
    { id: "2", name: "@player2", avatar: "👤", lives: 2 },
    { id: "3", name: "@player3", avatar: "👤", lives: 3 },
    { id: "4", name: "@player4", avatar: "👤", lives: 1 },
    { id: "5", name: "@player5", avatar: "👤", lives: 2 },
  ];

  const actionInstructions: Record<ActionType, string> = {
    proteger: "Selecciona el jugador que deseas proteger en esta ronda",
    traicionar: "Selecciona el jugador que deseas traicionar",
    investigar: "Selecciona el jugador que deseas investigar",
    negociar: "Selecciona el jugador con el que deseas negociar",
  };

  const actionIcons: Record<ActionType, string> = {
    proteger: "🛡",
    traicionar: "🗡",
    investigar: "👁",
    negociar: "🤝",
  };

  return (
    <div className="relative size-full">
      <div className="absolute bg-[#161519] h-[348.002px] left-0 overflow-clip top-0 w-[157.999px]" data-name="Container">
        {/* Background image with opacity */}
        <div className="absolute h-[123.554px] left-0 rounded-[8.989px] top-0 w-[157.999px]" data-name="image 18">
          <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none rounded-[8.989px]">
            <img alt="" className="absolute h-[158.48%] left-[-62.35%] max-w-none top-[-31.6%] w-[220.32%]" src={imgImage18} />
          </div>
        </div>

        {/* Title */}
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[11.402px] left-[9.77px] text-[#f9eeee] text-[10.278px] top-[20px] w-[138px]">
          Elige un jugador
        </p>

        {/* Action badge */}
        <div className="absolute left-[9.77px] top-[34px] flex items-center gap-[4px]">
          <span className="text-[12px]">{actionIcons[selectedAction]}</span>
          <p className="font-['Lufga:Regular',sans-serif] leading-[7.5px] text-[#9b9b9b] text-[5.2px]">
            {actionInstructions[selectedAction]}
          </p>
        </div>

        {/* Player cards */}
        <div className="absolute left-[9.77px] top-[52px] w-[138px] h-[207px] space-y-[6px] overflow-y-auto">
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player.id)}
              className="relative h-[38px] cursor-pointer group"
            >
              {/* Glow effect when selected */}
              {selectedPlayer === player.id && (
                <div className="absolute inset-[-4px] bg-[#af0e20] opacity-20 blur-[12px] rounded-[8px]" />
              )}

              {/* Card container */}
              <div
                className={`relative bg-gradient-to-r from-[#242230] to-[#1a1820] rounded-[8px] h-full w-full border-[1.5px] transition-all ${
                  selectedPlayer === player.id
                    ? "border-[#af0e20] shadow-[0px_0px_12px_0px_rgba(175,14,32,0.5)]"
                    : "border-[#2a2832] hover:border-[#473133]"
                }`}
              >
                {/* Avatar */}
                <div className="absolute left-[8px] top-[50%] -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-gradient-to-br from-[#3a3844] to-[#2a2832] flex items-center justify-center text-[14px] border-[1px] border-[#3a3844]">
                  {player.avatar}
                </div>

                {/* Player name */}
                <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[8px] left-[38px] text-[#f9eeee] text-[6.8px] top-[8px]">
                  {player.name}
                </p>

                {/* Lives (hearts) */}
                <div className="absolute left-[38px] top-[20px] flex gap-[3px]">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="relative w-[8px] h-[8px]">
                      {index < player.lives ? (
                        // Filled heart
                        <svg viewBox="0 0 24 24" fill="#e01229" className="w-full h-full">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      ) : (
                        // Empty heart
                        <svg viewBox="0 0 24 24" fill="none" stroke="#3a3844" strokeWidth="2" className="w-full h-full">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>

                {/* Selection indicator */}
                {selectedPlayer === player.id && (
                  <div className="absolute right-[8px] top-[50%] -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-[#af0e20] flex items-center justify-center">
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  </div>
                )}

                {/* Corner accent */}
                <div
                  className={`absolute top-[4px] right-[4px] w-[8px] h-[8px] border-r-[1.5px] border-t-[1.5px] transition-all ${
                    selectedPlayer === player.id ? "border-[#e01229]" : "border-[#2a2832]"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Confirm button */}
        <div
          className={`absolute h-[25.93px] left-[9.77px] rounded-[599.298px] top-[282px] w-[138px] transition-all ${
            selectedPlayer
              ? "bg-[#af0e20] shadow-[0px_0px_11.986px_0px_rgba(175,14,32,0.6)] cursor-pointer"
              : "bg-[#3a3a3a] cursor-not-allowed opacity-50"
          }`}
          data-name="Container"
        >
          <div className="absolute left-[9.72px] overflow-clip size-[9.723px] top-[8.1px]" data-name="circle-plus">
            <div className="absolute contents inset-[4.16%_4.17%_4.17%_4.17%]">
              <div className="absolute contents inset-[4.16%_4.17%_4.17%_4.17%]">
                <div className="absolute inset-[4.16%_4.17%_4.17%_4.17%]">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.91274 8.91274">
                    <g>
                      <circle cx="4.456" cy="4.456" r="4.456" fill="#F9EEEE" />
                    </g>
                  </svg>
                </div>
                <div className="absolute inset-[45.83%_29.17%]">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.05125 0.810249">
                    <g>
                      <rect width="4.05" height="0.81" fill="#F9EEEE" />
                    </g>
                  </svg>
                </div>
                <div className="absolute inset-[29.17%_45.84%_29.17%_45.83%]">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.810249 4.05125">
                    <g>
                      <rect width="0.81" height="4.05" fill="#F9EEEE" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[25.93px] justify-center leading-[0] left-[51.08px] text-[7.292px] text-center text-white top-[12.96px] w-[51.214px]">
            <p className="leading-[11.343px]">Confirmar acción</p>
          </div>
          <div className="absolute left-[120.73px] opacity-50 overflow-clip size-[8.102px] top-[8.91px]">
            <div className="absolute inset-[16.8%_16.72%_16.8%_16.8%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.38 0.67">
                <path d="M0 0.335 L5.38 0.335" stroke="#F9EEEE" strokeWidth="0.67" />
              </svg>
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.03 5.38">
                <path d="M0 5.38 L3.03 2.69 L0 0" stroke="#F9EEEE" strokeWidth="0.67" fill="none" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
