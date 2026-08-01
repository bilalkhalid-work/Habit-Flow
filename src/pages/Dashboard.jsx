import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, setDoc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { calculateStreak } from "../utils/streakCalculator";
import { useNavigate } from "react-router-dom";

function ProgressRing({ percentage, color, size = 140 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        stroke={color} strokeWidth="10" fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function TreeWidget({ completedToday, total, theme, themeName }) {
  const level = Math.min(Math.floor((completedToday / Math.max(total, 1)) * 5), 5);
  const treeEmojis = themeName === "sakura"
    ? ["🌱", "🌿", "🌸", "🌸🌸", "🌳", "🌸🌳🌸"]
    : ["🌱", "🌿", "🍂", "🍁🌿", "🌲", "🍂🌲🍂"];

  return (
    <div className={`${theme.card} border rounded-2xl p-5 flex flex-col items-center justify-center`}>
      <p className={`text-xs font-medium ${theme.textMuted} mb-2`}>
        {themeName === "sakura" ? "Sakura Tree" : "Autumn Tree"}
      </p>
      <div className="text-5xl my-3">{treeEmojis[level]}</div>
      <p className={`text-sm font-semibold ${theme.text}`}>Level {level + 1}</p>
      <div className={`w-full mt-3 h-1.5 rounded-full bg-white/10`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${theme.accent} transition-all duration-1000`}
          style={{ width: `${(completedToday / Math.max(total, 1)) * 100}%` }}
        />
      </div>
      <p className={`text-xs ${theme.textMuted} mt-2`}>{completedToday}/{total} habits done</p>
    </div>
  );
}

function Dashboard() {
  const { theme, themeName } = useTheme();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [streaks, setStreaks] = useState({});
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";
  const user = auth.currentUser;

  const motivationalQuotes = {
    galaxy: "Every star you reach makes the universe brighter. ✨",
    sakura: "Little by little, a little becomes a lot. 🌸",
    autumn: "Every leaf that falls is a reminder that change is beautiful. 🍂",
  };

  useEffect(() => {
    const q = query(
      collection(db, "habits"),
      where("userId", "==", auth.currentUser.uid)
    );
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${theme.text}`}>
              {greeting}, {user?.email?.split("@")[0]} {greetingEmoji}
            </h1>
            <p className={`${theme.textMuted} mt-1 text-sm italic`}>{motivationalQuotes[themeName]}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${theme.card} border`}>
              <span>🔥</span>
              <span className={`font-bold ${theme.text} text-sm`}>{totalStreak}</span>
              <span className={`text-xs ${theme.textMuted}`}>Streak</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${theme.card} border`}>
              <span>💎</span>
              <span className={`font-bold ${theme.text} text-sm`}>{completedToday * 50}</span>
              <span className={`text-xs ${theme.textMuted}`}>Points</span>
            </div>
          </div>
        </div>

        {/* Top Row */}
        <div className={`grid gap-4 ${showTree ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>

          {/* Progress Ring */}
          <div className={`${theme.card} border rounded-2xl p-6 flex items-center gap-6`}>
            <div className="relative flex-shrink-0">
              <ProgressRing percentage={percentage} color={theme.progressRing} size={120} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${theme.text}`}>{completedToday}/{habits.length}</span>
                <span className={`text-xs ${theme.textMuted}`}>Done</span>
              </div>
            </div>
            <div>
              <p className={`font-bold text-lg ${theme.text}`}>
                {percentage === 100 ? "All done! 🎉" : percentage > 50 ? "You're on track!" : "Keep going!"}
              </p>
              <p className={`text-sm ${theme.textMuted} mt-1`}>
                {percentage === 100 ? "Amazing work today!" : `Complete all habits to ${themeName === "sakura" ? "water your sakura tree 🌸" : themeName === "autumn" ? "grow your tree 🍂" : "light up the galaxy ✨"}`}
              </p>
              <button
                onClick={() => navigate("/habits")}
                className={`mt-3 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r ${theme.accent} text-white shadow-lg hover:scale-105 transition-transform`}
              >
                View All Habits →
              </button>
            </div>
          </div>

          {/* Weekly Overview */}
          <div className={`${theme.card} border rounded-2xl p-6`}>
            <h3 className={`font-semibold ${theme.text} mb-1`}>Weekly Overview</h3>
            <p className={`text-2xl font-bold ${theme.accentText} mb-4`}>{percentage}%</p>
            <div className="flex items-end gap-1.5 h-16">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-md bg-gradient-to-t ${theme.accent} opacity-70`}
                    style={{ height: `${20 + i * 12}%` }}
                  />
                  <span className={`text-xs ${theme.textMuted}`}>{day[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tree Widget - only for Sakura and Autumn */}
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
        <div className={`${theme.card} border rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`font-semibold text-lg ${theme.text}`}>Your Habits</h3>
            <button
              onClick={() => navigate("/habits")}
              className={`px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r ${theme.accent} text-white shadow-lg hover:scale-105 transition-transform`}
            >
              + Add Habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🌱</p>
              <p className={`font-medium ${theme.text}`}>No habits yet</p>
              <p className={`text-sm ${theme.textMuted}`}>Head to Habits page to add your first one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                    completions[habit.id]
                      ? `bg-gradient-to-r ${theme.accent} bg-opacity-10 border-transparent`
                      : `bg-white/5 ${theme.accentBorder}`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        completions[habit.id]
                          ? `bg-gradient-to-br ${theme.accent} border-transparent text-white`
                          : `border-white/30 hover:border-white/60`
                      }`}
                    >
                      {completions[habit.id] && <span className="text-xs">✓</span>}
                    </button>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${habit.color || theme.accent} flex items-center justify-center text-sm flex-shrink-0`}>
                      {habit.icon || "📚"}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${completions[habit.id] ? "line-through opacity-60" : ""} ${theme.text}`}>
                        {habit.name}
                      </p>
                      <p className={`text-xs ${theme.textMuted}`}>🔥 {streaks[habit.id] || 0} day streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex gap-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            i === new Date().getDay() - 1 && completions[habit.id]
                              ? `bg-gradient-to-br ${theme.accent} text-white`
                              : "bg-white/10 " + theme.textMuted
                          }`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className={`text-xs ${theme.textMuted} hover:text-red-400 transition-colors`}
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