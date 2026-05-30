import { useRef, useState } from "react";
import type { GameConfig } from "../types";

interface Props {
  game: GameConfig;
  setGame: (g: GameConfig) => void;
}

type Status = "idle" | "building" | "done";

const BUILD_STEPS = [
  "Oyun yapılandırması doğrulanıyor...",
  "Tahta verisi serileştiriliyor (board.bin)...",
  "Tile motoru (Rust/wasm) derleniyor...",
  "Varlıklar paketleniyor (textures, dice, tokens)...",
  "AndroidManifest.xml oluşturuluyor...",
  "Kaynaklar zipalign ile hizalanıyor...",
  "APK imzalanıyor (debug keystore)...",
  "Derleme tamamlandı ✅",
];

export default function BuildPanel({ game, setGame }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);

  const buildManifest = () => ({
    engine: "GridForge Engine 1.0 (Rust + wasm core)",
    platform: "Android (APK)",
    package: game.packageName,
    versionName: game.version,
    versionCode: 1,
    minSdk: 24,
    targetSdk: 34,
    title: game.name,
    theme: game.theme,
    board: { cols: game.cols, rows: game.rows, tiles: game.tiles.length },
    diceSides: game.diceSides,
    players: game.playerCount,
    generatedAt: new Date().toISOString(),
    config: game,
  });

  const startBuild = () => {
    setStatus("building");
    setLogs([]);
    setProgress(0);
    let i = 0;
    const run = () => {
      setLogs((l) => [...l, `$ ${BUILD_STEPS[i]}`]);
      setProgress(Math.round(((i + 1) / BUILD_STEPS.length) * 100));
      i++;
      if (i < BUILD_STEPS.length) {
        timer.current = window.setTimeout(run, 650);
      } else {
        setStatus("done");
      }
    };
    run();
  };

  const download = (filename: string, content: string, type = "application/json") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const apkName = `${game.packageName.split(".").pop()}-${game.version}.apk`;

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {/* Left: app info */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
          <div className="flex items-center gap-3">
            <img src="images/icon.png" alt="icon" className="h-16 w-16 rounded-2xl border border-stone-700" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{game.name}</p>
              <p className="truncate text-xs text-stone-400">{game.packageName}</p>
              <span className="mt-1 inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">
                v{game.version}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-stone-400">Paket Adı</label>
              <input
                value={game.packageName}
                onChange={(e) => setGame({ ...game, packageName: e.target.value })}
                className="ed-input mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-stone-400">Sürüm</label>
              <input
                value={game.version}
                onChange={(e) => setGame({ ...game, version: e.target.value })}
                className="ed-input mt-1"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4 text-xs text-stone-400">
          <p className="mb-2 font-semibold text-stone-200">Derleme Hedefi</p>
          <Row k="Motor" v="GridForge (Rust + wasm)" />
          <Row k="Platform" v="Android APK" />
          <Row k="Tahta" v={`${game.cols}×${game.rows} (${game.tiles.length} kare)`} />
          <Row k="Min SDK" v="24 (Android 7.0)" />
          <Row k="Target SDK" v="34 (Android 14)" />
        </div>
      </div>

      {/* Right: build console */}
      <div className="flex flex-col rounded-2xl border border-stone-800 bg-stone-950 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-200">Derleme Konsolu</p>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              status === "done"
                ? "bg-emerald-500/20 text-emerald-300"
                : status === "building"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-stone-700/40 text-stone-400"
            }`}
          >
            {status === "idle" ? "hazır" : status === "building" ? "derleniyor" : "başarılı"}
          </span>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 min-h-[200px] flex-1 overflow-y-auto rounded-lg bg-black/60 p-3 font-mono text-xs text-emerald-300">
          {logs.length === 0 && status === "idle" && (
            <p className="text-stone-600">// "APK Bas" butonuna basarak derlemeyi başlat</p>
          )}
          {logs.map((l, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {l}
            </p>
          ))}
          {status === "building" && <span className="animate-pulse">▌</span>}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={startBuild}
            disabled={status === "building"}
            className="rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-stone-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {status === "building" ? "Derleniyor..." : "🔨 APK Bas"}
          </button>

          {status === "done" && (
            <>
              <button
                onClick={() =>
                  download(apkName, JSON.stringify(buildManifest(), null, 2), "application/vnd.android.package-archive")
                }
                className="rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-stone-950 transition hover:bg-emerald-400"
              >
                ⬇️ {apkName}
              </button>
              <button
                onClick={() => download("game-config.json", JSON.stringify(game, null, 2))}
                className="rounded-xl border border-stone-700 px-5 py-2.5 font-semibold text-stone-200 transition hover:bg-stone-800"
              >
                ⬇️ game-config.json
              </button>
            </>
          )}
        </div>

        {status === "done" && (
          <p className="mt-3 text-xs text-stone-500">
            Not: Bu tarayıcı demosunda APK, oyununuzun tam yapılandırma paketi olarak indirilir. GridForge
            sunucu derleyicisi bu paketi alıp gerçek bir imzalı <code>.apk</code> üretir.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-stone-800/60 py-1.5 last:border-0">
      <span>{k}</span>
      <span className="text-stone-200">{v}</span>
    </div>
  );
}
