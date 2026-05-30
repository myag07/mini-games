import React from "react";

interface TexturedTileProps {
  color: string;
  icon: string;
  label: string;
  textureType?: "marble" | "wood" | "stone" | "fabric" | "metal" | "plain";
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const TexturedTile: React.FC<TexturedTileProps> = ({
  color,
  icon,
  label,
  textureType = "stone",
  isSelected = false,
  isHighlighted = false,
  onClick,
}) => {
  // Generate texture patterns
  const getTexturePattern = (type: string, baseColor: string) => {
    const patternId = `pattern-${type}-${baseColor.replace("#", "")}`;

    switch (type) {
      case "marble":
        return (
          <defs>
            <filter id={`marble-${baseColor}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
            </filter>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width="100" height="100">
              <rect width="100" height="100" fill={baseColor} />
              <circle cx="20" cy="20" r="15" fill={adjustColor(baseColor, -20)} opacity="0.3" />
              <circle cx="70" cy="60" r="20" fill={adjustColor(baseColor, 20)} opacity="0.2" />
              <circle cx="50" cy="30" r="10" fill={adjustColor(baseColor, -30)} opacity="0.25" />
            </pattern>
          </defs>
        );

      case "wood":
        return (
          <defs>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width="80" height="80">
              <rect width="80" height="80" fill={baseColor} />
              <line x1="0" y1="0" x2="80" y2="80" stroke={adjustColor(baseColor, -15)} strokeWidth="2" opacity="0.4" />
              <line x1="0" y1="20" x2="80" y2="100" stroke={adjustColor(baseColor, -10)} strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="40" x2="80" y2="120" stroke={adjustColor(baseColor, -20)} strokeWidth="1.5" opacity="0.35" />
              <rect width="80" height="80" fill="url(#woodGradient)" opacity="0.1" />
            </pattern>
            <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        );

      case "stone":
        return (
          <defs>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width="60" height="60">
              <rect width="60" height="60" fill={baseColor} />
              <circle cx="15" cy="15" r="8" fill={adjustColor(baseColor, -25)} opacity="0.4" />
              <circle cx="45" cy="30" r="6" fill={adjustColor(baseColor, 15)} opacity="0.3" />
              <circle cx="25" cy="50" r="7" fill={adjustColor(baseColor, -20)} opacity="0.35" />
              <rect x="0" y="0" width="60" height="60" fill={adjustColor(baseColor, -5)} opacity="0.08" />
            </pattern>
          </defs>
        );

      case "fabric":
        return (
          <defs>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width="10" height="10">
              <rect width="10" height="10" fill={baseColor} />
              <line x1="0" y1="0" x2="10" y2="10" stroke={adjustColor(baseColor, -10)} strokeWidth="0.5" opacity="0.5" />
              <line x1="10" y1="0" x2="0" y2="10" stroke={adjustColor(baseColor, -10)} strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
        );

      case "metal":
        return (
          <defs>
            <linearGradient id={`metal-gradient-${baseColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={adjustColor(baseColor, 30)} stopOpacity="1" />
              <stop offset="50%" stopColor={baseColor} stopOpacity="1" />
              <stop offset="100%" stopColor={adjustColor(baseColor, -30)} stopOpacity="1" />
            </linearGradient>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width="40" height="40">
              <rect width="40" height="40" fill={`url(#metal-gradient-${baseColor})`} />
              <line x1="0" y1="0" x2="40" y2="0" stroke="#fff" strokeWidth="0.5" opacity="0.3" />
              <line x1="0" y1="40" x2="40" y2="40" stroke="#000" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
        );

      default:
        return <defs />;
    }
  };

  const adjustColor = (hex: string, amount: number): string => {
    const usePound = hex[0] === "#";
    const col = usePound ? hex.slice(1) : hex;
    const num = parseInt(col, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
    return (usePound ? "#" : "") + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  };

  const patternId = `pattern-${textureType}-${color.replace("#", "")}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full cursor-pointer transition-all duration-200 ${
        isSelected ? "drop-shadow-lg" : ""
      } ${isHighlighted ? "drop-shadow-md" : ""}`}
      onClick={onClick}
      style={{
        filter: isSelected ? `drop-shadow(0 0 12px ${color})` : isHighlighted ? `drop-shadow(0 0 8px ${color})` : "none",
      }}
    >
      {getTexturePattern(textureType, color)}

      {/* Main tile shape */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="8"
        fill={`url(#${patternId})`}
        stroke={isSelected ? "#fbbf24" : adjustColor(color, -40)}
        strokeWidth={isSelected ? "3" : "2"}
      />

      {/* Highlight effect */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="8"
        fill="none"
        stroke="#fff"
        strokeWidth="1"
        opacity={isSelected ? "0.6" : "0.2"}
      />

      {/* Inner shadow for depth */}
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="6"
        fill="none"
        stroke={adjustColor(color, -60)}
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Icon */}
      <text
        x="50"
        y="45"
        fontSize="36"
        textAnchor="middle"
        dominantBaseline="middle"
        className="pointer-events-none"
      >
        {icon}
      </text>

      {/* Label */}
      <text
        x="50"
        y="75"
        fontSize="9"
        fontWeight="bold"
        textAnchor="middle"
        fill="#fff"
        className="pointer-events-none drop-shadow"
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
      >
        {label}
      </text>
    </svg>
  );
};

export default TexturedTile;
