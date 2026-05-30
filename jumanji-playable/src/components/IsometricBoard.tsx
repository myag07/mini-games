import { useMemo } from "react";
import type { GameConfig, Player } from "../types";
import { pathToGrid } from "../data/gameLogic";

interface Props {
  game: GameConfig;
  players?: Player[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  highlight?: number | null;
}

const TW = 84;
const TH = 42;
const DEPTH = 22;

function shade(hex: string, amt: number) {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r + amt)));
  g = Math.max(0, Math.min(255, Math.round(g + amt)));
  b = Math.max(0, Math.min(255, Math.round(b + amt)));
  return `rgb(${r},${g},${b})`;
}

export default function IsometricBoard({ game, players = [], selectedIndex, onSelect, highlight }: Props) {
  const layout = useMemo(() => {
    const margin = 28;
    const offsetX = (game.rows - 1) * (TW / 2) + margin;
    const offsetY = margin;
    const width = (game.cols - 1 + game.rows - 1) * (TW / 2) + TW + margin * 2;
    const height = (game.cols - 1 + game.rows - 1) * (TH / 2) + TH + DEPTH + margin * 2;
    return { offsetX, offsetY, width, height };
  }, [game.cols, game.rows]);

  const positions = useMemo(() => {
    return game.tiles.map((t) => {
      const { col, row } = pathToGrid(t.index, game.cols);
      const cx = layout.offsetX + (col - row) * (TW / 2);
      const cy = layout.offsetY + (col + row) * (TH / 2);
      return { tile: t, col, row, cx, cy, diag: col + row };
    });
  }, [game.tiles, game.cols, layout]);

  const drawOrder = useMemo(
    () => [...positions].sort((a, b) => a.diag - b.diag || a.row - b.row),
    [positions]
  );

  const playersByPos = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach((p) => {
      const arr = map.get(p.position) ?? [];
      arr.push(p);
      map.set(p.position, arr);
    });
    return map;
  }, [players]);

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className="h-full w-full select-none"
      style={{ maxHeight: "100%" }}
    >
      <defs>
        <filter id="tileShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      {drawOrder.map(({ tile, cx, cy }) => {
        const top = `${cx},${cy} ${cx + TW / 2},${cy + TH / 2} ${cx},${cy + TH} ${cx - TW / 2},${cy + TH / 2}`;
        const leftFace = `${cx - TW / 2},${cy + TH / 2} ${cx},${cy + TH} ${cx},${cy + TH + DEPTH} ${cx - TW / 2},${cy + TH / 2 + DEPTH}`;
        const rightFace = `${cx},${cy + TH} ${cx + TW / 2},${cy + TH / 2} ${cx + TW / 2},${cy + TH / 2 + DEPTH} ${cx},${cy + TH + DEPTH}`;
        const isSel = selectedIndex === tile.index;
        const isHi = highlight === tile.index;
        return (
          <g
            key={tile.id}
            onClick={() => onSelect?.(tile.index)}
            className={onSelect ? "cursor-pointer" : ""}
            style={{ transition: "transform .15s", transform: isSel ? `translateY(-6px)` : undefined }}
          >
            <polygon points={leftFace} fill={shade(tile.color, -55)} />
            <polygon points={rightFace} fill={shade(tile.color, -90)} />
            <polygon
              points={top}
              fill={isHi ? shade(tile.color, 50) : tile.color}
              stroke={isSel ? "#fff" : shade(tile.color, -30)}
              strokeWidth={isSel ? 2.5 : 1}
            />
            <text
              x={cx}
              y={cy + TH / 2 - 6}
              textAnchor="middle"
              fontSize="17"
              style={{ pointerEvents: "none" }}
            >
              {tile.icon}
            </text>
            <text
              x={cx}
              y={cy + TH / 2 + 11}
              textAnchor="middle"
              fontSize="9"
              fill="#fff"
              fontWeight="700"
              style={{ pointerEvents: "none" }}
            >
              {tile.index}
            </text>
          </g>
        );
      })}

      {drawOrder.map(({ tile, cx, cy }) => {
        const list = playersByPos.get(tile.index);
        if (!list || list.length === 0) return null;
        return list.map((p, i) => {
          const ox = (i - (list.length - 1) / 2) * 16;
          return (
            <g key={p.id} style={{ transition: "all .35s ease" }}>
              <ellipse cx={cx + ox} cy={cy + TH / 2 + 2} rx="11" ry="6" fill="#000" opacity="0.3" />
              <circle cx={cx + ox} cy={cy + TH / 2 - 14} r="11" fill={p.color} stroke="#fff" strokeWidth="2" />
              <text
                x={cx + ox}
                y={cy + TH / 2 - 9}
                textAnchor="middle"
                fontSize="13"
                style={{ pointerEvents: "none" }}
              >
                {p.token}
              </text>
            </g>
          );
        });
      })}
    </svg>
  );
}
