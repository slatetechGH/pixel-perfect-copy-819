import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

interface SlateLogoProps {
  dark?: boolean;
  size?: number;
  asLink?: boolean;
  className?: string;
}

const SlateLogo = ({ dark = false, size = 20, asLink = true, className = "" }: SlateLogoProps) => {
  const navigate = useNavigate();
  const { accentColor } = useApp();

  // Tile dimensions scale with font size
  const tileW = size * 0.8;
  const tileH = size * 0.5;
  const offsetX = size * 0.2;
  const offsetY = size * 0.2;
  const tileR = 2;
  const svgW = tileW + offsetX * 2;
  const svgH = tileH + offsetY * 2;

  // Colors for tiles
  const tiles = dark
    ? [
        { fill: "#475569", opacity: 0.4 },  // back
        { fill: "#94A3B8", opacity: 0.6 },  // middle
        { fill: "#F8FAFC", opacity: 0.9 },  // front
      ]
    : [
        { fill: "#94A3B8", opacity: 1 },    // back (lightest)
        { fill: "#475569", opacity: 1 },    // middle
        { fill: "#1E293B", opacity: 1 },    // front (darkest)
      ];

  const wordColor = dark ? "#F8FAFC" : "#1E293B";
  const dotColor = accentColor;

  const content = (
    <span className={`inline-flex items-center ${className}`} style={{ fontSize: size, gap: size * 0.4 }}>
      {/* Overlapping tiles icon */}
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {tiles.map((tile, i) => (
          <rect
            key={i}
            x={offsetX * i}
            y={offsetY * i}
            width={tileW}
            height={tileH}
            rx={tileR}
            fill={tile.fill}
            fillOpacity={tile.opacity}
          />
        ))}
      </svg>
      {/* Wordmark */}
      <span
        className="font-bold tracking-[-0.02em] leading-none"
        style={{ color: wordColor, fontSize: "1em" }}
      >
        slate
        {/* Accent rounded square dot */}
        <span
          className="inline-block align-baseline"
          style={{
            width: size * 0.25,
            height: size * 0.25,
            backgroundColor: dotColor,
            borderRadius: Math.max(1.5, size * 0.08),
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
