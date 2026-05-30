import React, { useMemo } from "react";
import type { GameConfig, Player } from "../types";
import { pathToGrid } from "../data/gameLogic";
import TexturedTile from "./TexturedTile";
import PlayerToken from "./PlayerToken";

interface Props {
  game: GameConfig;
  players?: Player[];
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  highlight?: number | null;
}

const TILE_SIZE = 70;
const GRID_GAP = 3;

export default function GridBoardEnhanced({
  game,
  players = [],
  selectedIndex,
  onSelect,
  highlight,
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

  return (
    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div
        className="relative rounded-2xl shadow-2xl"
        style={{
          width: gridWidth,
          height: gridHeight,
          padding: GRID_GAP,
          background: "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.9) 100%)",
          border: "3px solid rgba(100,116,139,0.5)",
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            padding: GRID_GAP,
            display: "grid",
            gridTemplateColumns: `repeat(${game.cols}, 1fr)`,
            gridTemplateRows: `repeat(${game.rows}, 1fr)`,
            gap: GRID_GAP,
          }}
        >
          {positions.map(({ index }) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg opacity-20"
            />
          ))}
        </div>

        {/* Tiles with Players */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            padding: GRID_GAP,
            display: "grid",
            gridTemplateColumns: `repeat(${game.cols}, 1fr)`,
            gridTemplateRows: `repeat(${game.rows}, 1fr)`,
            gap: GRID_GAP,
          }}
        >
          {positions.map(({ tile, col, row, index }) => {
            const playersHere = playersByPos.get(index) || [];
            const isSel = selectedIndex === index;
            const isHi = highlight === index;

            return (
              <div
                key={tile.id}
                className="relative group"
                onClick={() => onSelect?.(index)}
              >
                {/* Tile */}
                <div className="w-full h-full">
                  <TexturedTile
                    color={tile.color}
                    icon={tile.icon}
                    label={tile.label}
                    textureType={getTextureType(tile.type)}
                    isSelected={isSel}
                    isHighlighted={isHi}
                    onClick={() => onSelect?.(index)}
                  />
                </div>

                {/* Players on this tile */}
                {playersHere.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex gap-1 flex-wrap justify-center items-center">
                      {playersHere.map((player, idx) => (
                        <div
                          key={player.id}
                          className="transform hover:scale-110 transition-transform"
                          style={{
                            zIndex: playersHere.length - idx,
                          }}
                        >
                          <PlayerToken
                            token={player.token}
                            color={player.color}
                            name={player.name}
                            isFinished={player.finished}
                            size={playersHere.length > 1 ? "sm" : "md"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tooltip on hover */}
                {tile.cardText && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <div className="bg-black/90 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                      {tile.cardText}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Decorative border */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            border: "2px solid rgba(148,163,184,0.3)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );
}
