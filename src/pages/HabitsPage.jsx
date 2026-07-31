import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { calculateStreak } from "../utils/streakCalculator";

const HABIT_ICONS = ["📚", "✍️", "🏃", "💪", "🧘", "🎯", "💧", "🍎", "😴", "🎨", "🎵", "💻", "🧠", "🌿", "⚡"];
const HABIT_COLORS = [
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-orange-500 to-amber-600",
  "from-green-500 to-emerald-600",
  "from-blue-500 to-cyan-600",
  "from-red-500 to-pink-600",
];

function HabitsPage() {
  const { theme } = useTheme();
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitDesc, setHabitDesc] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📚");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

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
    const fetchStreaks = async () => {
      const newStreaks = {};
      for (const habit of habits) {
        const q = query(
          collection(db, "completions"),
          where("habitId", "==", habit.id),
          where("userId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        newStreaks[habit.id] = calculateStreak(snapshot.docs.map((d) => d.data().date));
      }
      setStreaks(newStreaks);
    };
    if (habits.length > 0) fetchStreaks();
  }, [habits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "habits", editingId), {
          name: habitName,
          description: habitDesc,
          icon: selectedIcon,
          color: selectedColor,
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "habits"), {
          name: habitName,
          description: habitDesc,
          icon: selectedIcon,
          color: selectedColor,
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
      }
      setHabitName("");
      setHabitDesc("");
      setSelectedIcon("📚");
      setSelectedColor(HABIT_COLORS[0]);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = (habit) => {
    setEditingId(habit.id);
    setHabitName(habit.name);
    setHabitDesc(habit.description || "");
    setSelectedIcon(habit.icon || "📚");
    setSelectedColor(habit.color || HABIT_COLORS[0]);
    setShowForm(true);
  };

  const handleDelete = async (habitId) => {
    await deleteDoc(doc(db, "habits", habitId));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${theme.text}`}>My Habits</h1>
            <p className={`${theme.textMuted} mt-1`}>{habits.length} habits tracked</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setHabitName(""); setHabitDesc(""); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r ${theme.accent} text-white shadow-lg hover:scale-105 transition-transform`}
          >
            + New Habit
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
            <h3 className={`font-semibold text-lg ${theme.text} mb-5`}>
              {editingId ? "Edit Habit" : "Create New Habit"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Habit name..."
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${theme.input} outline-none focus:ring-2 focus:ring-violet-500/50`}
              />
              <input
                type="text"
                placeholder="Short description (optional)..."
                value={habitDesc}
                onChange={(e) => setHabitDesc(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${theme.input} outline-none focus:ring-2 focus:ring-violet-500/50`}
              />

              {/* Icon Picker */}
              <div>
                <p className={`text-sm ${theme.textMuted} mb-2`}>Choose an icon</p>
                <div className="flex flex-wrap gap-2">
                  {HABIT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? `bg-gradient-to-br ${theme.accent} scale-110 shadow-lg`
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <p className={`text-sm ${theme.textMuted} mb-2`}>Choose a color</p>
                <div className="flex gap-2">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} transition-all ${
                        selectedColor === color ? "scale-125 ring-2 ring-white/50" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl font-medium bg-gradient-to-r ${theme.accent} text-white shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50`}
                >
                  {editingId ? "Save Changes" : "Create Habit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className={`px-6 py-3 rounded-xl font-medium border ${theme.accentBorder} ${theme.textMuted} hover:bg-white/5`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🌱</p>
            <p className={`text-xl font-semibold ${theme.text}`}>No habits yet</p>
            <p className={`${theme.textMuted} mt-2`}>Create your first habit to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`${theme.card} border backdrop-blur-xl rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${habit.color || theme.accent} flex items-center justify-center text-2xl shadow-lg`}>
                    {habit.icon || "📚"}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(habit)}
                      className={`text-xs px-3 py-1 rounded-lg ${theme.accentText} border ${theme.accentBorder} hover:bg-white/10`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="text-xs px-3 py-1 rounded-lg text-red-400 border border-red-400/30 hover:bg-red-400/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h3 className={`font-semibold text-lg ${theme.text}`}>{habit.name}</h3>
                {habit.description && (
                  <p className={`text-sm ${theme.textMuted} mt-1`}>{habit.description}</p>
                )}
                <div className="flex items-center gap-4 mt-4">
                  <div className={`text-sm font-medium ${theme.accentText}`}>
                    🔥 {streaks[habit.id] || 0} day streak
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default HabitsPage;