import { useEffect, useState } from "react";
import imgImage18 from "@/assets/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";

export type ActionType = "proteger" | "traicionar" | "investigar" | "negociar" | "acusar";

interface ActionSelectionProps {
  disabled?: boolean;
  initialAction?: ActionType | null;
  onConfirm: (action: ActionType) => void;
}

const ACTIONS: Array<{
  id: ActionType;
  name: string;
  icon: string;
  description: string;
}> = [
  {
    id: "proteger",
    name: "Proteger",
    icon: "P",
    description: "Protege a un jugador para evitar dano este turno.",
  },
  {
    id: "traicionar",
    name: "Traicionar",
    icon: "T",
    description: "Causa dano extra a un jugador objetivo.",
  },
  {
    id: "investigar",
    name: "Investigar",
    icon: "I",
    description: "Descubre numero y accion de otro jugador.",
  },
  {
    id: "negociar",
    name: "Negociar",
    icon: "N",
    description: "Si ambos negocian entre si, ambos ganan vida.",
  },
  {
    id: "acusar",
    name: "Acusar",
    icon: "A",
    description: "Elige jugador y numero. Si aciertas, ganas beneficio.",
  },
];

export default function ActionSelection({
  disabled = false,
  initialAction = null,
  onConfirm,
}: ActionSelectionProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(initialAction);

  useEffect(() => {
    setSelectedAction(initialAction);
  }, [initialAction]);

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
          Elegir accion secreta
        </p>
        <p className="absolute font-['Lufga:Regular',sans-serif] leading-[7.5px] left-[9.77px] text-[#9b9b9b] text-[5.2px] top-[34px] w-[138px]">
          Selecciona tu accion para esta ronda
        </p>

        <div className="absolute left-[9.77px] top-[48px] w-[138px] h-[215px] space-y-[6px]">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              disabled={disabled}
              onClick={() => setSelectedAction(action.id)}
              className="relative h-[50px] w-full cursor-pointer disabled:cursor-not-allowed"
              type="button"
            >
              {selectedAction === action.id && (
                <div className="absolute inset-[-4px] bg-[#af0e20] opacity-20 blur-[12px] rounded-[8px]" />
              )}

              <div
                className={`relative bg-gradient-to-r from-[#242230] to-[#1a1820] rounded-[8px] h-full w-full border-[1.5px] transition-all ${
                  selectedAction === action.id
                    ? "border-[#af0e20] shadow-[0px_0px_12px_0px_rgba(175,14,32,0.5)]"
                    : "border-[#2a2832]"
                }`}
              >
                <div className="absolute left-[8px] top-[50%] -translate-y-1/2 text-[14px] leading-none text-white">
                  {action.icon}
                </div>
                <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[9px] left-[30px] text-[#f9eeee] text-[7.5px] top-[10px]">
                  {action.name}
                </p>
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[6.5px] left-[30px] text-[#9b9b9b] text-[4.8px] top-[22px] w-[100px] text-left">
                  {action.description}
                </p>

                {selectedAction === action.id && (
                  <div className="absolute right-[8px] top-[50%] -translate-y-1/2 w-[12px] h-[12px] rounded-full bg-[#af0e20] flex items-center justify-center">
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => selectedAction && onConfirm(selectedAction)}
          disabled={!selectedAction || disabled}
          className={`absolute h-[25.93px] left-[9.77px] rounded-[599.298px] top-[282px] w-[138px] transition-all ${
            selectedAction && !disabled
              ? "bg-[#af0e20] shadow-[0px_0px_11.986px_0px_rgba(175,14,32,0.6)] cursor-pointer"
              : "bg-[#3a3a3a] cursor-not-allowed opacity-50"
          }`}
        >
          <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[25.93px] justify-center leading-[0] left-[78px] text-[7.292px] text-center text-white top-[12.96px] w-[100px]">
            <p className="leading-[11.343px]">Confirmar accion</p>
          </div>
        </button>
      </div>
    </div>
  );
}
