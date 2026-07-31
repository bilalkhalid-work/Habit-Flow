import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { calculateStreak } from "../utils/streakCalculator";

function StatsPage() {
  const { theme } = useTheme();
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({});
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const habitsSnap = await getDocs(
        query(collection(db, "habits"), where("userId", "==", auth.currentUser.uid))
      );
      const habitsData = habitsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHabits(habitsData);

      let total = 0;
      let best = 0;
      const newStats = {};

      for (const habit of habitsData) {
        const snap = await getDocs(
          query(
            collection(db, "completions"),
            where("habitId", "==", habit.id),
            where("userId", "==", auth.currentUser.uid)
          )
        );
        const dates = snap.docs.map((d) => d.data().date);
        const streak = calculateStreak(dates);
        newStats[habit.id] = {
          completions: dates.length,
          streak,
          percentage: Math.round((dates.length / 30) * 100),
        };
        total += dates.length;
        if (streak > best) best = streak;
      }

      setStats(newStats);
      setTotalCompletions(total);
      setBestStreak(best);
    };

    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>Stats & Insights</h1>
          <p className={`${theme.textMuted} mt-1`}>Track your consistency over time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6 text-center`}>
            <p className="text-4xl mb-2">🔥</p>
            <p className={`text-3xl font-bold ${theme.text}`}>{bestStreak}</p>
            <p className={`text-sm ${theme.textMuted} mt-1`}>Best Streak</p>
          </div>
          <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6 text-center`}>
            <p className="text-4xl mb-2">✅</p>
            <p className={`text-3xl font-bold ${theme.text}`}>{totalCompletions}</p>
            <p className={`text-sm ${theme.textMuted} mt-1`}>Total Completions</p>
          </div>
          <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6 text-center`}>
            <p className="text-4xl mb-2">📊</p>
            <p className={`text-3xl font-bold ${theme.text}`}>{habits.length}</p>
            <p className={`text-sm ${theme.textMuted} mt-1`}>Habits Tracked</p>
          </div>
        </div>

        {/* Per Habit Stats */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-5`}>Habit Performance</h2>
          {habits.length === 0 ? (
            <p className={`text-center py-8 ${theme.textMuted}`}>No habits to show stats for yet.</p>
          ) : (
            <div className="space-y-5">
              {habits.map((habit) => (
                <div key={habit.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{habit.icon || "📚"}</span>
                      <span className={`font-medium ${theme.text}`}>{habit.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${theme.textMuted}`}>🔥 {stats[habit.id]?.streak || 0} streak</span>
                      <span className={`text-sm font-bold ${theme.accentText}`}>{stats[habit.id]?.completions || 0} done</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${theme.accent} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min(stats[habit.id]?.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Heatmap */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-5`}>This Week</h2>
          <div className="flex gap-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full aspect-square rounded-xl bg-gradient-to-br ${theme.accent}`}
                  style={{ opacity: 0.2 + i * 0.1 }}
                />
                <span className={`text-xs ${theme.textMuted}`}>{day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default StatsPage;