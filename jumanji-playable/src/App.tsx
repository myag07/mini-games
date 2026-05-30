import { useEffect, useState } from "react";
import type { GameConfig } from "./types";
import { defaultGame, loadGame, saveGame } from "./data/gameLogic";
import IsometricBoard from "./components/IsometricBoard";
import PlayMode from "./components/PlayMode";
import Editor from "./components/Editor";
import BuildPanel from "./components/BuildPanel";

type View = "home" | "play" | "editor" | "build";

const TABS: { id: View; label: string; icon: string }[] = [
  { id: "play", label: "Oyna", icon: "🎮" },
  { id: "editor", label: "Tasarla", icon: "🛠️" },
  { id: "build", label: "APK Bas", icon: "📦" },
];

export default function App() {
  const [view, setView] = useState<View>("home");
  const [game, setGame] = useState<GameConfig>(loadGame);

  useEffect(() => {
    saveGame(game);
  }, [game]);

  const resetToDefault = () => setGame(defaultGame());

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-800/80 bg-stone-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button onClick={() => setView("home")} className="flex items-center gap-2">
            <img src="images/icon.png" alt="logo" className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-extrabold tracking-tight">
              gridforge<span className="text-emerald-400">games</span>
            </span>
          </button>
          <nav className="ml-auto flex items-center gap-1 rounded-xl bg-stone-900/70 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  view === t.id
                    ? "bg-emerald-500 text-stone-950"
                    : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                <span className="mr-1">{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {view === "home" ? (
        <Landing game={game} onStart={setView} />
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">
                {view === "play" ? "🎮 Oyna" : view === "editor" ? "🛠️ Oyun Tasarla" : "📦 APK Bas"}
              </h1>
              <p className="text-sm text-stone-400">
                {view === "play"
                  ? "Tasarladığın oyunu test et."
                  : view === "editor"
                  ? "Kareleri, kuralları ve temayı optimize et."
                  : "Oyununu Android paketine dönüştür."}
              </p>
            </div>
            {view === "editor" && (
              <button
                onClick={resetToDefault}
                className="rounded-lg border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-800"
              >
                ↺ Hazır Jumanji oyununa dön
              </button>
            )}
          </div>

          {view === "play" && <PlayMode key={JSON.stringify(game.tiles.length) + game.playerCount} game={game} />}
          {view === "editor" && <Editor game={game} setGame={setGame} />}
          {view === "build" && <BuildPanel game={game} setGame={setGame} />}
        </main>
      )}

      <footer className="border-t border-stone-800/80 py-6 text-center text-xs text-stone-500">
        gridforgegames · Board oyun motoru · Jumanji • Jenga • Snakes &amp; Ladders ilhamıyla
      </footer>
    </div>
  );
}

function Landing({ game, onStart }: { game: GameConfig; onStart: (v: View) => void }) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="images/hero.png"
          alt="hero"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/70 to-stone-950" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            🦁 Board Game Engine · Rust + wasm core
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Kendi <span className="text-emerald-400">Jumanji</span> tarzı oyununu tasarla, oyna ve{" "}
            <span className="text-amber-400">APK bas</span>.
          </h1>
          <p className="mt-4 max-w-xl text-stone-300">
            GridForge Games; izometrik tahta oyunları için bir tasarım stüdyosu ve oyun motorudur. Kareleri
            sürükle, tuzaklar ve macera kartları ekle, anında test et — sonra tek tıkla Android paketine dönüştür.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => onStart("play")}
              className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-stone-950 transition hover:bg-emerald-400"
            >
              🎮 Hazır Oyunu Oyna
            </button>
            <button
              onClick={() => onStart("editor")}
              className="rounded-xl border border-stone-600 bg-stone-900/60 px-6 py-3 font-semibold text-stone-100 transition hover:bg-stone-800"
            >
              🛠️ Oyun Tasarla
            </button>
          </div>
        </div>
      </section>

      {/* Featured game preview */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-6 rounded-3xl border border-stone-800 bg-stone-900/50 p-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/60 to-stone-950 p-2">
            <div className="aspect-[4/3]">
              <IsometricBoard game={game} />
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Hazır Oyun
            </span>
            <h2 className="mt-1 text-2xl font-bold">{game.name}</h2>
            <p className="mt-2 text-sm text-stone-400">{game.description}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-stone-300">
              <li>🎲 {game.diceSides} yüzlü zar · 👥 {game.playerCount} oyuncu</li>
              <li>🗺️ {game.cols}×{game.rows} izometrik tahta ({game.tiles.length} kare)</li>
              <li>🎴 Macera kartları, tuzaklar ve ışınlanma kareleri</li>
            </ul>
            <button
              onClick={() => onStart("editor")}
              className="mt-5 rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-stone-950 transition hover:bg-amber-400"
            >
              Bu oyunu optimize et →
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🛠️", t: "Görsel Tasarımcı", d: "İzometrik tahta üzerinde kareleri tıkla, tip/kural/renk ata. Jenga & Jumanji mantığı." },
            { icon: "🎮", t: "Anında Test", d: "Tasarladığın oyunu motorda doğrudan oyna; zar, hareket ve olaylar canlı çalışır." },
            { icon: "📦", t: "APK Bas", d: "Oyunu Rust tabanlı motorla paketle, imzalı Android APK olarak dışa aktar." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-bold">{f.t}</h3>
              <p className="mt-1 text-sm text-stone-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
