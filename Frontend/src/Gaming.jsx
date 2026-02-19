import { useEffect, useMemo, useState } from "react";
import TicTacToeModal from "./components/TicTacToeModal.jsx";
import SpeedTypingModal from "./components/SpeedTypingModal.jsx";
import ChessModal from "./components/ChessModal.jsx";
import TetrisModal from "./components/TetrisModal.jsx";
import MemoryMatchModal from "./components/MemoryMatchModal.jsx";
import ReactionTestModal from "./components/ReactionTestModal.jsx";
import LogicPuzzlesModal from "./components/LogicPuzzlesModal.jsx";
import WordSprintModal from "./components/WordSprintModal.jsx";
import MathSprintModal from "./components/MathSprintModal.jsx";
import SequenceRecallModal from "./components/SequenceRecallModal.jsx";
import AimTrainerModal from "./components/AimTrainerModal.jsx";
import CodeBreakerModal from "./components/CodeBreakerModal.jsx";
import { API_ENDPOINTS } from "./config/api.js";

const TETRIS_IMAGE = "https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=1200&auto=format&fit=crop";

const gameCatalog = {
  "Chess Tactics": {
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1523875194681-bedd468c58bf",
    playable: true,
    difficulty: "Medium",
    description: "Improve board vision, tactical patterns, and endgame thinking.",
  },
  "Speed Typing": {
    category: "Reflex",
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d",
    playable: true,
    difficulty: "Easy",
    description: "Build typing speed and precision using AI-generated paragraphs.",
  },
  "Tic Tac Toe AI": {
    category: "Logic",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
    playable: true,
    difficulty: "Easy",
    description: "Play quick strategic rounds against perfect minimax AI.",
  },
  Tetris: {
    category: "Arcade",
    image: TETRIS_IMAGE,
    playable: true,
    difficulty: "Hard",
    description: "Train spatial reasoning and fast decision making under pressure.",
  },
  "Memory Match": {
    category: "Logic",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
    playable: true,
    difficulty: "Easy",
    description: "Memory workload training with increasing sequence complexity.",
  },
  "Reaction Test": {
    category: "Reflex",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211",
    playable: true,
    difficulty: "Easy",
    description: "Benchmark response time and consistency across rounds.",
  },
  "Logic Puzzles": {
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
    playable: true,
    difficulty: "Medium",
    description: "Pattern solving and deduction mini challenges.",
  },
  "Word Sprint": {
    category: "Reflex",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
    playable: true,
    difficulty: "Medium",
    description: "Rapid word recognition and recall under time pressure.",
  },
  "Math Sprint": {
    category: "Logic",
    image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d",
    playable: true,
    difficulty: "Medium",
    description: "Mental arithmetic speed rounds with accuracy tracking.",
  },
  "Sequence Recall": {
    category: "Logic",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    playable: true,
    difficulty: "Hard",
    description: "Repeat increasingly long color sequences.",
  },
  "Aim Trainer": {
    category: "Reflex",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    playable: true,
    difficulty: "Medium",
    description: "Target-click precision training with hit-rate scoring.",
  },
  "Code Breaker": {
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    playable: true,
    difficulty: "Hard",
    description: "Deductive puzzle: break the 4-digit secret code.",
  },
  "Sudoku Master": {
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
    playable: false,
    difficulty: "Hard",
    description: "Concentration and planning with advanced sudoku boards.",
  },
};

const featuredGames = [
  "Chess Tactics",
  "Speed Typing",
  "Tetris",
  "Reaction Test",
  "Logic Puzzles",
  "Word Sprint",
  "Math Sprint",
  "Sequence Recall",
  "Aim Trainer",
  "Code Breaker",
  "Sudoku Master",
];

const popularGames = Object.keys(gameCatalog);

