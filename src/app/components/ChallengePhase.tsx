import imgImage18 from "figma:asset/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";

export default function ChallengePhase() {
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
        <p className="absolute font-['Montserrat:Bold',sans-serif] font-bold leading-[11.402px] left-[9.77px] text-[#f9eeee] text-[10.278px] top-[26.97px] w-[138px]">
          El desafío
        </p>

        {/* Warning icon with glow */}
        <div className="absolute left-[64px] top-[52px] w-[30px] h-[30px]">
          {/* Glow effect */}
          <div className="absolute inset-[-8px] bg-[#af0e20] opacity-30 blur-[15px] rounded-full" />
          
          {/* Icon container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Alert triangle */}
            <svg className="w-[26px] h-[26px]" viewBox="0 0 24 24" fill="none">
              <path 
                d="M12 2L2 20h20L12 2z" 
                stroke="#af0e20" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="rgba(175, 14, 32, 0.2)"
              />
              <path d="M12 9v4" stroke="#f9eeee" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="0.5" fill="#f9eeee" stroke="#f9eeee" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Large warning card */}
        <div className="absolute left-[9.77px] top-[92px] w-[138px] h-[95px]">
          {/* Outer glow */}
          <div className="absolute inset-[-8px] bg-[#af0e20] opacity-15 blur-[18px] rounded-[12px]" />
          
          {/* Card container */}
          <div className="relative bg-gradient-to-br from-[#2a1a1c] to-[#1a0e10] border-[2px] border-[#af0e20] rounded-[12px] h-full w-full shadow-[0px_0px_16px_0px_rgba(175,14,32,0.5)]">
            {/* Animated border pulse */}
            <div className="absolute inset-0 border-[1px] border-[#e01229] opacity-50 rounded-[12px] animate-pulse" />

            {/* Message text */}
            <div className="absolute inset-0 flex items-center justify-center px-[12px]">
              <p className="font-['Montserrat:Bold',sans-serif] font-bold text-[#f9eeee] text-[8.5px] leading-[11px] text-center">
                Los números <span className="text-[#e01229]">IMPARES</span> perderán <span className="text-[#e01229]">1 vida</span> esta ronda
              </p>
            </div>

            {/* Corner accents */}
            <div className="absolute top-[6px] left-[6px] w-[10px] h-[10px] border-l-[2px] border-t-[2px] border-[#e01229]" />
            <div className="absolute top-[6px] right-[6px] w-[10px] h-[10px] border-r-[2px] border-t-[2px] border-[#e01229]" />
            <div className="absolute bottom-[6px] left-[6px] w-[10px] h-[10px] border-l-[2px] border-b-[2px] border-[#e01229]" />
            <div className="absolute bottom-[6px] right-[6px] w-[10px] h-[10px] border-r-[2px] border-b-[2px] border-[#e01229]" />

            {/* Warning stripes decoration */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#e01229] to-transparent opacity-40" />
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#e01229] to-transparent opacity-40" />
          </div>
        </div>

        {/* Instruction text */}
        <p className="absolute font-['Lufga:Medium',sans-serif] leading-[8.5px] left-[9.77px] text-[#efe6e5] text-[6.2px] text-center top-[200px] w-[138px]">
          Prepárate para negociar y elegir tu acción
        </p>

        {/* Additional info text */}
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[7px] left-[9.77px] not-italic text-[#9b9b9b] text-[4.8px] text-center top-[218px] w-[138px]">
          Puedes cooperar con otros jugadores o actuar por tu cuenta
        </p>

        {/* Continue button */}
        <div className="absolute bg-[#af0e20] h-[25.93px] left-[9.77px] rounded-[599.298px] shadow-[0px_0px_11.986px_0px_rgba(175,14,32,0.6)] top-[282px] w-[138px]" data-name="Container">
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
            <p className="leading-[11.343px]">Continuar</p>
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
