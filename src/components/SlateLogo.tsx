import { useNavigate } from "react-router-dom";

interface SlateLogoProps {
  dark?: boolean;
  size?: number;
  asLink?: boolean;
  className?: string;
}

const SlateLogo = ({ dark = false, size = 20, asLink = true, className = "" }: SlateLogoProps) => {
  const navigate = useNavigate();

  // Bar dimensions scale with font size
  const barWidth = size * 0.85;
  const barHeight = Math.max(3, size * 0.19);
  const barGap = Math.max(2.5, size * 0.16);
  const barRadius = 1;
  const iconHeight = barHeight * 3 + barGap * 2;

  // Colors
  const bars = dark
    ? [
        "rgba(248,250,252,0.9)",  // top - white 90%
        "rgba(148,163,184,0.6)",  // mid - slate-light 60%
        "rgba(71,85,105,0.4)",    // bot - slate-mid 40%
      ]
    : [
        "#1E293B", // top - slate-dark
        "#475569", // mid - slate-mid
        "#94A3B8", // bot - slate-light
      ];

  const wordColor = dark ? "#F8FAFC" : "#1E293B";

  const content = (
    <span className={`inline-flex items-center gap-[0.35em] ${className}`} style={{ fontSize: size }}>
      {/* Stacked bars icon */}
      <svg
        width={barWidth}
        height={iconHeight}
        viewBox={`0 0 ${barWidth} ${iconHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        style={{ marginTop: size * 0.05 }}
      >
        <rect x="0" y="0" width={barWidth} height={barHeight} rx={barRadius} fill={bars[0]} />
        <rect x="0" y={barHeight + barGap} width={barWidth} height={barHeight} rx={barRadius} fill={bars[1]} />
        <rect x="0" y={(barHeight + barGap) * 2} width={barWidth} height={barHeight} rx={barRadius} fill={bars[2]} />
      </svg>
      {/* Wordmark */}
      <span
        className="font-bold tracking-[-0.02em] leading-none"
        style={{ color: wordColor, fontSize: "1em" }}
      >
        slate
        {/* Amber rounded square dot */}
        <span
          className="inline-block align-baseline"
          style={{
            width: size * 0.22,
            height: size * 0.22,
            backgroundColor: "#F59E0B",
            borderRadius: 2,
            marginLeft: size * 0.04,
            marginBottom: size * 0.02,
          }}
        />
      </span>
    </span>
  );

  if (asLink) {
    return (
      <button onClick={() => navigate("/")} className="cursor-pointer">
        {content}
      </button>
    );
  }

  return content;
};

export default SlateLogo;
