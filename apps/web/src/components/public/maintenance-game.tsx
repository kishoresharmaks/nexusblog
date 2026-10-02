'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  Terminal as TerminalIcon,
  Sparkles,
  RotateCcw,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Shuffle,
  Lightbulb,
} from 'lucide-react';

const DEV_TRIVIA = [
  {
    fact: "The first computer bug was an actual real-life moth found trapped inside the Mark II computer relay at Harvard University in 1947 by Grace Hopper's team.",
    category: "History of Computing",
  },
  {
    fact: "JavaScript was famously written in just 10 days by Brendan Eich in May 1995 while working at Netscape.",
    category: "Language Origins",
  },
  {
    fact: "The Apollo 11 Lunar Module Guidance Computer operated with only 4 KB of RAM and 72 KB of ROM.",
    category: "Space Engineering",
  },
  {
    fact: "In JavaScript, typeof NaN actually evaluates to 'number' — IEEE 754 floating-point standard defines NaN as a numeric data type representing an undefined result.",
    category: "Web Quirks",
  },
  {
    fact: "Git was created in 2005 by Linus Torvalds over a weekend after BitKeeper revoked its free access for Linux kernel development.",
    category: "Developer Tools",
  },
  {
    fact: "The QWERTY keyboard layout was designed in 1873 to slow down typists enough so that mechanical typewriter bars wouldn't jam together.",
    category: "Hardware History",
  },
  {
    fact: "The first 1GB hard drive, introduced by IBM in 1980 (the IBM 3380), weighed over 500 pounds and cost $40,000.",
    category: "Data Storage",
  },
  {
    fact: "CAP Theorem states a distributed data store can only provide at most two out of three guarantees: Consistency, Availability, and Partition Tolerance.",
    category: "Distributed Systems",
  },
  {
    fact: "There are only 10 types of people in the world: those who understand binary, and those who don't.",
    category: "Dev Humor",
  },
  {
    fact: "The world's first website is still online at info.cern.ch, created by Tim Berners-Lee in 1991.",
    category: "Internet History",
  },
];

const TERMINAL_COMMANDS: Record<string, string> = {
  help: "Available commands: status, ping, joke, tech, clear, date, sudo, whoami",
  status: "Nexus System Upgrade: [██████████████░░░] 84% Complete. Index optimization running...",
  ping: "PONG! 64 bytes from nexus.edge (127.0.0.1): icmp_seq=1 ttl=128 time=8.4ms",
  joke: "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
  tech: "Nexus Stack: Next.js 15 App Router, NestJS, Prisma, MongoDB, Tailwind CSS v4, TypeScript.",
  whoami: "Distinguished Engineer visiting during platform upgrade.",
  sudo: "Nice try! With great power comes great responsibility. Access denied. 😉",
  date: new Date().toUTCString(),
};

type TabType = 'game' | 'trivia' | 'terminal';

