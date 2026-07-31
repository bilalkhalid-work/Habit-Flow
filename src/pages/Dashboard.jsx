import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, setDoc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { calculateStreak } from "../utils/streakCalculator";

function ProgressRing({ percentage, color, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        stroke={color} strokeWidth="8" fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

function Dashboard() {
  const { theme } = useTheme();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [streaks, setStreaks] = useState({});
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 17 ? "☀️" : "🌙";

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
  const totalStreak = Math.max(...Object.values(streaks), 0);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>
              {greeting}, {auth.currentUser?.email?.split("@")[0]} {greetingEmoji}
            </h1>
            <p className={`${theme.textMuted} mt-1`}>Keep going, growth happens daily.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.card} border backdrop-blur-sm`}>
              <span>🔥</span>
              <span className={`font-bold ${theme.text}`}>{totalStreak}</span>
              <span className={`text-xs ${theme.textMuted}`}>Streak</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.card} border backdrop-blur-sm`}>
              <span>💎</span>
              <span className={`font-bold ${theme.text}`}>{completedToday * 50}</span>
              <span className={`text-xs ${theme.textMuted}`}>Points</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">

          {/* Progress Ring */}
          <div className={`col-span-1 ${theme.card} border backdrop-blur-xl rounded-2xl p-6 flex flex-col items-center justify-center`}>
            <div className="relative">
              <ProgressRing percentage={percentage} color={theme.progressRing} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${theme.text}`}>{completedToday}/{habits.length}</span>
                <span className={`text-xs ${theme.textMuted}`}>Done</span>
              </div>
            </div>
            <p className={`mt-3 font-semibold ${theme.text}`}>Today's Progress</p>
            <p className={`text-sm ${theme.textMuted}`}>{percentage === 100 ? "All done! 🎉" : "Keep going!"}</p>
          </div>

          {/* Weekly Overview */}
          <div className={`col-span-2 ${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
            <h3 className={`font-semibold ${theme.text} mb-4`}>Weekly Overview</h3>
            <div className="flex items-end gap-2 h-24">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const height = Math.random() * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-lg bg-gradient-to-t ${theme.accent} opacity-70`}
                      style={{ height: `${30 + i * 10}%` }}
                    />
                    <span className={`text-xs ${theme.textMuted}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Habits Section */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`font-semibold text-lg ${theme.text}`}>Your Habits</h3>
            <button
              onClick={() => window.location.href = "/habits"}
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
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        completions[habit.id]
                          ? `bg-gradient-to-br ${theme.accent} border-transparent text-white`
                          : `border-white/30 hover:border-white/60`
                      }`}
                    >
                      {completions[habit.id] && <span className="text-xs">✓</span>}
                    </button>
                    <div>
                      <p className={`font-medium ${completions[habit.id] ? "line-through opacity-60" : ""} ${theme.text}`}>
                        {habit.name}
                      </p>
                      <p className={`text-xs ${theme.textMuted}`}>🔥 {streaks[habit.id] || 0} day streak</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className={`text-xs ${theme.textMuted} hover:text-red-400 transition-colors`}
                  >
                    ✕
                  </button>
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