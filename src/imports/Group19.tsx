import imgImage18 from "figma:asset/9437d7a9f3f9d0942bf1c8000c1c43f3c764ce5b.png";

export default function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-gradient-to-b from-[#141316] from-[62.02%] h-[348.002px] left-0 overflow-clip to-[#af0e20] top-0 w-[157.999px]" data-name="Container">
        <div className="absolute bg-[rgba(224,18,41,0.2)] h-[129.227px] left-[36.8px] rounded-[5.993px] top-[90.39px] w-[85.791px]" />
        <div className="absolute contents left-[36.8px] top-[90.39px]">
          <div className="absolute h-[129.227px] left-[36.8px] rounded-[8.989px] top-[90.39px] w-[85.791px]" data-name="image 18">
            <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none rounded-[8.989px]">
              <img alt="" className="absolute h-[151.52%] left-[-156.9%] max-w-none top-[-30.21%] w-[405.75%]" src={imgImage18} />
            </div>
          </div>
        </div>
        <div className="absolute left-[42px] size-[20.364px] top-[94.72px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.3645 20.3645">
            <circle cx="10.1822" cy="10.1822" fill="var(--fill-0, #473133)" id="Ellipse 16" r="10.1822" />
          </svg>
        </div>
        <p className="-translate-x-1/2 absolute font-['Inter:Bold_Italic',sans-serif] font-bold italic leading-[17.979px] left-[76.64px] text-[#f9eeee] text-[47.944px] text-center top-[146.77px] w-[124.312px]">07</p>
        <p className="-translate-x-1/2 absolute font-['Inter:Bold_Italic',sans-serif] font-bold italic leading-[17.979px] left-[52.18px] text-[#f9eeee] text-[8.989px] text-center top-[97.11px] w-[124.312px]">07</p>
      </div>
      <p className="-translate-x-1/2 absolute font-['Montserrat:ExtraLight',sans-serif] font-extralight leading-[0] left-[79px] text-[#9b9b9b] text-[10.28px] text-center top-[238.93px] w-[124.312px]">
        <span className="font-['Lufga:Medium',sans-serif] leading-[13px] not-italic">{`Protege este número `}</span>
        <span className="leading-[13px]">para ganar la partida</span>
      </p>
    </div>
  );
}