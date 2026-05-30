import type { EffectType, GameConfig, Tile } from "../types";

export const EFFECT_META: Record<
  EffectType,
  { label: string; icon: string; color: string; desc: string }
> = {
  start: { label: "Start", icon: "🏁", color: "#22c55e", desc: "Oyunun başladığı kare." },
  finish: { label: "Bitiş", icon: "🏆", color: "#f59e0b", desc: "İlk ulaşan oyunu kazanır." },
  safe: { label: "Güvenli", icon: "🌿", color: "#3f6212", desc: "Hiçbir şey olmaz, nefes al." },
  forward: { label: "İleri", icon: "⏩", color: "#0ea5e9", desc: "Oyuncu N kare ilerler." },
  back: { label: "Geri", icon: "⏪", color: "#ef4444", desc: "Oyuncu N kare geriler." },
  skip: { label: "Tur Kaybı", icon: "💤", color: "#a855f7", desc: "Sıradaki turu kaçırır." },
  teleport: { label: "Işınlanma", icon: "🌀", color: "#06b6d4", desc: "Belirtilen kareye ışınlanır." },
  event: { label: "Macera Kartı", icon: "🎴", color: "#d97706", desc: "Rastgele Jumanji olayı tetiklenir." },
  trap: { label: "Tuzak", icon: "🪤", color: "#b91c1c", desc: "Tehlike! Geri savrulursun." },
};

export const PLAYER_PRESETS = [
  { token: "🦁", color: "#f59e0b" },
  { token: "🐘", color: "#38bdf8" },
  { token: "🦏", color: "#a78bfa" },
  { token: "🐊", color: "#34d399" },
];

export const JUMANJI_CARDS = [
  "Bir aslan sürüsü peşinde! 2 kare geri kaç.",
  "Tropik yağmur başladı, zemin kaygan. Bu tur bekle.",
  "Gizli bir patika buldun, 3 kare ilerle.",
  "Maymunlar pusulanı çaldı. 1 kare geri.",
  "Cesur davrandın, zar tekrar at gibi 2 ileri.",
  "Quicksand! Bataklığa saplandın, yerinde kal.",
  "Bir kâşifin haritasını buldun, başlangıca yakın bir kestirme: 4 ileri.",
  "Dev örümcek ağı! 2 kare geri savruldun.",
];

const uid = () => Math.random().toString(36).slice(2, 9);

/** Snake (boustrophedon) layout: returns {col,row} for a given path index */
export function pathToGrid(index: number, cols: number) {
  const row = Math.floor(index / cols);
  const inRow = index % cols;
  const col = row % 2 === 0 ? inRow : cols - 1 - inRow;
  return { col, row };
}

export function buildTiles(cols: number, rows: number, prev: Tile[] = []): Tile[] {
  const total = cols * rows;
  const tiles: Tile[] = [];
  for (let i = 0; i < total; i++) {
    const existing = prev.find((t) => t.index === i);
    if (existing) {
      tiles.push(existing);
      continue;
    }
    let type: EffectType = "safe";
    if (i === 0) type = "start";
    else if (i === total - 1) type = "finish";
    const meta = EFFECT_META[type];
    tiles.push({
      id: uid(),
      index: i,
      type,
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
    });
  }
  return tiles;
}

export function makeTile(index: number, type: EffectType): Tile {
  const meta = EFFECT_META[type];
  return {
    id: uid(),
    index,
    type,
    label: meta.label,
    icon: meta.icon,
    color: meta.color,
    value: type === "forward" || type === "back" ? 2 : type === "teleport" ? 0 : undefined,
    cardText: type === "event" ? JUMANJI_CARDS[0] : undefined,
  };
}

export function defaultGame(): GameConfig {
  const cols = 6;
  const rows = 5;
  const tiles = buildTiles(cols, rows);

  // Sprinkle Jumanji-style events into the default playable game
  const set = (index: number, type: EffectType, extra: Partial<Tile> = {}) => {
    const t = tiles.find((x) => x.index === index);
    if (!t) return;
    const meta = EFFECT_META[type];
    Object.assign(t, {
      type,
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
      ...extra,
    });
  };

  set(3, "event", { cardText: JUMANJI_CARDS[2] });
  set(6, "forward", { value: 2, label: "Liana ile sallan" });
  set(9, "trap", { label: "Bataklık" });
  set(11, "event", { cardText: JUMANJI_CARDS[0] });
  set(14, "skip", { label: "Yağmur Fırtınası" });
  set(17, "teleport", { value: 8, label: "Tapınak Geçidi" });
  set(20, "event", { cardText: JUMANJI_CARDS[5] });
  set(23, "back", { value: 3, label: "Aslan Saldırısı" });
  set(26, "forward", { value: 3, label: "Kâşif Patikası" });
  set(28, "event", { cardText: JUMANJI_CARDS[3] });

  return {
    id: uid(),
    name: "Jumanji: Vahşi Geçit",
    theme: "Tropik Orman Macerası",
    description:
      "Klasik Jumanji ruhunda bir yarış oyunu. Zar at, kareleri kat et, macera kartlarına ve tuzaklara dikkat ederek bitişe ilk ulaşan ol!",
    cols,
    rows,
    diceSides: 6,
    playerCount: 2,
    accent: "#34d399",
    tiles,
    packageName: "com.gridforge.jumanji",
    version: "1.0.0",
    updatedAt: Date.now(),
  };
}

const STORAGE_KEY = "gridforge.game.v1";

export function loadGame(): GameConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as GameConfig;
  } catch {
    /* ignore */
  }
  return defaultGame();
}

export function saveGame(game: GameConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...game, updatedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}
