import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Hammer, Play, Dice1, Download, Edit3, RotateCw, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tile {
  x: number;
  y: number;
  type: 'grass' | 'path' | 'river' | 'trap' | 'temple';
  effect?: string;
}

interface Piece {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  emoji: string;
}

interface GameCard {
  id: string;
  title: string;
  text: string;
  icon: string;
  color: string;
  effect: 'move-forward' | 'move-back' | 'lose-turn' | 'extra-turn' | 'wild';
}

const BOARD_SIZE = 7;
const TILE_COLORS = {
  grass: '#166534',
  path: '#854d0e',
  river: '#0369a1',
  trap: '#9f1239',
  temple: '#451a03',
};

const DEFAULT_CARDS: GameCard[] = [
  { id: 'c1', title: "MONKEY MAYHEM", text: "A troop of monkeys steals your supplies! Move back 3 spaces.", icon: "🐒", color: "#eab308", effect: 'move-back' },
  { id: 'c2', title: "RHINO CHARGE", text: "Stampeding rhinos ahead! All players move back 2 spaces.", icon: "🦏", color: "#b91c1c", effect: 'move-back' },
  { id: 'c3', title: "ANCIENT IDOL", text: "You found a golden idol. Advance 4 spaces and gain a point!", icon: "🏆", color: "#ca8a04", effect: 'move-forward' },
  { id: 'c4', title: "QUICKSAND", text: "You fell into quicksand. Lose your next turn.", icon: "🏜️", color: "#854d0e", effect: 'lose-turn' },
  { id: 'c5', title: "JUNGLE VINES", text: "Swing across the vines. Take an extra turn!", icon: "🌿", color: "#16a34a", effect: 'extra-turn' },
  { id: 'c6', title: "VOLCANO ERUPTS", text: "The volcano awakens! Everyone moves back 1 space.", icon: "🌋", color: "#b45309", effect: 'move-back' },
];

const DEFAULT_PIECES: Piece[] = [
  { id: 'p1', name: 'Alex', color: '#22c55e', x: 0, y: 6, emoji: '🧭' },
  { id: 'p2', name: 'Sam', color: '#a855f7', x: 1, y: 6, emoji: '🏹' },
  { id: 'p3', name: 'Jordan', color: '#f59e0b', x: 0, y: 5, emoji: '🔦' },
];

