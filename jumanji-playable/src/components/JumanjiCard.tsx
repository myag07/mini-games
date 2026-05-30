import React from "react";
import type { GameCard } from "../types";

interface JumanjiCardProps {
  card?: {
    title: string;
    text: string;
    icon: string;
    color: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

const JumanjiCard: React.FC<JumanjiCardProps> = ({ card, isOpen = false, onClose }) => {
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-md transform transition-all duration-300"
        style={{
          animation: isOpen ? "slideIn 0.5s ease-out" : "slideOut 0.3s ease-in",
        }}
      >
        <style>{`
          @keyframes slideIn {
            from {
              transform: scale(0.8) rotateX(20deg);
              opacity: 0;
            }
            to {
              transform: scale(1) rotateX(0deg);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: scale(1) rotateX(0deg);
              opacity: 1;
            }
            to {
              transform: scale(0.8) rotateX(20deg);
              opacity: 0;
            }
          }
          .card-shine {
            position: relative;
            overflow: hidden;
          }
          .card-shine::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 70%
            );
            animation: shine 3s infinite;
          }
          @keyframes shine {
            0% {
              transform: translate(-100%, -100%) rotate(45deg);
            }
            100% {
              transform: translate(100%, 100%) rotate(45deg);
            }
          }
        `}</style>

        {/* Card Container */}
        <div
          className="card-shine rounded-2xl shadow-2xl overflow-hidden border-4"
          style={{
            borderColor: card.color,
            background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Top decorative band */}
          <div
            className="h-24 flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${card.color} 0%, ${adjustColor(card.color, -30)} 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.3),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.2),transparent)]" />
            </div>
            <div className="relative z-10 text-6xl animate-bounce">{card.icon}</div>
          </div>

          {/* Card content */}
          <div className="p-8 space-y-6">
            {/* Title */}
            <div>
              <h2
                className="text-3xl font-black text-center mb-2 drop-shadow-lg"
                style={{ color: card.color }}
              >
                {card.title}
              </h2>
              <div
                className="h-1 w-16 mx-auto rounded-full"
                style={{ backgroundColor: card.color }}
              />
            </div>

            {/* Card text with decorative frame */}
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-lg opacity-20"
                style={{ backgroundColor: card.color }}
              />
              <div className="relative bg-black/30 rounded-lg p-6 border-2 border-white/20">
                <p className="text-white text-center text-lg leading-relaxed font-semibold">
                  {card.text}
                </p>
              </div>
            </div>

            {/* Decorative corners */}
            <div className="flex justify-between text-2xl opacity-50">
              <span>✦</span>
              <span>✦</span>
              <span>✦</span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${card.color} 0%, ${adjustColor(card.color, -40)} 100%)`,
                boxShadow: `0 8px 20px ${card.color}40`,
              }}
            >
              Tamam! 🎲
            </button>
          </div>
        </div>

        {/* Card glow effect */}
        <div
          className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 -z-10"
          style={{ backgroundColor: card.color }}
        />
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
const adjustColor = (hex: string, amount: number): string => {
  const usePound = hex[0] === "#";
  const col = usePound ? hex.slice(1) : hex;
  const num = parseInt(col, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return (usePound ? "#" : "") + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
};

export default JumanjiCard;
