import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, setDoc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { calculateStreak } from "../utils/streakCalculator";
import { useNavigate } from "react-router-dom";

function ProgressRing({ percentage, color, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(233,30,140,0.1)" strokeWidth="10" fill="none" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        stroke={color} strokeWidth="10" fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease", filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

function TreeWidget({ completedToday, total, theme, themeName }) {
  const level = Math.min(Math.floor((completedToday / Math.max(total, 1)) * 5), 5);
  const treeEmojis = themeName === "sakura"
    ? ["🌱", "🌿", "🌸", "🌸🌸", "🌳", "🌸🌳🌸"]
    : ["🌱", "🌿", "🍂", "🍁🌿", "🌲", "🍂🌲🍂"];
  const isSakura = themeName === "sakura";

  return (
    <div
      className="rounded-3xl p-5 flex flex-col items-center justify-center h-full"
      style={{
        background: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 8px 32px rgba(219,112,147,0.1)",
        backdropFilter: "blur(40px)",
      }}
    >
      <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: "#9d7088" }}>
        {isSakura ? "Sakura Tree" : "Autumn Tree"}
      </p>
      <div className="text-5xl my-2 animate-float">{treeEmojis[level]}</div>
      <p className="font-semibold text-sm mt-2" style={{ color: "#3d1f2d", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}>
        Level {level + 1}
      </p>
      <div className="w-full mt-3 h-1.5 rounded-full" style={{ background: "rgba(233,30,140,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${(completedToday / Math.max(total, 1)) * 100}%`,
            background: "linear-gradient(90deg, #e91e8c, #f06292)",
            boxShadow: "0 0 8px rgba(233,30,140,0.4)",
          }}
        />
      </div>
      <p className="text-xs mt-2" style={{ color: "#9d7088" }}>{completedToday}/{total} habits done</p>
    </div>
  );
}

function Dashboard() {
  const { theme, themeName } = useTheme();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [streaks, setStreaks] = useState({});
  const [displayName, setDisplayName] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";
  const user = auth.currentUser;
  const isSakura = themeName === "sakura";

  const motivationalQuotes = {
    galaxy: "Every star you reach makes the universe brighter. ✨",
    sakura: "Little by little, a little becomes a lot. 🌸",
    autumn: "Every leaf that falls is a reminder that change is beautiful. 🍂",
  };

  useEffect(() => {
    const fetchName = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists() && snap.data().displayName) {
        setDisplayName(snap.data().displayName);
      }
    };
    fetchName();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "habits"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHabits(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const newCompletions = {};
      const newStreaks = {};
      for (const habit of habits) {
        const ref = doc(db, "completions", `${habit.id}_${today}`);
        const snap = await getDoc(ref);
        if (snap.exists()) newCompletions[habit.id] = true;
        const q = query(
          collection(db, "completions"),
          where("habitId", "==", habit.id),
          where("userId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        newStreaks[habit.id] = calculateStreak(snapshot.docs.map((d) => d.data().date));
      }
      setCompletions(newCompletions);
      setStreaks(newStreaks);
    };
    if (habits.length > 0) fetch();
  }, [habits]);

  const handleToggle = async (habitId) => {
    const ref = doc(db, "completions", `${habitId}_${today}`);
    if (completions[habitId]) {
      await deleteDoc(ref);
      setCompletions((prev) => ({ ...prev, [habitId]: false }));
    } else {
      await setDoc(ref, { habitId, userId: auth.currentUser.uid, date: today });
      setCompletions((prev) => ({ ...prev, [habitId]: true }));
    }
  };

  const handleDelete = async (habitId) => {
    await deleteDoc(doc(db, "habits", habitId));
  };

  const completedToday = Object.values(completions).filter(Boolean).length;
  const percentage = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const totalStreak = Object.values(streaks).length > 0 ? Math.max(...Object.values(streaks), 0) : 0;
  const showTree = themeName === "sakura" || themeName === "autumn";

  const cardStyle = {
    background: isSakura ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.05)",
    border: isSakura ? "1px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.08)",
    boxShadow: isSakura ? "0 8px 32px rgba(219,112,147,0.1)" : "none",
    backdropFilter: "blur(40px)",
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-5 page-enter">

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1
              className="font-display"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "42px",
                fontWeight: "600",
                color: isSakura ? "#3d1f2d" : "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: "1.1",
              }}
            >
              {greeting}, {displayName || user?.email?.split("@")[0]} {greetingEmoji}
            </h1>
            <p
              className="mt-1 text-sm font-light italic"
              style={{
                color: isSakura ? "#9d7088" : "rgba(255,255,255,0.5)",
                fontFamily: "'Crimson Pro', serif",
              }}
            >
              {motivationalQuotes[themeName]}
            </p>
          </div>

          {/* Streak & Points */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={cardStyle}
            >
              <span>🔥</span>
              <span className="font-bold text-sm" style={{ color: isSakura ? "#3d1f2d" : "#ffffff" }}>{totalStreak}</span>
              <span className="text-xs" style={{ color: isSakura ? "#9d7088" : "rgba(255,255,255,0.5)" }}>Streak</span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-2xl"
              style={cardStyle}
            >
              <span>💎</span>
              <span className="font-bold text-sm" style={{ color: isSakura ? "#3d1f2d" : "#ffffff" }}>{completedToday * 50}</span>
              <span className="text-xs" style={{ color: isSakura ? "#9d7088" : "rgba(255,255,255,0.5)" }}>Points</span>
            </div>
          </div>
        </div>

        {/* Top Row */}
        <div className={`grid gap-4 ${showTree ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>

          {/* Progress Ring Card */}
          <div className="rounded-3xl p-6 flex items-center gap-5" style={cardStyle}>
            <div className="relative flex-shrink-0">
              <ProgressRing percentage={percentage} color={theme.progressRing} size={110} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-bold"
                  style={{
                    fontSize: "20px",
                    color: isSakura ? "#3d1f2d" : "#ffffff",
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  {completedToday}/{habits.length}
                </span>
                <span className="text-xs" style={{ color: isSakura ? "#9d7088" : "rgba(255,255,255,0.5)" }}>Done</span>
              </div>
            </div>
            <div>
              <p
                className="font-semibold mb-1"
                style={{
                  color: isSakura ? "#3d1f2d" : "#ffffff",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "18px",
                }}
              >
                {percentage === 100 ? "All done! 🎉" : percentage > 50 ? "You're on track!" : "Keep going!"}
              </p>
              <p className="text-xs mb-3" style={{ color: isSakura ? "#9d7088" : "rgba(255,255,255,0.5)" }}>
                {percentage === 100
                  ? "Amazing work today!"
                  : `Complete all habits to ${isSakura ? "water your sakura tree 🌸" : "grow your streak ✨"}`}
              </p>
              <button
                onClick={() => navigate("/habits")}
                className="px-4 py-2 rounded-2xl text-xs font-medium text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: isSakura ? "linear-gradient(135deg, #e91e8c, #f06292)" : `linear-gradient(135deg, ${theme.progressRing}, ${theme.progressRing}80)`,
                  boxShadow: isSakura ? "0 4px 16px rgba(233,30,140,0.3)" : "none",
                }}
              >
                View All Habits →
              </button>
            </div>
          </div>

          {/* Weekly Overview */}
          <div className="rounded-3xl p-6" style={cardStyle}>
            <p
              className="font-semibold mb-1"
              style={{
                color: isSakura ? "#3d1f2d" : "#ffffff",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "18px",
              }}
            >
              Weekly Overview
            </p>
            <p
              className="text-2xl font-bold mb-4"
              style={{ color: isSakura ? "#e91e8c" : theme.progressRing }}
            >
              {percentage}%
            </p>
          <div className="flex items-end gap-2 h-16">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-xl transition-all duration-500"
                  style={{
                    height: `${20 + i * 11}%`,
                    background: isSakura
                      ? `linear-gradient(180deg, #f9a8c9, #e91e8c)`
                      : `linear-gradient(180deg, ${theme.progressRing}80, ${theme.progressRing})`,
                    opacity: i < 5 ? 1 : 0.35,
                    boxShadow: i < 5 ? `0 2px 8px rgba(233,30,140,0.25)` : "none",
                    minHeight: "8px",
                  }}
                />
                <span className="text-xs font-medium" style={{ color: isSakura ? "#c4a0b0" : "rgba(255,255,255,0.4)" }}>
                  {day[0]}
                </span>
              </div>
            ))}
          </div>          </div>

          {/* Tree Widget */}
          {showTree && (
            <TreeWidget
              completedToday={completedToday}
              total={habits.length}
              theme={theme}
              themeName={themeName}
            />
          )}
        </div>

        {/* Habits Section */}
        <div className="rounded-3xl p-6" style={cardStyle}>
          <div className="flex items-center justify-between mb-5">
            <p
              style={{
                color: isSakura ? "#3d1f2d" : "#ffffff",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px",
                fontWeight: "600",
              }}
            >
              Your Habits
            </p>
            <button
              onClick={() => navigate("/habits")}
              className="px-4 py-2 rounded-2xl text-xs font-medium text-white transition-all duration-200 hover:scale-105"
              style={{
                background: isSakura ? "linear-gradient(135deg, #e91e8c, #f06292)" : `linear-gradient(135deg, ${theme.progressRing}, ${theme.progressRing}80)`,
                boxShadow: isSakura ? "0 4px 16px rgba(233,30,140,0.25)" : "none",
              }}
            >
              + Add Habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🌱</p>
              <p
                className="font-medium"
                style={{ color: isSakura ? "#3d1f2d" : "#ffffff", fontFamily: "'Cormorant Garamond', serif", fontSize: "18px" }}
              >
                No habits yet
              </p>
              <p className="text-sm mt-1" style={{ color: isSakura ? "#9d7088" : "rgba(255,255,255,0.5)" }}>
                Head to Habits page to plant your first seed
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] group"
                  style={{
                    background: completions[habit.id]
                      ? isSakura ? "linear-gradient(135deg, rgba(233,30,140,0.08), rgba(240,98,146,0.05))" : "rgba(255,255,255,0.08)"
                      : isSakura ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.03)",
                    border: completions[habit.id]
                      ? isSakura ? "1px solid rgba(233,30,140,0.2)" : "1px solid rgba(255,255,255,0.15)"
                      : isSakura ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: completions[habit.id] && isSakura ? "0 4px 16px rgba(233,30,140,0.08)" : "none",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 hover:scale-110"
                      style={{
                        background: completions[habit.id]
                          ? isSakura ? "linear-gradient(135deg, #e91e8c, #f06292)" : theme.progressRing
                          : "transparent",
                        borderColor: completions[habit.id]
                          ? "transparent"
                          : isSakura ? "rgba(233,30,140,0.3)" : "rgba(255,255,255,0.2)",
                        boxShadow: completions[habit.id] ? "0 4px 12px rgba(233,30,140,0.3)" : "none",
                      }}
                    >
                      {completions[habit.id] && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${habit.color?.split(" ")[1] || "#e91e8c"}, ${habit.color?.split(" ")[3] || "#f06292"})` }}
                    >
                      {habit.icon || "📚"}
                    </div>
                    <div>
                      <p
                        className="font-medium text-sm"
                        style={{
                          color: completions[habit.id]
                            ? isSakura ? "#c4a0b0" : "rgba(255,255,255,0.4)"
                            : isSakura ? "#3d1f2d" : "#ffffff",
                          textDecoration: completions[habit.id] ? "line-through" : "none",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {habit.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: isSakura ? "#e91e8c" : theme.progressRing }}>
                        🔥 {streaks[habit.id] || 0} day streak
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex gap-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                          style={{
                            background: i === new Date().getDay() - 1 && completions[habit.id]
                              ? isSakura ? "linear-gradient(135deg, #e91e8c, #f06292)" : theme.progressRing
                              : isSakura ? "rgba(233,30,140,0.08)" : "rgba(255,255,255,0.05)",
                            color: i === new Date().getDay() - 1 && completions[habit.id]
                              ? "#ffffff"
                              : isSakura ? "#9d7088" : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: isSakura ? "#c4a0b0" : "rgba(255,255,255,0.3)" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;