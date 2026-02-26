import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || "game.db";

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (dbDir !== "." && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize Database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      points REAL DEFAULT 0,
      is_subscribed BOOLEAN DEFAULT 0,
      subscription_expiry INTEGER DEFAULT 0,
      has_nft BOOLEAN DEFAULT 0,
      referrer TEXT,
      last_checkin INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      player1 TEXT,
      player2 TEXT,
      winner TEXT,
      created_at INTEGER
    );
  `);
  console.log("Database initialized successfully at:", dbPath);
} catch (error) {
  console.error("Database initialization failed:", error);
  process.exit(1);
}

async function startServer() {
  console.log("Starting server...");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  
  const app = express();
  app.get("/.well-known/farcaster.json", (req, res) => {
    res.redirect(
      307,
      "https://api.farcaster.xyz/miniapps/hosted-manifest/019c9679-31d5-6a10-67c6-b57952ce22fe"
    );
  });
  app.use(express.json());
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", dbPath, nodeEnv: process.env.NODE_ENV });
  });

  // API Routes
  app.get("/api/rankings", (req, res) => {
    console.log("GET /api/rankings");
    try {
      const leaderboard = db.prepare("SELECT address, points FROM users ORDER BY points DESC LIMIT 10").all();
      res.json(leaderboard);
    } catch (error) {
      console.error("Rankings error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/user/:address", (req, res) => {
    console.log(`GET /api/user/${req.params.address}`);
    try {
      const user = db.prepare("SELECT * FROM users WHERE address = ?").get(req.params.address);
      
      // Calculate rank
      const rankResult = db.prepare(`
        SELECT rank FROM (
          SELECT address, RANK() OVER (ORDER BY points DESC) as rank 
          FROM users
        ) WHERE address = ?
      `).get(req.params.address);

      const rank = rankResult ? rankResult.rank : "--";

      if (!user) {
        db.prepare("INSERT INTO users (address) VALUES (?)").run(req.params.address);
        return res.json({ address: req.params.address, points: 0, is_subscribed: false, rank: "--" });
      }
      
      res.json({ ...user, rank });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/user/subscribe", (req, res) => {
    const { address } = req.body;
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    
    // Check if user is within the first 3333 subscribers for NFT
    const subscriberCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_subscribed = 1").get().count;
    const hasNft = subscriberCount < 3333 ? 1 : 0;

    db.prepare("UPDATE users SET is_subscribed = 1, subscription_expiry = ?, has_nft = ? WHERE address = ?").run(expiry, hasNft, address);
    res.json({ success: true, expiry, hasNft: !!hasNft });
  });

  app.post("/api/user/referral", (req, res) => {
    const { address, referrer } = req.body;
    if (address.toLowerCase() === referrer.toLowerCase()) {
      return res.status(400).json({ error: "Cannot refer yourself" });
    }
    const user = db.prepare("SELECT referrer FROM users WHERE address = ?").get(address);
    if (user && user.referrer) {
      return res.status(400).json({ error: "Referrer already set" });
    }
    db.prepare("UPDATE users SET referrer = ? WHERE address = ?").run(referrer, address);
    res.json({ success: true });
  });

  app.post("/api/user/checkin", (req, res) => {
    const { address } = req.body;
    try {
      const user = db.prepare("SELECT last_checkin, streak FROM users WHERE address = ?").get(address);
      if (!user) return res.status(404).json({ error: "User not found" });

      const now = Date.now();
      const lastCheckin = user.last_checkin;
      const oneDay = 24 * 60 * 60 * 1000;
      
      const lastDate = new Date(lastCheckin).setHours(0, 0, 0, 0);
      const todayDate = new Date(now).setHours(0, 0, 0, 0);

      if (lastDate === todayDate) {
        return res.status(400).json({ error: "Already checked in today" });
      }

      let newStreak = 1;
      if (todayDate - lastDate === oneDay) {
        newStreak = user.streak + 1;
      }

      let bonusPoints = 1;
      let streakBonus = 0;
      if (newStreak === 7) {
        streakBonus = 7;
      } else if (newStreak === 30) {
        streakBonus = 30;
      }

      const totalPoints = bonusPoints + streakBonus;
      db.prepare("UPDATE users SET points = points + ?, last_checkin = ?, streak = ? WHERE address = ?").run(totalPoints, now, newStreak, address);
      
      res.json({ success: true, pointsAdded: totalPoints, streak: newStreak, streakBonus });
    } catch (error) {
      console.error("Checkin error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Socket.io Logic
  const waitingPlayers: Map<number, { socketId: string; address: string }[]> = new Map([
    [3, []],
    [4, []]
  ]);
  const activeGames = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_queue", ({ address, size = 3 }) => {
      const queue = waitingPlayers.get(size)!;
      if (queue.find(p => p.address === address)) return;
      
      if (queue.length > 0) {
        const opponent = queue.shift()!;
        const gameId = `${opponent.address}-${address}-${Date.now()}`;
        
        const game = {
          id: gameId,
          size,
          players: [opponent.address, address],
          board: Array(size * size).fill(null),
          turn: opponent.address,
          sockets: [opponent.socketId, socket.id]
        };
        
        activeGames.set(gameId, game);
        
        io.to(opponent.socketId).emit("game_start", { gameId, size, opponent: address, symbol: "X", turn: opponent.address });
        socket.emit("game_start", { gameId, size, opponent: opponent.address, symbol: "O", turn: opponent.address });
      } else {
        queue.push({ socketId: socket.id, address });
        
        // If no one joins in 5 seconds, play against AI
        setTimeout(() => {
          const q = waitingPlayers.get(size)!;
          const index = q.findIndex(p => p.socketId === socket.id);
          if (index !== -1) {
            q.splice(index, 1);
            const gameId = `ai-${address}-${Date.now()}`;
            const game = {
              id: gameId,
              size,
              players: [address, "AI"],
              board: Array(size * size).fill(null),
              turn: address,
              sockets: [socket.id],
              isAI: true
            };
            activeGames.set(gameId, game);
            socket.emit("game_start", { gameId, size, opponent: "AI (Expert)", symbol: "X", turn: address });
          }
        }, 5000);
      }
    });

    socket.on("make_move", ({ gameId, index, address }) => {
      const game = activeGames.get(gameId);
      if (!game || game.turn !== address || game.board[index] !== null) return;

      const symbol = game.players[0] === address ? "X" : "O";
      game.board[index] = symbol;
      
      const winner = checkWinner(game.board, game.size);
      const isDraw = !winner && game.board.every((cell: any) => cell !== null);

      if (winner || isDraw) {
        handleGameOver(gameId, winner === "X" ? game.players[0] : (winner === "O" ? game.players[1] : null));
      } else {
        game.turn = game.players.find((p: string) => p !== address);
        broadcastGameUpdate(game);
        
        if (game.isAI && game.turn === "AI") {
          setTimeout(() => makeAIMove(gameId), 500);
        }
      }
    });

    socket.on("disconnect", () => {
      waitingPlayers.forEach(queue => {
        const index = queue.findIndex(p => p.socketId === socket.id);
        if (index !== -1) queue.splice(index, 1);
      });
    });
  });

  function broadcastGameUpdate(game: any) {
    game.sockets.forEach((sid: string) => {
      io.to(sid).emit("game_update", { board: game.board, turn: game.turn });
    });
  }

  function handleGameOver(gameId: string, winnerAddress: string | null) {
    const game = activeGames.get(gameId);
    if (!game) return;

    const finalBoard = [...game.board];

    if (winnerAddress) {
      // Win: 3 points
      if (winnerAddress !== "AI") {
        addPoints(winnerAddress, 3);
      }
    } else {
      // Draw: 1 point each
      game.players.forEach((p: string) => {
        if (p !== "AI") {
          addPoints(p, 1);
        }
      });
    }

    game.sockets.forEach((sid: string) => {
      io.to(sid).emit("game_over", { winner: winnerAddress, board: finalBoard });
    });

    activeGames.delete(gameId);
  }

  function addPoints(address: string, basePoints: number) {
    try {
      const user = db.prepare("SELECT has_nft, referrer FROM users WHERE address = ?").get(address);
      if (!user) return;

      const multiplier = user.has_nft ? 2 : 1;
      const pointsToAdd = basePoints * multiplier;

      // Update user points
      db.prepare("UPDATE users SET points = points + ? WHERE address = ?").run(pointsToAdd, address);

      // Referral bonus: 50% of referee's points
      if (user.referrer) {
        const referralBonus = pointsToAdd * 0.5;
        db.prepare("UPDATE users SET points = points + ? WHERE address = ?").run(referralBonus, user.referrer);
      }
    } catch (error) {
      console.error("Error adding points:", error);
    }
  }

  function checkWinner(board: (string | null)[], size: number) {
    const winLength = size;
    
    // Check Rows
    for (let r = 0; r < size; r++) {
      const rowStart = r * size;
      const first = board[rowStart];
      if (first) {
        let win = true;
        for (let c = 1; c < size; c++) {
          if (board[rowStart + c] !== first) {
            win = false;
            break;
          }
        }
        if (win) return first;
      }
    }

    // Check Cols
    for (let c = 0; c < size; c++) {
      const first = board[c];
      if (first) {
        let win = true;
        for (let r = 1; r < size; r++) {
          if (board[r * size + c] !== first) {
            win = false;
            break;
          }
        }
        if (win) return first;
      }
    }

    // Check Diagonals
    const topLeft = board[0];
    if (topLeft) {
      let win = true;
      for (let i = 1; i < size; i++) {
        if (board[i * size + i] !== topLeft) {
          win = false;
          break;
        }
      }
      if (win) return topLeft;
    }

    const topRight = board[size - 1];
    if (topRight) {
      let win = true;
      for (let i = 1; i < size; i++) {
        if (board[i * size + (size - 1 - i)] !== topRight) {
          win = false;
          break;
        }
      }
      if (win) return topRight;
    }

    return null;
  }

  function makeAIMove(gameId: string) {
    const game = activeGames.get(gameId);
    if (!game || !game.isAI || game.turn !== "AI") return;

    const availSpots = game.board.map((v: any, i: number) => v === null ? i : null).filter((v: any) => v !== null);
    if (availSpots.length === 0) return;
    
    let bestMove;
    if (Math.random() < 0.15) { // Slightly reduced randomness
      bestMove = availSpots[Math.floor(Math.random() * availSpots.length)];
    } else {
      const depth = game.size === 3 ? 10 : 5; // Slightly deeper for 4x4
      const result = minimax([...game.board], "O", game.size, depth);
      bestMove = result.index !== undefined ? result.index : availSpots[0];
    }

    if (bestMove === undefined || game.board[bestMove] !== null) {
      bestMove = availSpots[0];
    }

    game.board[bestMove] = "O";
    
    const winner = checkWinner(game.board, game.size);
    const isDraw = !winner && game.board.every((cell: any) => cell !== null);

    if (winner || isDraw) {
      handleGameOver(gameId, winner === "X" ? game.players[0] : (winner === "O" ? "AI" : null));
    } else {
      game.turn = game.players[0];
      broadcastGameUpdate(game);
    }
  }

  function minimax(newBoard: (string | null)[], player: string, size: number, depth: number): { score: number; index?: number } {
    const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];

    const winner = checkWinner(newBoard, size);
    if (winner === "X") return { score: -10 };
    if (winner === "O") return { score: 10 };
    if (availSpots.length === 0 || depth === 0) return { score: 0 };

    const moves: { score: number; index: number }[] = [];
    for (let i = 0; i < availSpots.length; i++) {
      const move: any = {};
      const index = availSpots[i];
      move.index = index;
      newBoard[index] = player;

      if (player === "O") {
        const result = minimax(newBoard, "X", size, depth - 1);
        move.score = result.score;
      } else {
        const result = minimax(newBoard, "O", size, depth - 1);
        move.score = result.score;
      }

      newBoard[index] = null;
      moves.push(move);
    }

    let bestMoveIndex = 0;
    if (player === "O") {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMoveIndex = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMoveIndex = i;
        }
      }
    }
    return moves[bestMoveIndex];
  }

  app.get("/api/version", (req, res) => {
    res.json({ ok: true, marker: "DEPLOY_MARKER_2026_02_26_A" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.use("/manifest", express.static(path.join(__dirname, "public/manifest")));    
    
    app.get("/miniapp", (req, res) => {
      const image = "https://xox-tic-tac-toe.onrender.com/manifest/og.png";
      const url = "https://xox-tic-tac-toe.onrender.com";

      const v = typeof req.query.v === "string"
        ? req.query.v
        : String(Date.now());

      const pageUrl = `${url}/miniapp?v=${encodeURIComponent(v)}`;

      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Cache-Control", "no-store, max-age=0");

      const miniapp = {
        version: "1",
        imageUrl: image,
        button: {
          title: "Launch XOX",
          action: {
            type: "launch_miniapp",
            url,
          },
        },
      };

      res.send(`<!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <meta name="fc:miniapp" content='${JSON.stringify(miniapp)}' />

        <meta property="og:title" content="XOX — Play. Win. Earn." />
        <meta property="og:description" content="Launch XOX miniapp on Farcaster." />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${pageUrl}" />
        <meta name="twitter:card" content="summary_large_image" />

        <title>XOX Miniapp</title>
      </head>
      <body></body>
    </html>`);
    });

    app.get("/frame", (req, res) => {
      const image = "https://xox-tic-tac-toe.onrender.com/manifest/og.png";
      const url = "https://xox-tic-tac-toe.onrender.com";
      const splash = "https://xox-tic-tac-toe.onrender.com/manifest/splash.png";

      // cache-bust support
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.setHeader("Cache-Control", "no-store, max-age=0");

      const miniapp = {
        version: "1",
        imageUrl: image,
        button: {
          title: "Launch XOX",
          action: {
            type: "launch_miniapp",
            url,
          },
        },
      };
      res.send(`<!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <!-- ✅ Mini App card -->
        <meta name="fc:miniapp" content='${JSON.stringify(miniapp)}' />
        <!-- ✅ (optional) also keep frame compatibility -->
        <meta property="fc:frame" content="vNext" />
        <meta property="og:title" content="XOX — Play. Win. Earn." />
        <meta property="og:description" content="Launch XOX miniapp on Farcaster." />
        <meta property="fc:frame:image" content="${image}" />
        <meta property="fc:frame:button:1" content="Launch XOX" />
        <meta property="fc:frame:button:1:action" content="launch" />
        <meta property="fc:frame:button:1:target" content="${url}" />
        <meta property="fc:frame:post_url" content="${url}/api/frame" />

        <meta property="og:image" content="${image}" />
        <meta name="twitter:card" content="summary_large_image" />
        <title>XOX Frame</title>
      </head>
      <body></body>
    </html>`);
    });

    app.get("/.well-known/farcaster.json", (req, res) => {
      res.redirect(
        307,
        "https://api.farcaster.xyz/miniapps/hosted-manifest/019c9679-31d5-6a10-67c6-b57952ce22fe"
      );
    });

    app.post("/api/frame", (req, res) => {
      return res.status(200).json({
        frame: {
          version: "vNext",
          imageUrl: "https://xox-tic-tac-toe.onrender.com/manifest/og.png",
          buttons: [
            {
              label: "Launch XOX",
              action: "launch",
              target: "https://xox-tic-tac-toe.onrender.com",
            },
          ],
        },
      });
    });

    // ✅ API 404 handler (must be BEFORE app.get("*"))
    app.all("/api/*", (req, res) => {
      res.status(404).json({ error: "API route not found" });
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
