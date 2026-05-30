import React from "react";

interface PlayerTokenProps {
  token: string;
  color: string;
  name: string;
  isActive?: boolean;
  isFinished?: boolean;
  position?: number;
  size?: "sm" | "md" | "lg";
}

const PlayerToken: React.FC<PlayerTokenProps> = ({
  token,
  color,
  name,
  isActive = false,
  isFinished = false,
  position,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  const sizeValue = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  return (
    <div className="relative inline-block">
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 ${color}80;
          }
          50% {
            box-shadow: 0 0 0 8px ${color}00;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .token-active {
          animation: pulse-glow 2s infinite, float 3s ease-in-out infinite;
        }
        .token-finished {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>

      {/* Outer glow for active player */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
            animation: "pulse-glow 2s infinite",
          }}
        />
      )}

      {/* Main token */}
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses[size]} drop-shadow-lg transition-all duration-200 ${
          isActive ? "token-active" : ""
        } ${isFinished ? "token-finished" : ""}`}
        style={{
          filter: isActive ? `drop-shadow(0 0 8px ${color})` : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        {/* Outer ring */}
        <circle cx="50" cy="50" r="48" fill={color} opacity="0.9" />

        {/* Gradient overlay */}
        <defs>
          <radialGradient id={`token-gradient-${color}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.2" />
          </radialGradient>
          <filter id={`token-shadow-${color}`}>
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#token-gradient-${color})`}
          filter={`url(#token-shadow-${color})`}
        />

        {/* Inner highlight */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />

        {/* Token emoji/icon */}
        <text
          x="50"
          y="55"
          fontSize="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none"
        >
          {token}
        </text>

        {/* Finished badge */}
        {isFinished && (
          <>
            <circle cx="50" cy="50" r="48" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.8" />
            <text
              x="50"
              y="50"
              fontSize="32"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
            >
              🏆
            </text>
          </>
        )}
      </svg>

      {/* Name label below token */}
      {size === "lg" && (
        <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-xs font-bold text-white drop-shadow" style={{ color: color }}>
            {name}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerToken;
