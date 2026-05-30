import React, { useMemo } from "react";
import type { GameConfig, Player } from "../types";
import { pathToGrid } from "../data/gameLogic";
import TexturedTile from "./TexturedTile";

interface Props {
  game: GameConfig;
  players?: Player[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  highlight?: number | null;
  mode?: "isometric" | "grid";
}

const TILE_SIZE = 60;
const GRID_GAP = 2;

export default function GridBoard({
  game,
  players = [],
  selectedIndex,
  onSelect,
  highlight,
  mode = "grid",
}: Props) {
  const positions = useMemo(() => {
    return game.tiles.map((t) => {
      const { col, row } = pathToGrid(t.index, game.cols);
      return { tile: t, col, row, index: t.index };
    });
  }, [game.tiles, game.cols]);

  const playersByPos = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach((p) => {
      const arr = map.get(p.position) ?? [];
      arr.push(p);
      map.set(p.position, arr);
    });
    return map;
  }, [players]);

  const gridWidth = game.cols * (TILE_SIZE + GRID_GAP) + GRID_GAP;
  const gridHeight = game.rows * (TILE_SIZE + GRID_GAP) + GRID_GAP;

  // Determine texture type based on tile type
  const getTextureType = (
    tileType: string
  ): "marble" | "wood" | "stone" | "fabric" | "metal" | "plain" => {
    switch (tileType) {
      case "start":
      case "finish":
        return "marble";
      case "forward":
      case "back":
        return "wood";
      case "trap":
      case "skip":
        return "stone";
      case "teleport":
        return "metal";
      case "event":
        return "fabric";
      default:
        return "plain";
    }
  };

  if (mode === "grid") {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div
          className="relative bg-slate-700 rounded-lg shadow-2xl"
          style={{
            width: gridWidth,
            height: gridHeight,
            padding: GRID_GAP,
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 grid rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${game.cols}, 1fr)`,
              gridTemplateRows: `repeat(${game.rows}, 1fr)`,
              gap: GRID_GAP,
              padding: GRID_GAP,
            }}
          >
            {positions.map(({ index }) => (
              <div key={index} className="bg-slate-600 rounded opacity-30" />
            ))}
          </div>

          {/* Tiles */}
          <div
            className="absolute inset-0 grid rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${game.cols}, 1fr)`,
              gridTemplateRows: `repeat(${game.rows}, 1fr)`,
              gap: GRID_GAP,
              padding: GRID_GAP,
            }}
          >
            {positions.map(({ tile, col, row, index }) => {
              const playersHere = playersByPos.get(index) || [];
              const isSel = selectedIndex === index;
              const isHi = highlight === index;

              return (
                <div key={tile.id} className="relative">
                  <TexturedTile
                    color={tile.color}
                    icon={tile.icon}
                    label={tile.label}
                    textureType={getTextureType(tile.type)}
                    isSelected={isSel}
                    isHighlighted={isHi}
                    onClick={() => onSelect?.(index)}
                  />

                  {/* Players on this tile */}
                  {playersHere.length > 0 && (
                    <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                      {playersHere.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white text-xs font-bold"
                          style={{
                            backgroundColor: player.color,
                            boxShadow: `0 0 6px ${player.color}`,
                          }}
                          title={player.name}
                        >
                          {player.token}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Isometric mode (original)
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 800 600"
        className="h-full w-full select-none"
        style={{ maxHeight: "100%" }}
      >
        <defs>
          <filter id="tileShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        {positions.map(({ tile, col, row, index }) => {
          const playersHere = playersByPos.get(index) || [];
          const isSel = selectedIndex === index;
          const isHi = highlight === index;

          const TW = 84;
          const TH = 42;
          const offsetX = 100;
          const offsetY = 50;

          const cx = offsetX + (col - row) * (TW / 2);
          const cy = offsetY + (col + row) * (TH / 2);

          return (
            <g key={tile.id} onClick={() => onSelect?.(index)}>
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                fontSize="24"
                fill={tile.color}
              >
                {tile.icon}
              </text>
              {playersHere.map((player, idx) => (
                <circle
                  key={player.id}
                  cx={cx + 20 + idx * 15}
                  cy={cy + 20}
                  r="8"
                  fill={player.color}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
