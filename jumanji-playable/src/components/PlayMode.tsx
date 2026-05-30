import { useMemo, useRef, useState } from "react";
import type { GameConfig, Player } from "../types";
import { JUMANJI_CARDS, PLAYER_PRESETS } from "../data/gameLogic";
import IsometricBoard from "./IsometricBoard";
import GridBoard from "./GridBoard";
import GridBoardEnhanced from "./GridBoardEnhanced";
import JumanjiCard from "./JumanjiCard";

interface Props {
  game: GameConfig;
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function PlayMode({ game }: Props) {
  const total = game.tiles.length;
  const initPlayers = (): Player[] =>
    Array.from({ length: game.playerCount }, (_, i) => ({
      id: i,
      name: `Oyuncu ${i + 1}`,
      position: 0,
      color: PLAYER_PRESETS[i % PLAYER_PRESETS.length].color,
      token: PLAYER_PRESETS[i % PLAYER_PRESETS.length].token,
      skipNext: false,
      finished: false,
    }));

  const [players, setPlayers] = useState<Player[]>(initPlayers);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>(["🎲 Macera başladı! İyi şanslar."]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [boardMode, setBoardMode] = useState<'grid' | 'isometric'>('grid');
  const [currentCard, setCurrentCard] = useState<{ title: string; text: string; icon: string; color: string } | null>(null);
  const [showCard, setShowCard] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const current = players[turn];

  const addLog = (msg: string) => setLog((l) => [msg, ...l].slice(0, 40));

  const findTile = (idx: number) => game.tiles.find((t) => t.index === idx);

  const advanceTurn = (ps: Player[]) => {
    let next = turn;
    for (let k = 0; k < ps.length; k++) {
      next = (next + 1) % ps.length;
      if (!ps[next].finished) break;
    }
    setTurn(next);
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const applyEffect = async (ps: Player[], pIndex: number): Promise<Player[]> => {
    const p = ps[pIndex];
    const tile = findTile(p.position);
    if (!tile) return ps;
    let moved = false;

    switch (tile.type) {
      case "forward": {
        const n = tile.value ?? 2;
        p.position = Math.min(total - 1, p.position + n);
        addLog(`${p.token} ${tile.label}: ${n} kare ilerledi!`);
        moved = true;
        break;
      }
      case "back": {
        const n = tile.value ?? 2;
        p.position = Math.max(0, p.position - n);
        addLog(`${p.token} ${tile.label}: ${n} kare geriledi!`);
        moved = true;
        break;
      }
      case "trap": {
        p.position = Math.max(0, p.position - 2);
        addLog(`🪤 ${p.token} tuzağa düştü! 2 kare geri.`);
        moved = true;
        break;
      }
      case "skip": {
        p.skipNext = true;
        addLog(`💤 ${p.token} ${tile.label}: sıradaki turunu kaçıracak.`);
        break;
      }
      case "teleport": {
        const target = Math.max(0, Math.min(total - 1, tile.value ?? 0));
        p.position = target;
        addLog(`🌀 ${p.token} ${tile.label} ile ${target}. kareye ışınlandı!`);
        moved = true;
        break;
      }
      case "event": {
        const text = tile.cardText || JUMANJI_CARDS[Math.floor(Math.random() * JUMANJI_CARDS.length)];
        const cardTitle = text.split(':')[0] || 'MACERA KARTI';
        setCurrentCard({
          title: cardTitle,
          text: text,
          icon: tile.icon,
          color: tile.color
        });
        setShowCard(true);
        addLog(`🎴 Macera Kartı: ${text}`);
        const m = text.match(/(\d+)\s*(kare)?\s*(ileri|geri)/i);
        if (m) {
          const n = parseInt(m[1], 10);
          if (/ileri/i.test(m[3])) p.position = Math.min(total - 1, p.position + n);
          else p.position = Math.max(0, p.position - n);
          moved = true;
        } else if (/bekle|kal/i.test(text)) {
          p.skipNext = true;
        }
        break;
      }
      default:
        break;
    }

    if (moved) {
      setPlayers([...ps]);
      await sleep(450);
      // chain effect of the new tile (but avoid infinite loop for event/teleport)
      const landed = findTile(p.position);
      if (landed && (landed.type === "forward" || landed.type === "back" || landed.type === "trap")) {
        return applyEffect(ps, pIndex);
      }
    }
    return ps;
  };

  const roll = async () => {
    if (busy || winner) return;
    setBusy(true);

    // skip turn check
    if (current.skipNext) {
      addLog(`💤 ${current.token} bu turu kaçırıyor.`);
      const ps = [...players];
      ps[turn].skipNext = false;
      setPlayers(ps);
      await sleep(600);
      advanceTurn(ps);
      setBusy(false);
      return;
    }

    setRolling(true);
    for (let i = 0; i < 10; i++) {
      setDice(Math.floor(Math.random() * game.diceSides) + 1);
      await sleep(55);
    }
    const value = Math.floor(Math.random() * game.diceSides) + 1;
    setDice(value);
    setRolling(false);
    addLog(`🎲 ${current.token} ${value} attı.`);
    await sleep(300);

    const ps = players.map((p) => ({ ...p }));
    const me = ps[turn];

    // step movement
    let steps = value;
    while (steps > 0 && me.position < total - 1) {
      me.position += 1;
      steps -= 1;
      setPlayers([...ps]);
      await sleep(200);
    }

    if (me.position >= total - 1) {
      me.position = total - 1;
      me.finished = true;
      setPlayers([...ps]);
      addLog(`🏆 ${me.name} bitişe ulaştı ve KAZANDI!`);
      setWinner(me);
      setBusy(false);
      return;
    }

    await applyEffect(ps, turn);

    if (ps[turn].position >= total - 1) {
      ps[turn].finished = true;
      setPlayers([...ps]);
      addLog(`🏆 ${ps[turn].name} bitişe ulaştı ve KAZANDI!`);
      setWinner(ps[turn]);
      setBusy(false);
      return;
    }

    setPlayers([...ps]);
    advanceTurn(ps);
    setBusy(false);
  };

  const reset = () => {
    setPlayers(initPlayers());
    setTurn(0);
    setDice(null);
    setWinner(null);
    setShowCard(false);
    setCurrentCard(null);
    setLog(["🎲 Yeni macera başladı!"]);
  };

  const leaderboard = useMemo(
    () => [...players].sort((a, b) => b.position - a.position),
    [players]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/60 to-stone-950 p-2 shadow-inner">
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur">
          {game.name}
        </div>
        <div className="aspect-[4/3] w-full flex flex-col">
          <div className="flex gap-2 mb-2 justify-end">
            <button
              onClick={() => setBoardMode('grid')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                boardMode === 'grid'
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-stone-700 text-stone-200 hover:bg-stone-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setBoardMode('isometric')}
              className={`px-3 py-1 rounded text-xs font-semibold transition ${
                boardMode === 'isometric'
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-stone-700 text-stone-200 hover:bg-stone-600'
              }`}
            >
              İzometrik
            </button>
          </div>
          <div className="flex-1">
            {boardMode === 'grid' ? (
              <GridBoardEnhanced game={game} players={players} highlight={current?.position} />
            ) : (
              <IsometricBoard game={game} players={players} highlight={current?.position} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
          {winner ? (
            <div className="text-center">
              <div className="text-4xl">🏆</div>
              <p className="mt-2 font-bold text-amber-300">{winner.name} kazandı!</p>
              <button
                onClick={reset}
                className="mt-3 w-full rounded-xl bg-emerald-500 py-2.5 font-semibold text-stone-950 transition hover:bg-emerald-400"
              >
                Tekrar Oyna
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-stone-400">Sıra</span>
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-sm"
                    style={{ background: current?.color }}
                  >
                    {current?.token}
                  </span>
                  {current?.name}
                </span>
              </div>
              <div className="my-3 flex items-center justify-center">
                <div
                  className={`grid h-20 w-20 place-items-center rounded-2xl bg-stone-950 text-5xl text-emerald-300 shadow-inner transition ${
                    rolling ? "animate-pulse" : ""
                  }`}
                >
                  {dice ? (game.diceSides === 6 ? DICE_FACES[dice - 1] : dice) : "🎲"}
                </div>
              </div>
              <button
                onClick={roll}
                disabled={busy}
                className="w-full rounded-xl bg-amber-500 py-2.5 font-bold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "..." : current?.skipNext ? "Turu Geç 💤" : "Zar At 🎲"}
              </button>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Sıralama</p>
          <div className="space-y-1.5">
            {leaderboard.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-sm">
                <span className="grid h-6 w-6 place-items-center rounded-full text-xs" style={{ background: p.color }}>
                  {p.token}
                </span>
                <span className="text-stone-200">{p.name}</span>
                <span className="ml-auto text-stone-400">
                  {p.finished ? "🏁" : `${p.position}/${total - 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-stone-800 bg-stone-900/70 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Olay Günlüğü</p>
          <div ref={logRef} className="max-h-44 space-y-1.5 overflow-y-auto pr-1 text-xs text-stone-300">
            {log.map((l, i) => (
              <p key={i} className={i === 0 ? "text-emerald-200" : ""}>
                {l}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Jumanji Card Modal */}
      <JumanjiCard
        card={currentCard || undefined}
        isOpen={showCard}
        onClose={() => setShowCard(false)}
      />
    </div>
  );
}