export function MaintenanceGame() {
  const [activeTab, setActiveTab] = useState<TabType>('game');

  // --- Snake Game State ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const snakeRef = useRef<Array<{ x: number; y: number }>>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const foodRef = useRef<{ x: number; y: number; label: string }>({ x: 15, y: 10, label: '0x1' });
  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const nextDirectionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const gameLoopRef = useRef<number | null>(null);
  const speedRef = useRef(110);

  // Load High Score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexus_maintenance_highscore');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const spawnFood = useCallback((snake: Array<{ x: number; y: number }>) => {
    const labels = ['200_OK', 'CACHE_HIT', 'BUG_FIX', 'PR_MERGE', 'FAST_INDEX', '0x1'];
    let newX = Math.floor(Math.random() * 24);
    let newY = Math.floor(Math.random() * 14);

    while (snake.some((segment) => segment.x === newX && segment.y === newY)) {
      newX = Math.floor(Math.random() * 24);
      newY = Math.floor(Math.random() * 14);
    }

    foodRef.current = {
      x: newX,
      y: newY,
      label: labels[Math.floor(Math.random() * labels.length)],
    };
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 8, y: 7 },
      { x: 7, y: 7 },
      { x: 6, y: 7 },
    ];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    speedRef.current = 110;
    setScore(0);
    setIsGameOver(false);
    spawnFood(snakeRef.current);
    setIsPlaying(true);
  }, [spawnFood]);

  // Main Draw & Step Function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 16;
    const cols = 24;
    const rows = 14;

    const draw = () => {
      // Clear background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid
      ctx.strokeStyle = '#27272a33';
      ctx.lineWidth = 1;
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, rows * cellSize);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(cols * cellSize, y * cellSize);
        ctx.stroke();
      }

      // Draw Food / Byte Target
      const food = foodRef.current;
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);
      ctx.fillStyle = '#09090b';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2);

      // Draw Snake
      const snake = snakeRef.current;
      snake.forEach((segment, index) => {
        if (index === 0) {
          ctx.fillStyle = '#f4f4f5'; // Head
        } else {
          ctx.fillStyle = '#a1a1aa'; // Body
        }
        ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
      });
    };

    if (!isPlaying) {
      draw();
      return;
    }

    let lastTime = 0;

    const step = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;

      if (delta >= speedRef.current) {
        lastTime = time;
        directionRef.current = nextDirectionRef.current;
        const head = { ...snakeRef.current[0] };

        switch (directionRef.current) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Wall Collision
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
          setIsGameOver(true);
          setIsPlaying(false);
          return;
        }

        // Self Collision
        if (snakeRef.current.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setIsGameOver(true);
          setIsPlaying(false);
          return;
        }

        const newSnake = [head, ...snakeRef.current];

        // Food Check
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          setScore((prev) => {
            const next = prev + 10;
            if (next > highScore) {
              setHighScore(next);
              try {
                localStorage.setItem('nexus_maintenance_highscore', String(next));
              } catch {}
            }
            return next;
          });
          speedRef.current = Math.max(60, speedRef.current - 2);
          spawnFood(newSnake);
        } else {
          newSnake.pop();
        }

        snakeRef.current = newSnake;
        draw();
      }

      gameLoopRef.current = requestAnimationFrame(step);
    };

    gameLoopRef.current = requestAnimationFrame(step);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, highScore, spawnFood]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'game') return;

      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
      }

      if (key === ' ' || key === 'spacebar') {
        if (isGameOver) resetGame();
        else setIsPlaying((p) => !p);
        return;
      }

      const current = directionRef.current;
      if ((key === 'arrowup' || key === 'w') && current !== 'DOWN') {
        nextDirectionRef.current = 'UP';
      } else if ((key === 'arrowdown' || key === 's') && current !== 'UP') {
        nextDirectionRef.current = 'DOWN';
      } else if ((key === 'arrowleft' || key === 'a') && current !== 'RIGHT') {
        nextDirectionRef.current = 'LEFT';
      } else if ((key === 'arrowright' || key === 'd') && current !== 'LEFT') {
        nextDirectionRef.current = 'RIGHT';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isGameOver, resetGame]);

  const handleDpad = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const current = directionRef.current;
    if (dir === 'UP' && current !== 'DOWN') nextDirectionRef.current = 'UP';
    if (dir === 'DOWN' && current !== 'UP') nextDirectionRef.current = 'DOWN';
    if (dir === 'LEFT' && current !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    if (dir === 'RIGHT' && current !== 'LEFT') nextDirectionRef.current = 'RIGHT';
  };

  // --- Trivia State ---
  const [triviaIndex, setTriviaIndex] = useState(0);
  const handleNextTrivia = () => {
    setTriviaIndex((prev) => (prev + 1) % DEV_TRIVIA.length);
  };

  // --- Terminal State ---
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string }>>([
    { cmd: 'status', output: 'System upgrade in progress: 84% complete. All systems optimizing...' },
  ]);
  const [commandInput, setCommandInput] = useState('');

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      setTerminalHistory([]);
      setCommandInput('');
      return;
    }

    const output = TERMINAL_COMMANDS[cmd] || `Command not recognized: '${cmd}'. Type 'help' for available commands.`;
    setTerminalHistory((prev) => [...prev, { cmd: commandInput, output }]);
    setCommandInput('');
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-xl border border-border bg-card shadow-xs overflow-hidden font-sans text-foreground">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('game')}
            className={`inline-flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'game'
                ? 'bg-foreground text-background font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Retro Snake</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trivia')}
            className={`inline-flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'trivia'
                ? 'bg-foreground text-background font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Dev Trivia</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`inline-flex items-center space-x-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-foreground text-background font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <TerminalIcon className="h-3.5 w-3.5" />
            <span>Console</span>
          </button>
        </div>

        <span className="hidden sm:inline-block text-[11px] font-mono text-muted-foreground">
          WHILE YOU WAIT
        </span>
      </div>

      {/* Tab 1: Retro Snake Game */}
      {activeTab === 'game' && (
        <div className="p-4 flex flex-col items-center space-y-3">
          {/* Game Stats Bar */}
          <div className="w-full flex items-center justify-between px-1 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">SCORE:</span>
              <span className="font-bold text-foreground text-sm">{score}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              <span>HIGH: {highScore}</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative rounded-lg border border-border bg-black overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={384}
              height={224}
              className="block w-full max-w-[384px] h-auto aspect-[12/7]"
            />

            {/* Start / Game Over Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-3 p-4 text-center">
                {isGameOver ? (
                  <>
                    <p className="font-mono text-base font-bold text-red-400 tracking-wider">
                      SEGFAULT (GAME OVER)
                    </p>
                    <p className="font-mono text-xs text-zinc-400">Final Score: {score}</p>
                    <button
                      onClick={resetGame}
                      className="inline-flex items-center space-x-1.5 rounded-md bg-white text-black px-4 py-2 text-xs font-mono font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>RETRY [SPACE]</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="font-mono text-sm font-bold text-white tracking-wide">
                        BYTE RUNNER
                      </p>
                      <p className="font-mono text-[11px] text-zinc-400">
                        Collect byte tokens &amp; avoid the firewall.
                      </p>
                    </div>
                    <button
                      onClick={resetGame}
                      className="inline-flex items-center space-x-1.5 rounded-md bg-white text-black px-4 py-2 text-xs font-mono font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>START GAME</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile & Touch Controls */}
          <div className="flex items-center justify-between w-full max-w-[384px] pt-1">
            <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
              Use Arrow Keys / WASD
            </span>

            {/* D-Pad for Touch / Mobile */}
            <div className="grid grid-cols-3 gap-1 mx-auto sm:mx-0">
              <div />
              <button
                type="button"
                onClick={() => handleDpad('UP')}
                className="h-8 w-8 rounded border border-border bg-muted/50 flex items-center justify-center hover:bg-muted active:scale-95"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <div />
              <button
                type="button"
                onClick={() => handleDpad('LEFT')}
                className="h-8 w-8 rounded border border-border bg-muted/50 flex items-center justify-center hover:bg-muted active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDpad('DOWN')}
                className="h-8 w-8 rounded border border-border bg-muted/50 flex items-center justify-center hover:bg-muted active:scale-95"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDpad('RIGHT')}
                className="h-8 w-8 rounded border border-border bg-muted/50 flex items-center justify-center hover:bg-muted active:scale-95"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dev Trivia */}
      {activeTab === 'trivia' && (
        <div className="p-5 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-muted-foreground">
              {DEV_TRIVIA[triviaIndex].category}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {triviaIndex + 1} / {DEV_TRIVIA.length}
            </span>
          </div>

          <div className="min-h-[90px] rounded-lg border border-border bg-muted/20 p-4 flex items-center">
            <p className="text-sm sm:text-base text-foreground font-sans leading-relaxed">
              "{DEV_TRIVIA[triviaIndex].fact}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-muted-foreground">
              Curated Developer Facts
            </span>
            <button
              onClick={handleNextTrivia}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Next Fact</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Console */}
      {activeTab === 'terminal' && (
        <div className="p-4 space-y-3 font-mono text-xs text-left">
          <div className="h-44 overflow-y-auto rounded-lg border border-border bg-black p-3 space-y-2 text-zinc-300">
            <div className="text-zinc-500 text-[11px]">
              Nexus Shell v2.4 (Type 'help' for command list)
            </div>
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-zinc-100 flex items-center gap-1.5">
                  <span className="text-emerald-400">guest@nexus:~$</span>
                  <span>{item.cmd}</span>
                </div>
                <div className="text-zinc-400 pl-3 leading-relaxed whitespace-pre-wrap">
                  {item.output}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommandSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Type 'help', 'ping', 'joke', 'status'..."
                className="w-full rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-foreground"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-mono font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Execute
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
