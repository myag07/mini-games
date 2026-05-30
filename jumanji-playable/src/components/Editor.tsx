import { useState } from "react";
import type { EffectType, GameConfig, Tile } from "../types";
import { EFFECT_META, JUMANJI_CARDS, buildTiles } from "../data/gameLogic";
import IsometricBoard from "./IsometricBoard";

interface Props {
  game: GameConfig;
  setGame: (g: GameConfig) => void;
}

const EFFECT_TYPES = Object.keys(EFFECT_META) as EffectType[];

export default function Editor({ game, setGame }: Props) {
  const [selected, setSelected] = useState<number | null>(0);

  const selTile = game.tiles.find((t) => t.index === selected) ?? null;

  const update = (patch: Partial<GameConfig>) => setGame({ ...game, ...patch });

  const resizeGrid = (cols: number, rows: number) => {
    const c = Math.max(2, Math.min(10, cols));
    const r = Math.max(2, Math.min(10, rows));
    const tiles = buildTiles(c, r, game.tiles);
    setGame({ ...game, cols: c, rows: r, tiles });
    if (selected !== null && selected >= c * r) setSelected(0);
  };

  const updateTile = (patch: Partial<Tile>) => {
    if (selected === null) return;
    const tiles = game.tiles.map((t) => (t.index === selected ? { ...t, ...patch } : t));
    setGame({ ...game, tiles });
  };

  const changeTileType = (type: EffectType) => {
    const meta = EFFECT_META[type];
    updateTile({
      type,
      label: meta.label,
      icon: meta.icon,
      color: meta.color,
      value: type === "forward" || type === "back" ? 2 : type === "teleport" ? 0 : undefined,
      cardText: type === "event" ? JUMANJI_CARDS[0] : undefined,
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/60 to-stone-950 p-2">
          <div className="aspect-[4/3] w-full">
            <IsometricBoard
              game={game}
              selectedIndex={selected}
              onSelect={(i) => setSelected(i)}
            />
          </div>
          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[11px] text-stone-300 backdrop-blur">
            Düzenlemek için bir kareye tıkla
          </p>
        </div>

        {/* Grid size */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
          <p className="mb-3 text-sm font-semibold text-stone-200">Tahta Boyutu</p>
          <div className="grid grid-cols-2 gap-4">
            {(["cols", "rows"] as const).map((dim) => (
              <div key={dim}>
                <label className="text-xs text-stone-400">
                  {dim === "cols" ? "Sütun" : "Satır"}: {game[dim]}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() =>
                      resizeGrid(
                        dim === "cols" ? game.cols - 1 : game.cols,
                        dim === "rows" ? game.rows - 1 : game.rows
                      )
                    }
                    className="h-8 w-8 rounded-lg bg-stone-800 text-lg text-white hover:bg-stone-700"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center font-mono text-white">{game[dim]}</span>
                  <button
                    onClick={() =>
                      resizeGrid(
                        dim === "cols" ? game.cols + 1 : game.cols,
                        dim === "rows" ? game.rows + 1 : game.rows
                      )
                    }
                    className="h-8 w-8 rounded-lg bg-stone-800 text-lg text-white hover:bg-stone-700"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-stone-500">Toplam {game.cols * game.rows} kare</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tile editor */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
          <p className="mb-3 flex items-center justify-between text-sm font-semibold text-stone-200">
            Kare Düzenle
            {selTile && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                #{selTile.index}
              </span>
            )}
          </p>
          {!selTile ? (
            <p className="text-sm text-stone-500">Bir kare seç.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-400">Tip</label>
                <div className="mt-1 grid grid-cols-3 gap-1.5">
                  {EFFECT_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => changeTileType(t)}
                      className={`rounded-lg border px-1 py-1.5 text-[11px] transition ${
                        selTile.type === t
                          ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                          : "border-stone-700 bg-stone-800 text-stone-300 hover:border-stone-500"
                      }`}
                      title={EFFECT_META[t].desc}
                    >
                      <span className="mr-0.5">{EFFECT_META[t].icon}</span>
                      {EFFECT_META[t].label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-stone-500">{EFFECT_META[selTile.type].desc}</p>
              </div>

              <div className="grid grid-cols-[1fr_64px] gap-2">
                <div>
                  <label className="text-xs text-stone-400">Etiket</label>
                  <input
                    value={selTile.label}
                    onChange={(e) => updateTile({ label: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400">Emoji</label>
                  <input
                    value={selTile.icon}
                    onChange={(e) => updateTile({ icon: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-center text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {(selTile.type === "forward" || selTile.type === "back" || selTile.type === "teleport") && (
                <div>
                  <label className="text-xs text-stone-400">
                    {selTile.type === "teleport" ? "Hedef Kare" : "Kare Sayısı"}
                  </label>
                  <input
                    type="number"
                    value={selTile.value ?? 0}
                    onChange={(e) => updateTile({ value: parseInt(e.target.value || "0", 10) })}
                    className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>
              )}

              {selTile.type === "event" && (
                <div>
                  <label className="text-xs text-stone-400">Macera Kartı Metni</label>
                  <textarea
                    value={selTile.cardText ?? ""}
                    onChange={(e) => updateTile({ cardText: e.target.value })}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-lg border border-stone-700 bg-stone-800 px-2 py-1.5 text-sm text-white outline-none focus:border-emerald-400"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">
                    İpucu: "3 ileri" / "2 geri" yaz, otomatik uygulanır.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs text-stone-400">Renk</label>
                <input
                  type="color"
                  value={selTile.color}
                  onChange={(e) => updateTile({ color: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer rounded-lg border border-stone-700 bg-stone-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Game meta */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
          <p className="mb-3 text-sm font-semibold text-stone-200">Oyun Ayarları</p>
          <div className="space-y-3">
            <Field label="Oyun Adı">
              <input
                value={game.name}
                onChange={(e) => update({ name: e.target.value })}
                className="ed-input"
              />
            </Field>
            <Field label="Tema">
              <input
                value={game.theme}
                onChange={(e) => update({ theme: e.target.value })}
                className="ed-input"
              />
            </Field>
            <Field label="Açıklama">
              <textarea
                value={game.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={2}
                className="ed-input resize-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Zar Yüzü">
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={game.diceSides}
                  onChange={(e) => update({ diceSides: Math.max(2, Math.min(12, +e.target.value || 6)) })}
                  className="ed-input"
                />
              </Field>
              <Field label="Oyuncu Sayısı">
                <input
                  type="number"
                  min={2}
                  max={4}
                  value={game.playerCount}
                  onChange={(e) => update({ playerCount: Math.max(2, Math.min(4, +e.target.value || 2)) })}
                  className="ed-input"
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-stone-400">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
