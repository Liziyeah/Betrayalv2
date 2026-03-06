import imgImage18 from "@/assets/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";

interface SecretNumberProps {
  number: number | null;
  hidden?: boolean;
  waitingForOthers?: boolean;
  onContinue: () => void;
}

export default function SecretNumber({
  number,
  hidden = false,
  waitingForOthers = false,
  onContinue,
}: SecretNumberProps) {
  const canContinue = !waitingForOthers;

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
          Tu numero secreto
        </p>

        <div className="absolute left-[29.5px] top-[58px] w-[99px] h-[120px]">
          <div className="absolute inset-[-10px] bg-[#af0e20] opacity-20 blur-[20px] rounded-[12px]" />
          <div className="relative bg-gradient-to-br from-[#2a2832] to-[#1a1820] border-[2px] border-[#af0e20] rounded-[12px] h-full w-full shadow-[0px_0px_20px_0px_rgba(175,14,32,0.4)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-['Montserrat:Bold',sans-serif] font-bold text-[#f9eeee] text-[56px] leading-none">
                {hidden ? "?" : number ?? "-"}
              </p>
            </div>

            <div className="absolute top-[8px] left-[8px] w-[12px] h-[12px] border-l-[2px] border-t-[2px] border-[#af0e20] opacity-60" />
            <div className="absolute top-[8px] right-[8px] w-[12px] h-[12px] border-r-[2px] border-t-[2px] border-[#af0e20] opacity-60" />
            <div className="absolute bottom-[8px] left-[8px] w-[12px] h-[12px] border-l-[2px] border-b-[2px] border-[#af0e20] opacity-60" />
            <div className="absolute bottom-[8px] right-[8px] w-[12px] h-[12px] border-r-[2px] border-b-[2px] border-[#af0e20] opacity-60" />
          </div>
        </div>

        <p className="absolute font-['Lufga:Medium',sans-serif] leading-[8.091px] left-[9.77px] text-[#efe6e5] text-[5.993px] text-center top-[192px] w-[138px]">
          {hidden
            ? "Como Adivino debes tomar una carta al azar sin verla."
            : "Coloca la carta correspondiente boca abajo frente a ti."}
        </p>

        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[7.5px] left-[9.77px] not-italic text-[#9b9b9b] text-[5.2px] text-center top-[212px] w-[138px]">
          {waitingForOthers
            ? "Esperando a que los demas jugadores confirmen..."
            : "Este numero debe permanecer en secreto hasta el final de la ronda."}
        </p>

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          className={`absolute h-[25.93px] left-[9.77px] rounded-[599.298px] top-[282px] w-[138px] ${
            canContinue
              ? "bg-[#af0e20] shadow-[0px_0px_11.986px_0px_rgba(175,14,32,0.6)]"
              : "bg-[#3a3a3a] opacity-60 cursor-not-allowed"
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