export default function App() {
  const [mode, setMode] = useState<'design' | 'play'>('design');
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const initial: Tile[] = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        let type: Tile['type'] = 'grass';
        if (y === 6 && x <= 3) type = 'path';
        if (y === 3 && x >= 2 && x <= 5) type = 'path';
        if (x === 3 && y >= 1 && y <= 4) type = 'path';
        if (x === 5 && y === 1) type = 'temple';
        if ((x === 2 && y === 2) || (x === 4 && y === 4)) type = 'trap';
        if (x === 4 && y === 2) type = 'river';
        initial.push({ x, y, type });
      }
    }
    return initial;
  });

  const [pieces, setPieces] = useState<Piece[]>(DEFAULT_PIECES);
  const [cards, setCards] = useState<GameCard[]>(DEFAULT_CARDS);
  const [selectedTile, setSelectedTile] = useState<{x: number, y: number} | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameLog, setGameLog] = useState<string[]>([
    "Welcome to JUNGLE PERIL - The Jumanji Edition",
    "Reach the Temple to win!"
  ]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [boardName, setBoardName] = useState("Jungle Peril");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tileTypes = ['grass', 'path', 'river', 'trap', 'temple'] as const;

  const getTileAt = (x: number, y: number) => {
    return tiles.find(t => t.x === x && t.y === y);
  };

  const updateTile = (x: number, y: number, newType: Tile['type']) => {
    setTiles(prev => prev.map(tile => 
      tile.x === x && tile.y === y ? { ...tile, type: newType } : tile
    ));
    setSelectedTile({ x, y });
  };

  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 560;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#052e16';
    ctx.fillRect(0, 0, size, size);

    const tileW = 52;
    const tileH = 52;
    const offsetX = 60;
    const offsetY = 35;

    // Draw isometric tiles
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const tile = getTileAt(x, y);
        if (!tile) continue;

        const screenX = offsetX + (x - y) * (tileW / 2);
        const screenY = offsetY + (x + y) * (tileH / 4) + 20;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY + 26);
        ctx.lineTo(screenX + tileW / 2 + 4, screenY + tileH / 2 + 22);
        ctx.lineTo(screenX + tileW + 4, screenY + 26);
        ctx.fill();

        // Main tile
        ctx.fillStyle = TILE_COLORS[tile.type];
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + tileW / 2, screenY + tileH / 2);
        ctx.lineTo(screenX + tileW, screenY);
        ctx.lineTo(screenX + tileW / 2, screenY - tileH / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Highlight for path / special
        if (tile.type === 'path') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
          ctx.fill();
        }
        if (tile.type === 'temple') {
          ctx.fillStyle = '#fcd34d';
          ctx.font = 'bold 28px serif';
          ctx.textAlign = 'center';
          ctx.fillText('⛩️', screenX + tileW / 2, screenY + 8);
        }
        if (tile.type === 'trap') {
          ctx.fillStyle = '#f87171';
          ctx.font = '20px sans-serif';
          ctx.fillText('⚠️', screenX + tileW / 2 - 2, screenY + 9);
        }
        if (tile.type === 'river') {
          ctx.strokeStyle = '#67e8f9';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(screenX + 12, screenY - 4);
          ctx.quadraticCurveTo(screenX + tileW / 2, screenY + 18, screenX + tileW - 12, screenY - 4);
          ctx.stroke();
        }

        // Grid label
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${x},${y}`, screenX + tileW / 2, screenY + 34);
      }
    }

    // Draw pieces
    pieces.forEach((piece, index) => {
      const tile = getTileAt(piece.x, piece.y);
      if (!tile) return;

      const screenX = offsetX + (piece.x - piece.y) * (tileW / 2);
      const screenY = offsetY + (piece.x + piece.y) * (tileH / 4) + 20;

      // Piece shadow
      ctx.save();
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 8;

      ctx.fillStyle = piece.color;
      ctx.beginPath();
      ctx.arc(screenX + tileW / 2 - 4, screenY + 4, 19, 0, Math.PI * 2);
      ctx.fill();

      // Border glow
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(screenX + tileW / 2 - 4, screenY + 4, 19, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Emoji
      ctx.font = 'bold 26px serif';
      ctx.textAlign = 'center';
      ctx.fillText(piece.emoji, screenX + tileW / 2 - 4, screenY + 12);
      
      // Player number
      ctx.fillStyle = '#fff';
      ctx.font = '700 11px monospace';
      ctx.fillText((index + 1).toString(), screenX + tileW / 2 - 4, screenY + 32);
    });

    // Finish line decoration
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    const finishX = offsetX + (5 - 1) * (tileW / 2);
    const finishY = offsetY + (5 + 1) * (tileH / 4) + 20;
    ctx.rect(finishX + 10, finishY - 34, tileW * 0.8, 52);
    ctx.stroke();
    ctx.setLineDash([]);

  }, [tiles, pieces]);

  useEffect(() => {
    drawBoard();
  }, [drawBoard]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const tileW = 52;
    const tileH = 52;
    const offsetX = 60;
    const offsetY = 35;

    // Approximate inverse projection for click
    let bestMatch: {x: number, y: number, dist: number} | null = null;

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const screenX = offsetX + (x - y) * (tileW / 2);
        const screenY = offsetY + (x + y) * (tileH / 4) + 20;
        
        const dx = clickX - (screenX + tileW / 2);
        const dy = clickY - screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!bestMatch || dist < bestMatch.dist) {
          bestMatch = { x, y, dist };
        }
      }
    }

    if (bestMatch && bestMatch.dist < 38) {
      const { x, y } = bestMatch;
      const currentTile = getTileAt(x, y);
      
      if (mode === 'design') {
        const currentIndex = tileTypes.indexOf(currentTile?.type || 'grass');
        const nextType = tileTypes[(currentIndex + 1) % tileTypes.length];
        updateTile(x, y, nextType);
      } else {
        // In play mode select piece near location
        const nearbyPiece = pieces.find(p => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1);
        if (nearbyPiece) {
          setSelectedPieceId(nearbyPiece.id);
        }
      }
    }
  };

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setDiceRoll(null);

    let rolls = 0;
    const interval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 12) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 4; // biased to higher
        setDiceRoll(finalRoll);
        setIsRolling(false);
        
        // Move current player
        const currentPiece = pieces[currentPlayerIndex];
        if (currentPiece) {
          let newX = Math.min(BOARD_SIZE - 1, currentPiece.x + Math.floor(finalRoll / 2));
          let newY = Math.max(0, currentPiece.y - Math.floor(finalRoll / 3));
          
          // Path snapping logic
          if (newX > 5) newX = 5;
          if (newY < 1 && newX > 3) newY = 1;
          
          setPieces(prev => prev.map((p, i) => 
            i === currentPlayerIndex 
              ? { ...p, x: Math.max(0, Math.min(6, newX)), y: Math.max(0, Math.min(6, newY)) } 
              : p
          ));

          const newLog = [...gameLog, `${currentPiece.name} rolled a ${finalRoll} and advanced through the jungle!`];
          setGameLog(newLog.length > 7 ? newLog.slice(-6) : newLog);

          // Check win
          if (newX >= 5 && newY <= 1) {
            setTimeout(() => {
              setGameLog(prev => [...prev, `🎉 ${currentPiece.name} REACHED THE TEMPLE AND WINS!!!`]);
            }, 600);
          } else {
            // Auto draw a card occasionally
            if (Math.random() > 0.5) {
              setTimeout(() => drawRandomCard(), 900);
            } else {
              // Next player
              setCurrentPlayerIndex((currentPlayerIndex + 1) % pieces.length);
            }
          }
        }
      }
    }, 60);
  };

  const drawRandomCard = () => {
    if (cards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * cards.length);
    const drawn = cards[randomIndex];
    setCurrentCard(drawn);
    setIsCardModalOpen(true);

    // Apply simple effect
    setTimeout(() => {
      const currentPiece = pieces[currentPlayerIndex];
      if (!currentPiece || !drawn) return;

      let deltaX = 0;
      let deltaY = 0;

      switch (drawn.effect) {
        case 'move-forward':
          deltaX = 2;
          deltaY = -1;
          break;
        case 'move-back':
          deltaX = -2;
          deltaY = 1;
          break;
        case 'lose-turn':
          setGameLog(prev => [...prev, `${currentPiece.name} lost their turn!`]);
          setCurrentPlayerIndex((currentPlayerIndex + 1) % pieces.length);
          return;
        case 'extra-turn':
          setGameLog(prev => [...prev, `${currentPiece.name} gets another turn!`]);
          return;
      }

      setPieces(prevPieces => {
        return prevPieces.map((p, idx) => {
          if (idx !== currentPlayerIndex) return p;
          return {
            ...p,
            x: Math.max(0, Math.min(BOARD_SIZE - 1, p.x + deltaX)),
            y: Math.max(0, Math.min(BOARD_SIZE - 1, p.y + deltaY))
          };
        });
      });

      setGameLog(prev => [...prev, `${currentPiece.name} drew: ${drawn.title}`]);
    }, 1400);
  };

  const addNewCard = () => {
    const newCard: GameCard = {
      id: 'card-' + Date.now(),
      title: "NEW EVENT",
      text: "Describe what happens when this card is drawn...",
      icon: "🌴",
      color: "#4ade80",
      effect: 'wild'
    };
    setCards([...cards, newCard]);
    setCurrentCard(newCard);
    setIsCardModalOpen(true);
  };

  const updateCard = (id: string, updates: Partial<GameCard>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (currentCard && currentCard.id === id) {
      setCurrentCard({ ...currentCard, ...updates });
    }
  };

  const resetToDefault = () => {
    setTiles(() => {
      const initial: Tile[] = [];
      for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          let type: Tile['type'] = 'grass';
          if ((y > 4 && x < 4) || (y === 3 && x > 1 && x < 5) || (x === 3 && y > 0 && y < 5)) type = 'path';
          if (x === 5 && y === 1) type = 'temple';
          if ((x + y) % 3 === 0 && type === 'grass') type = 'trap';
          initial.push({ x, y, type });
        }
      }
      return initial;
    });
    setPieces(DEFAULT_PIECES);
    setCards(DEFAULT_CARDS);
    setGameLog(["Board reset. New game ready!"]);
    setCurrentPlayerIndex(0);
  };

  const startExport = () => {
    setShowExportModal(true);
    setIsExporting(true);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        const next = prev + Math.random() * 26 + 9;
        if (next >= 100) {
          clearInterval(interval);
          setExportProgress(100);
          setTimeout(() => {
            setIsExporting(false);
            // Fake download
            const gameData = {
              name: boardName,
              tiles: tiles,
              cards: cards,
              pieces: pieces,
              version: "1.0-jumanji"
            };
            const jsonString = JSON.stringify(gameData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${boardName.toLowerCase().replace(/\s+/g, '-')}.apk`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setGameLog(prevLog => [...prevLog, `✅ ${boardName}.apk successfully forged!`]);
          }, 800);
          return 100;
        }
        return Math.min(100, next);
      });
    }, 110);
  };

  const movePiece = (pieceId: string, dx: number, dy: number) => {
    setPieces(prev => prev.map(piece => {
      if (piece.id === pieceId) {
        return {
          ...piece,
          x: Math.max(0, Math.min(BOARD_SIZE - 1, piece.x + dx)),
          y: Math.max(0, Math.min(BOARD_SIZE - 1, piece.y + dy))
        };
      }
      return piece;
    }));
  };

  return (
    <div className="min-h-screen bg-[#020c07] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-emerald-900 bg-black/70 backdrop-blur-lg z-50">
        <div className="max-w-screen-2xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-inner">
              <Hammer className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-bold text-3xl tracking-tighter text-white">GRIDFORGE</div>
              <div className="text-[10px] text-emerald-400 -mt-1 font-mono">JUMANJI FORGE</div>
            </div>
          </div>

          <div className="flex items-center gap-x-2 bg-zinc-950 rounded-3xl p-1 border border-emerald-950">
            <button 
              onClick={() => setMode('design')}
              className={`px-6 py-2 rounded-3xl flex items-center gap-x-2 text-sm transition-all ${mode === 'design' ? 'bg-emerald-600 text-white shadow' : 'hover:bg-zinc-900'}`}
            >
              <Edit3 className="w-4 h-4" />
              DESIGN STUDIO
            </button>
            <button 
              onClick={() => setMode('play')}
              className={`px-6 py-2 rounded-3xl flex items-center gap-x-2 text-sm transition-all ${mode === 'play' ? 'bg-emerald-600 text-white shadow' : 'hover:bg-zinc-900'}`}
            >
              <Play className="w-4 h-4" />
              PLAYTEST
            </button>
          </div>

          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-2 bg-zinc-900 rounded-2xl px-4 py-1 text-xs border border-emerald-900">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              LIVE PREVIEW
            </div>
            
            <button 
              onClick={resetToDefault}
              className="flex items-center gap-x-2 px-5 py-2.5 text-sm rounded-2xl border border-emerald-800 hover:bg-emerald-950 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              RESET
            </button>
            
            <button 
              onClick={startExport}
              className="flex items-center gap-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 transition-all text-black font-semibold px-8 py-2.5 rounded-2xl text-sm shadow-xl shadow-yellow-900/50"
            >
              <Download className="w-4 h-4" />
              FORGE APK
            </button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* LEFT TOOLBOX */}
        <div className="w-72 bg-zinc-950 border-r border-emerald-900 flex flex-col">
          <div className="p-6 border-b border-emerald-900">
            <div className="uppercase text-xs tracking-[2px] text-emerald-400 mb-2">PROJECT</div>
            <input 
              type="text" 
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="block w-full bg-transparent text-2xl font-semibold focus:outline-none border-b border-transparent focus:border-emerald-700 pb-1"
            />
            <div className="text-emerald-500 text-xs mt-3 font-mono">7×7 ISOMETRIC GRID • 6 CARDS</div>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-6">
            <div className="text-xs uppercase tracking-widest text-zinc-500 mb-4">ASSETS</div>
            
            {/* Tiles */}
            <div className="mb-8">
              <div className="flex items-center gap-x-2 mb-3 text-emerald-300 text-sm">
                <div className="w-px h-3 bg-emerald-700"></div>
                TERRAIN TILES
              </div>
              <div className="grid grid-cols-5 gap-2">
                {tileTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (selectedTile) {
                        updateTile(selectedTile.x, selectedTile.y, type);
                      }
                    }}
                    className="group h-16 rounded-2xl border border-emerald-800 hover:border-emerald-400 flex flex-col items-center justify-center transition-all active:scale-95"
                    style={{ backgroundColor: TILE_COLORS[type] + '88' }}
                  >
                    <div className="text-xl mb-1">
                      {type === 'grass' && '🌱'}
                      {type === 'path' && '🪨'}
                      {type === 'river' && '🏞️'}
                      {type === 'trap' && '☠️'}
                      {type === 'temple' && '🏛️'}
                    </div>
                    <div className="text-[10px] text-white/70 capitalize font-mono tracking-wider">{type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tokens */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-x-2 text-emerald-300 text-sm">
                  <div className="w-px h-3 bg-emerald-700"></div>
                  ADVENTURERS
                </div>
                <button onClick={() => {
                  const newPiece: Piece = {
                    id: 'p-' + Date.now(),
                    name: `Explorer ${pieces.length + 1}`,
                    color: '#' + Math.floor(Math.random()*16777215).toString(16),
                    x: 2,
                    y: 4,
                    emoji: ['🧙','🦸','🐵','🧝'][pieces.length % 4]
                  };
                  setPieces([...pieces, newPiece]);
                }} className="text-emerald-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {pieces.map((piece) => (
                  <motion.div
                    key={piece.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedPieceId(piece.id)}
                    className={`flex items-center gap-x-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${selectedPieceId === piece.id ? 'border-amber-400 bg-zinc-900' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div 
                      className="w-9 h-9 flex items-center justify-center text-3xl rounded-xl" 
                      style={{ backgroundColor: piece.color + '30', color: piece.color }}
                    >
                      {piece.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{piece.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">POS ({piece.x}, {piece.y})</div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); movePiece(piece.id, 1, -1); }}
                      className="text-xs px-2 py-1 bg-zinc-900 hover:bg-zinc-800 rounded"
                    >
                      →
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 border-t border-emerald-900 text-[10px] text-emerald-600/70 font-mono leading-tight">
            GRIDFORGE v0.8<br />
            JUMANJI PROTOCOL ENABLED<br />
            3D ISOMETRIC RENDERING
          </div>
        </div>

        {/* CENTER CANVAS AREA */}
        <div className="flex-1 flex flex-col bg-[#0a1f17] relative">
          <div className="absolute inset-0 bg-[radial-gradient(#134e2a_0.8px,transparent_1px)] bg-[length:28px_28px] opacity-30 pointer-events-none"></div>
          
          <div className="p-6 flex justify-between items-center border-b border-emerald-900 z-10 bg-black/40">
            <div className="flex items-center gap-x-8">
              <div>
                <div className="text-emerald-400 text-xs tracking-[1.5px] mb-px">CURRENT BOARD</div>
                <div className="text-3xl font-bold text-white tracking-tighter">{boardName}</div>
              </div>
              
              {mode === 'play' && (
                <div className="flex items-center gap-x-5 text-sm">
                  <div className="flex items-center gap-x-3">
                    <div className="px-3 py-1 bg-emerald-900/70 rounded-xl flex items-center gap-x-2">
                      <div className="text-emerald-400">PLAYER</div> 
                      <div className="font-mono text-xl font-semibold text-white">{currentPlayerIndex + 1}</div>
                    </div>
                    
                    <button 
                      onClick={rollDice}
                      disabled={isRolling}
                      className="flex items-center gap-x-3 bg-white text-black px-7 h-11 rounded-2xl font-semibold active:scale-95 transition-all disabled:opacity-40"
                    >
                      <Dice1 className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
                      ROLL D6
                      {diceRoll && <span className="font-mono text-xl">→ {diceRoll}</span>}
                    </button>
                    
                    <button 
                      onClick={drawRandomCard}
                      className="px-5 h-11 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black rounded-2xl text-sm font-medium flex items-center gap-x-2 transition-all"
                    >
                      DRAW CARD
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-x-2 text-xs uppercase">
              <div className={`px-4 py-2 rounded-3xl flex items-center gap-2 ${mode === 'design' ? 'bg-teal-800 text-teal-200' : 'bg-transparent text-zinc-400'}`}>
                <Edit3 className="w-3 h-3" /> EDITOR
              </div>
              <div className={`px-4 py-2 rounded-3xl flex items-center gap-2 ${mode === 'play' ? 'bg-orange-800 text-orange-200' : 'bg-transparent text-zinc-400'}`}>
                <Play className="w-3 h-3" /> SIM
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 relative">
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-amber-400 text-xs px-6 py-1 rounded-3xl border border-amber-900 flex items-center gap-x-2 z-20">
                <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                ISOMETRIC JUNGLE REALM
              </div>
              
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="shadow-2xl rounded-3xl cursor-crosshair border-4 border-[#052e16]"
                style={{ imageRendering: 'pixelated' }}
              />
              
              <div className="absolute -bottom-4 right-6 bg-black/70 text-[10px] px-4 py-2.5 rounded-2xl border border-emerald-900 font-mono flex items-center gap-x-3">
                CLICK TILES TO CYCLE • DRAG IN PLAY MODE
                <div className="text-emerald-500">⟲</div>
              </div>
            </div>
          </div>

          {/* Game Log */}
          <div className="h-52 bg-black/80 border-t border-emerald-900 p-5 font-mono text-xs overflow-auto text-emerald-200/90">
            {gameLog.map((log, i) => (
              <div key={i} className="py-px">{log}</div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL - CARDS & CONTROLS */}
        <div className="w-80 bg-zinc-950 border-l border-emerald-900 flex flex-col">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="uppercase text-xs tracking-widest text-rose-300">EVENT DECK</div>
              <button 
                onClick={addNewCard}
                className="flex items-center gap-x-1 text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 px-4 py-2 rounded-2xl"
              >
                <Plus className="w-3 h-3" /> NEW
              </button>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-auto pr-2 custom-scroll">
              <AnimatePresence>
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setCurrentCard(card);
                      setIsCardModalOpen(true);
                    }}
                    className="group bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-700 hover:border-rose-400 rounded-3xl p-4 cursor-pointer transition-all"
                  >
                    <div className="flex gap-4">
                      <div 
                        className="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-4xl shadow-inner"
                        style={{ backgroundColor: card.color + '20' }}
                      >
                        {card.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-amber-200 text-sm leading-tight mb-1 line-clamp-1">{card.title}</div>
                        <div className="text-zinc-400 text-xs leading-tight line-clamp-2">{card.text}</div>
                        <div className="mt-3 text-[10px] uppercase font-mono text-zinc-500 flex items-center gap-x-2">
                          {card.effect.replace('-', ' ')}
                          <div className="flex-1 h-px bg-zinc-800"></div>
                          <span className="text-emerald-300">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-auto border-t border-emerald-900 p-6">
            <div className="text-xs text-zinc-400 mb-4">OPTIMIZATIONS</div>
            
            <div className="space-y-5">
              <div>
                <div className="text-xs mb-2 flex justify-between text-zinc-400">
                  <span>DIFFICULTY</span>
                  <span className="font-mono text-emerald-400">MED</span>
                </div>
                <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-emerald-400" />
              </div>
              
              <div>
                <div className="text-xs mb-2 flex justify-between text-zinc-400">
                  <span>CARD DANGER</span>
                  <span className="font-mono text-rose-400">68%</span>
                </div>
                <input type="range" min="10" max="100" defaultValue="68" className="w-full accent-rose-400" />
              </div>
            </div>

            <button 
              onClick={() => setMode(mode === 'design' ? 'play' : 'design')}
              className="mt-8 w-full h-12 flex items-center justify-center gap-x-2 rounded-3xl border-2 border-white/80 text-sm hover:bg-white hover:text-black transition-all font-medium"
            >
              {mode === 'design' ? <Play className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              SWITCH TO {mode === 'design' ? 'PLAYTEST' : 'DESIGN MODE'}
            </button>
          </div>
        </div>
      </div>

      {/* CARD MODAL */}
      <AnimatePresence>
        {isCardModalOpen && currentCard && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={() => setIsCardModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 6 }}
              transition={{ type: "spring", bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
              className="w-[380px] bg-gradient-to-b from-zinc-900 to-black border-2 border-amber-400/80 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Card header */}
              <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400"></div>
              
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="text-7xl drop-shadow-xl" style={{ filter: 'drop-shadow(0 25px 25px rgb(234 179 8))' }}>
                    {currentCard.icon}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-amber-400 text-sm tracking-[3px] mb-1 font-medium">JUMANJI EVENT</div>
                  <h3 className="text-4xl font-bold text-white leading-none mb-6 tracking-tighter">{currentCard.title}</h3>
                  
                  <div className="text-lg text-zinc-200 leading-snug border-y border-white/10 py-8">
                    {currentCard.text}
                  </div>
                </div>
              </div>

              <div className="bg-black/60 px-8 py-6 flex items-center justify-between text-sm">
                <button 
                  onClick={() => setIsCardModalOpen(false)}
                  className="uppercase tracking-widest text-xs px-8 py-4 border border-white/30 hover:bg-white/5 rounded-2xl"
                >
                  CLOSE
                </button>
                
                <button 
                  onClick={() => {
                    setIsCardModalOpen(false);
                    if (currentCard) updateCard(currentCard.id, { title: currentCard.title + "!" });
                  }}
                  className="uppercase tracking-widest text-xs px-8 py-4 bg-amber-400 text-black font-semibold rounded-2xl hover:bg-amber-300"
                >
                  APPLY EFFECT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPORT MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-zinc-900 border border-emerald-700 rounded-3xl overflow-hidden"
            >
              <div className="px-10 py-9">
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400">
                    <Hammer className="w-10 h-10 text-black" />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-semibold mb-2 tracking-tight">Forging APK...</div>
                  <div className="text-emerald-400 font-mono text-sm mb-8">GRIDFORGE MOBILE COMPILER v22.4</div>
                </div>

                <div className="h-2.5 bg-zinc-800 rounded-3xl overflow-hidden mb-3">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-3xl"
                    initial={{ width: '0%' }}
                    animate={{ width: `${exportProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <div>PACKAGING ASSETS</div>
                  <div>{Math.floor(exportProgress)}%</div>
                </div>

                {exportProgress > 82 && !isExporting && (
                  <div className="mt-8 text-center text-emerald-300 text-sm">
                    APK ready for <span className="font-semibold text-white">Android 14+</span>.<br /> 
                    Your game has been converted to native.
                  </div>
                )}
              </div>

              <div className="border-t border-emerald-900 bg-black p-4 flex justify-end">
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="px-10 py-3.5 text-sm"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
