export type EffectType =
  | "start"
  | "finish"
  | "safe"
  | "forward"
  | "back"
  | "skip"
  | "teleport"
  | "event"
  | "trap";

export interface Tile {
  id: string;
  /** order in the path, 0 = start */
  index: number;
  type: EffectType;
  label: string;
  /** emoji shown on the tile */
  icon: string;
  /** tailwind-ish hex color for the tile top */
  color: string;
  /** amount used by forward/back, or target index for teleport */
  value?: number;
  /** card text for event tiles (Jumanji style) */
  cardText?: string;
}

export interface GameConfig {
  id: string;
  name: string;
  theme: string;
  description: string;
  cols: number;
  rows: number;
  diceSides: number;
  playerCount: number;
  accent: string;
  tiles: Tile[];
  packageName: string;
  version: string;
  updatedAt: number;
}

export interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  token: string;
  skipNext: boolean;
  finished: boolean;
}