const STORAGE_KEYS = {
  favorites: "gaming.favorites.v1",
  sessions: "gaming.sessions.v1",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function Gaming() {
  const [games, setGames] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  const [showTTT, setShowTTT] = useState(false);
  const [showChess, setShowChess] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showTetris, setShowTetris] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showReaction, setShowReaction] = useState(false);
  const [showLogic, setShowLogic] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [showSequence, setShowSequence] = useState(false);
  const [showAim, setShowAim] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [addQuery, setAddQuery] = useState("");
  const [customGame, setCustomGame] = useState("");

  const [favorites, setFavorites] = useState(() => readJSON(STORAGE_KEYS.favorites, []));
  const [sessions, setSessions] = useState(() => readJSON(STORAGE_KEYS.sessions, []));

  const [infoGame, setInfoGame] = useState(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.gaming, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setGames(data.games || []))
      .catch((err) => {
        console.error("GET games error:", err);
        alert("Failed to load games. Are you logged in?");
      });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  }, [sessions]);

  const enrichedGames = useMemo(() => {
    return games.map((g) => {
      const meta = gameCatalog[g.title] || {};
      return {
        ...g,
        category: meta.category || "General",
        playable: !!meta.playable,
        description: meta.description || "Skill building game module.",
        difficulty: meta.difficulty || "Mixed",
      };
    });
  }, [games]);

  const filteredGames = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enrichedGames.filter((g) => {
      const matchesSearch = g.title.toLowerCase().includes(q);
      const matchesFilter = filter === "All" ? true : g.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [enrichedGames, search, filter]);

  const addableGames = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    return popularGames.filter((name) => name.toLowerCase().includes(q));
  }, [addQuery]);

  const stats = useMemo(() => {
    const playable = enrichedGames.filter((g) => g.playable).length;
    const totalSessions = sessions.length;
    const thisWeek = sessions.filter((s) => Date.now() - s.ts < 7 * 24 * 60 * 60 * 1000).length;
    return {
      library: games.length,
      playable,
      totalSessions,
      thisWeek,
    };
  }, [enrichedGames, games.length, sessions]);

  function addGame(title) {
    if (!title || !title.trim()) return;
    const selected = title.trim();
    const image = gameCatalog[selected]?.image || "https://images.unsplash.com/photo-1511512578047-dfb367046420";

    fetch(API_ENDPOINTS.gaming, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: selected, image_url: image }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (data.game) {
          setGames((prev) => [data.game, ...prev]);
          setCustomGame("");
          setShowAddPopup(false);
        }
      })
      .catch((err) => {
        console.error("POST game error:", err);
        alert("Failed to add game.");
      });
  }

  function requestDelete(game) {
    setGameToDelete(game);
    setShowDeletePopup(true);
  }

  function confirmDelete() {
    fetch(`${API_ENDPOINTS.gaming}/${gameToDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        setGames((prev) => prev.filter((g) => g.id !== gameToDelete.id));
        setShowDeletePopup(false);
        setGameToDelete(null);
      })
      .catch((err) => {
        console.error("DELETE game error:", err);
        alert("Failed to delete game.");
      });
  }

  function toggleFavorite(title) {
    setFavorites((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  }

  function recordSession(title) {
    setSessions((prev) => [{ title, ts: Date.now() }, ...prev].slice(0, 50));
  }

  function handleOpenGame(game) {
    if (game.title === "Speed Typing") {
      recordSession(game.title);
      setShowTyping(true);
    } else if (game.title === "Chess Tactics") {
      recordSession(game.title);
      setShowChess(true);
    } else if (game.title === "Tic Tac Toe AI") {
      recordSession(game.title);
      setShowTTT(true);
    } else if (game.title === "Tetris") {
      recordSession(game.title);
      setShowTetris(true);
    } else if (game.title === "Memory Match") {
      recordSession(game.title);
      setShowMemory(true);
    } else if (game.title === "Reaction Test") {
      recordSession(game.title);
      setShowReaction(true);
    } else if (game.title === "Logic Puzzles") {
      recordSession(game.title);
      setShowLogic(true);
    } else if (game.title === "Word Sprint") {
      recordSession(game.title);
      setShowWord(true);
    } else if (game.title === "Math Sprint") {
      recordSession(game.title);
      setShowMath(true);
    } else if (game.title === "Sequence Recall") {
      recordSession(game.title);
      setShowSequence(true);
    } else if (game.title === "Aim Trainer") {
      recordSession(game.title);
      setShowAim(true);
    } else if (game.title === "Code Breaker") {
      recordSession(game.title);
      setShowCode(true);
    } else {
      setInfoGame(game);
    }
  }

  const categories = ["All", "Strategy", "Logic", "Reflex", "Arcade", "General"];

  return (
    <div style={{ padding: "32px", maxWidth: "1240px", margin: "0 auto" }}>
      <section style={heroStyle}>
        <div>
          <h1 style={{ margin: 0, color: "#0f172a" }}>Gaming Arena</h1>
          <p style={{ margin: "8px 0 0", color: "#334155" }}>
            Practice strategy, reflex, and focus through curated mini games and training loops.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => setShowAddPopup(true)} style={btnPrimary}>+ Add Game</button>
          <button onClick={() => setDeleteMode((prev) => !prev)} style={deleteMode ? btnNeutral : btnDanger}>
            {deleteMode ? "Done" : "Remove Game"}
          </button>
        </div>
      </section>

      <section style={statsGrid}>
        <MetricCard title="Library" value={stats.library} subtitle="Games in your profile" />
        <MetricCard title="Playable" value={stats.playable} subtitle="Ready to launch now" />
        <MetricCard title="Sessions" value={stats.totalSessions} subtitle="All-time training runs" />
        <MetricCard title="This Week" value={stats.thisWeek} subtitle="Recent activity streak" />
      </section>

      <section style={{ ...panelStyle, marginTop: "20px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search games"
            style={{ ...inputStyle, minWidth: "260px" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                style={{ ...chipStyle, background: filter === c ? "#0ea5e9" : "#e2e8f0", color: filter === c ? "#fff" : "#0f172a" }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <h2 style={sectionTitle}>Your Games</h2>
      <div style={gridStyle}>
        {filteredGames.map((g) => (
          <GameCard
            key={g.id}
            game={g}
            deletable={deleteMode}
            favorite={favorites.includes(g.title)}
            onDelete={() => requestDelete(g)}
            onFavorite={() => toggleFavorite(g.title)}
            onOpen={() => handleOpenGame(g)}
          />
        ))}
      </div>

      <h2 style={{ ...sectionTitle, marginTop: "42px" }}>Suggested Challenges</h2>
      <div style={gridStyle}>
        {featuredGames.map((title) => {
          const g = gameCatalog[title];
          return (
            <div key={title} style={featuredCardStyle} onClick={() => handleOpenGame({ title, ...g })}>
              <img src={g.image} alt={title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
              <div style={{ padding: "12px" }}>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{title}</div>
                <div style={{ color: "#475569", fontSize: "12px", marginTop: "6px" }}>
                  {g.category} • {g.difficulty} • {g.playable ? "Playable" : "Coming Soon"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showTTT && <TicTacToeModal onClose={() => setShowTTT(false)} />}
      {showTyping && <SpeedTypingModal onClose={() => setShowTyping(false)} />}
      {showChess && <ChessModal onClose={() => setShowChess(false)} />}
      {showTetris && <TetrisModal onClose={() => setShowTetris(false)} />}
      {showMemory && <MemoryMatchModal onClose={() => setShowMemory(false)} />}
      {showReaction && <ReactionTestModal onClose={() => setShowReaction(false)} />}
      {showLogic && <LogicPuzzlesModal onClose={() => setShowLogic(false)} />}
      {showWord && <WordSprintModal onClose={() => setShowWord(false)} />}
      {showMath && <MathSprintModal onClose={() => setShowMath(false)} />}
      {showSequence && <SequenceRecallModal onClose={() => setShowSequence(false)} />}
      {showAim && <AimTrainerModal onClose={() => setShowAim(false)} />}
      {showCode && <CodeBreakerModal onClose={() => setShowCode(false)} />}

      {showAddPopup && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "760px" }}>
            <button onClick={() => setShowAddPopup(false)} style={closeBtn}>x</button>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>Add Game</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", marginBottom: "12px" }}>
              <input
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
                placeholder="Create custom game"
                style={inputStyle}
              />
              <button onClick={() => addGame(customGame)} style={btnPrimary}>Create</button>
            </div>

            <input
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
              placeholder="Search available games"
              style={{ ...inputStyle, width: "100%", marginBottom: "12px" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "10px", maxHeight: "54vh", overflowY: "auto" }}>
              {addableGames.map((name) => (
                <button key={name} onClick={() => addGame(name)} style={addGameButtonStyle}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && gameToDelete && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "420px", textAlign: "center" }}>
            <h3 style={{ marginTop: 0, color: "#0f172a" }}>Remove Game</h3>
            <p style={{ color: "#475569" }}>
              Are you sure you want to remove <strong>{gameToDelete.title}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={() => setShowDeletePopup(false)} style={btnNeutral}>Cancel</button>
              <button onClick={confirmDelete} style={btnDanger}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {infoGame && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "540px" }}>
            <button onClick={() => setInfoGame(null)} style={closeBtn}>x</button>
            <h3 style={{ marginTop: 0, color: "#0f172a" }}>{infoGame.title}</h3>
            <p style={{ color: "#334155", lineHeight: 1.6 }}>{infoGame.description || "Game module is in development."}</p>
            <div style={{ ...panelStyle, marginBottom: "12px" }}>
              <strong>Category:</strong> {infoGame.category || "General"}
              <br />
              <strong>Difficulty:</strong> {infoGame.difficulty || "Mixed"}
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
              This game is not playable yet. Keep it in your library and it will unlock in a future update.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, deletable, favorite, onDelete, onFavorite, onOpen }) {
  return (
    <div style={gameCardStyle} onClick={onOpen}>
      {deletable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={deleteXStyle}
        >
          x
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
        style={{ ...favButtonStyle, background: favorite ? "#f59e0b" : "rgba(15,23,42,0.6)" }}
      >
        {favorite ? "Fav" : "+Fav"}
      </button>

      <img src={game.image_url || gameCatalog[game.title]?.image} alt={game.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
      <div style={{ padding: "12px" }}>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>{game.title}</div>
        <div style={{ marginTop: "6px", color: "#64748b", fontSize: "12px" }}>
          {game.category} • {game.difficulty}
        </div>
        <div style={{ marginTop: "8px", fontSize: "12px", color: game.playable ? "#166534" : "#b45309" }}>
          {game.playable ? "Playable now" : "Coming soon"}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ color: "#475569", fontSize: "13px" }}>{title}</div>
      <div style={{ color: "#0f172a", fontSize: "28px", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "12px" }}>{subtitle}</div>
    </div>
  );
}

const heroStyle = {
  background: "linear-gradient(130deg, #f8fafc, #e2e8f0)",
  borderRadius: "18px",
  padding: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  border: "1px solid rgba(148,163,184,0.35)",
};

const statsGrid = {
  marginTop: "16px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const metricCardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "14px",
  padding: "16px",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
};

const panelStyle = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: "14px",
  padding: "14px",
  border: "1px solid rgba(148,163,184,0.26)",
};

const sectionTitle = { color: "#0f172a", marginTop: "28px", marginBottom: "12px" };

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: "14px",
};

const featuredCardStyle = {
  background: "#f8fafc",
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid rgba(148,163,184,0.3)",
  boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
  cursor: "pointer",
};

const gameCardStyle = {
  background: "white",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 12px 26px rgba(15,23,42,0.1)",
  position: "relative",
  border: "1px solid rgba(148,163,184,0.2)",
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 120,
  padding: "16px",
};

const modalStyle = {
  width: "100%",
  background: "white",
  borderRadius: "16px",
  padding: "20px",
  position: "relative",
  boxShadow: "0 30px 50px rgba(2,6,23,0.35)",
};

const closeBtn = {
  position: "absolute",
  top: 12,
  right: 12,
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
};

const inputStyle = {
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "9px 11px",
  fontSize: "14px",
  outline: "none",
};

const btnPrimary = {
  padding: "9px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnDanger = {
  padding: "9px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnNeutral = {
  padding: "9px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#64748b",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const chipStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "12px",
};

const addGameButtonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  padding: "10px",
  cursor: "pointer",
  background: "#f8fafc",
  color: "#0f172a",
  fontWeight: 600,
};

const deleteXStyle = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 26,
  height: 26,
  border: "none",
  borderRadius: "999px",
  background: "rgba(220,38,38,0.95)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  zIndex: 3,
};

const favButtonStyle = {
  position: "absolute",
  top: 8,
  left: 8,
  border: "none",
  borderRadius: "999px",
  color: "white",
  fontWeight: 700,
  fontSize: "11px",
  padding: "5px 8px",
  cursor: "pointer",
  zIndex: 3,
};

export default Gaming;
