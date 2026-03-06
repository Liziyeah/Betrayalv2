import imgImage18 from "@/assets/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";
import { useState } from "react";

type ActionType = "proteger" | "traicionar" | "investigar" | "negociar" | null;

export default function ActionSelection() {
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);

  const actions = [
    {
      id: "proteger" as ActionType,
      name: "Proteger",
      icon: "🛡",
      description: "Protege a un jugador de los efectos negativos",
    },
    {
      id: "traicionar" as ActionType,
      name: "Traicionar",
      icon: "🗡",
      description: "Causa daño a un jugador específico",
    },
    {
      id: "investigar" as ActionType,
      name: "Investigar",
      icon: "👁",
      description: "Revela información sobre otro jugador",
    },
    {
      id: "negociar" as ActionType,
      name: "Negociar",
      icon: "🤝",
      description: "Intercambia recursos con otros jugadores",
    },
  ];

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
          Elegir acción secreta
        </p>

        {/* Subtitle */}
        <p className="absolute font-['Lufga:Regular',sans-serif] leading-[7.5px] left-[9.77px] text-[#9b9b9b] text-[5.2px] top-[34px] w-[138px]">
          Selecciona tu acción para esta ronda
        </p>

        {/* Action Cards */}
        <div className="absolute left-[9.77px] top-[48px] w-[138px] h-[215px] space-y-[6px]">
          {actions.map((action, index) => (
            <div
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className="relative h-[50px] cursor-pointer group"
            >
              {/* Glow effect when selected */}
              {selectedAction === action.id && (
                <div className="absolute inset-[-4px] bg-[#af0e20] opacity-20 blur-[12px] rounded-[8px]" />
              )}

              {/* Card container */}
              <div
                className={`relative bg-gradient-to-r from-[#242230] to-[#1a1820] rounded-[8px] h-full w-full border-[1.5px] transition-all ${
                  selectedAction === action.id
                    ? "border-[#af0e20] shadow-[0px_0px_12px_0px_rgba(175,14,32,0.5)]"
                    : "border-[#2a2832] hover:border-[#473133]"
                }`}
              >
                {/* Icon */}
                <div className="absolute left-[8px] top-[50%] -translate-y-1/2 text-[20px] leading-none">
                  {action.icon}
                </div>

                {/* Action name */}
                <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[9px] left-[38px] text-[#f9eeee] text-[7.5px] top-[10px]">
                  {action.name}
                </p>

                {/* Description */}
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[6.5px] left-[38px] text-[#9b9b9b] text-[4.8px] top-[22px] w-[92px]">
                  {action.description}
                </p>

                {/* Selection indicator */}
                {selectedAction === action.id && (
                  <div className="absolute right-[8px] top-[50%] -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-[#af0e20] flex items-center justify-center">
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  </div>
                )}

                {/* Corner accent */}
                <div
                  className={`absolute top-[4px] right-[4px] w-[8px] h-[8px] border-r-[1.5px] border-t-[1.5px] transition-all ${
                    selectedAction === action.id ? "border-[#e01229]" : "border-[#2a2832]"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Confirm button */}
        <div
          className={`absolute h-[25.93px] left-[9.77px] rounded-[599.298px] top-[282px] w-[138px] transition-all ${
            selectedAction
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
