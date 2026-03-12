import imgImage18 from "@/assets/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";

interface ChallengePhaseProps {
  challengeText: string;
  roundEvent?: {
    title: string;
    text: string;
  } | null;
  waitingForOthers?: boolean;
  onContinue: () => void;
}

export default function ChallengePhase({
  challengeText,
  roundEvent = null,
  waitingForOthers = false,
  onContinue,
}: ChallengePhaseProps) {
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

        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[11.402px] left-[9.77px] text-[#f9eeee] text-[10.278px] top-[26.97px] w-[138px]">
          El desafio
        </p>

        <div className="absolute left-[64px] top-[52px] w-[30px] h-[30px]">
          <div className="absolute inset-[-8px] bg-[#af0e20] opacity-30 blur-[15px] rounded-full" />
          <div className="relative w-full h-full flex items-center justify-center text-[18px] text-white font-bold">
            !
          </div>
        </div>

        <div className="absolute left-[9.77px] top-[92px] w-[138px] h-[95px]">
          <div className="absolute inset-[-8px] bg-[#af0e20] opacity-15 blur-[18px] rounded-[12px]" />
          <div className="relative bg-gradient-to-br from-[#2a1a1c] to-[#1a0e10] border-[2px] border-[#af0e20] rounded-[12px] h-full w-full shadow-[0px_0px_16px_0px_rgba(175,14,32,0.5)]">
            <div className="absolute inset-0 flex items-center justify-center px-[12px]">
              <p className="font-['Montserrat:Bold',sans-serif] font-bold text-[#f9eeee] text-[7.4px] leading-[11px] text-center">
                {challengeText}
              </p>
            </div>
          </div>
        </div>

        {roundEvent && (
          <div className="absolute left-[9.77px] top-[192px] w-[138px] rounded-[8px] bg-[#2a2430] border border-[#3d3548] p-[4px]">
            <p className="text-[5.2px] font-bold text-[#af0e20]">Evento: {roundEvent.title}</p>
            <p className="text-[4.8px] leading-[6px] text-[#c8becd] mt-[1px]">{roundEvent.text}</p>
          </div>
        )}

        <p className="absolute font-['Lufga:Medium',sans-serif] leading-[8.5px] left-[9.77px] text-[#efe6e5] text-[6.2px] text-center top-[228px] w-[138px]">
          Tienen 2 minutos para hablar, negociar o mentir.
        </p>

        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[7px] left-[9.77px] not-italic text-[#9b9b9b] text-[4.8px] text-center top-[246px] w-[138px]">
          {waitingForOthers
            ? "Esperando a que todos terminen esta fase..."
            : "Luego deberas elegir tu accion secreta."}
        </p>

        <button
          type="button"
          onClick={onContinue}
          disabled={waitingForOthers}
          className={`absolute h-[25.93px] left-[9.77px] rounded-[599.298px] top-[282px] w-[138px] ${
            waitingForOthers
              ? "bg-[#3a3a3a] opacity-60 cursor-not-allowed"
              : "bg-[#af0e20] shadow-[0px_0px_11.986px_0px_rgba(175,14,32,0.6)]"
          }`}
        >
          <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Montserrat:Bold',sans-serif] font-bold h-[25.93px] justify-center leading-[0] left-[78px] text-[7.292px] text-center text-white top-[12.96px] w-[100px]">
            <p className="leading-[11.343px]">{waitingForOthers ? "Esperando..." : "Continuar"}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
