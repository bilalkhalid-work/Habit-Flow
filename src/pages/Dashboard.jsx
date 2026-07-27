import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, setDoc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import AddHabit from "../components/AddHabit";
import WeeklyView from "../components/WeeklyView";
import { calculateStreak } from "../utils/streakCalculator";

function Dashboard() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [streaks, setStreaks] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, "habits"),
      where("userId", "==", auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHabits(habitsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCompletionsAndStreaks = async () => {
      const newCompletions = {};
      const newStreaks = {};
      for (const habit of habits) {
        const todayRef = doc(db, "completions", `${habit.id}_${today}`);
        const todaySnap = await getDoc(todayRef);
        if (todaySnap.exists()) newCompletions[habit.id] = true;
        const q = query(
          collection(db, "completions"),
          where("habitId", "==", habit.id),
          where("userId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const dates = snapshot.docs.map((doc) => doc.data().date);
        newStreaks[habit.id] = calculateStreak(dates);
      }
      setCompletions(newCompletions);
      setStreaks(newStreaks);
    };
    if (habits.length > 0) fetchCompletionsAndStreaks();
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

  const handleEdit = (habitId, currentName) => {
    setEditingId(habitId);
    setEditingName(currentName);
  };

  const handleSaveEdit = async (habitId) => {
    if (!editingName.trim()) return;
    await updateDoc(doc(db, "habits", habitId), { name: editingName });
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (habitId) => {
    await deleteDoc(doc(db, "habits", habitId));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const completedToday = Object.values(completions).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Navbar */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✅</span>
          <h1 className="text-xl font-bold text-indigo-600">HabitFlow</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Habits</h2>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-center bg-indigo-50 rounded-xl px-6 py-3">
            <p className="text-3xl font-bold text-indigo-600">{completedToday}/{habits.length}</p>
            <p className="text-xs text-gray-500 mt-1">Done Today</p>
          </div>
        </div>

        {/* Add Habit */}
        <AddHabit />

        {/* Habit List */}
        {habits.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🌱</p>
            <p className="text-lg font-medium">No habits yet</p>
            <p className="text-sm">Add your first habit above to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${
                  completions[habit.id] ? "border-green-400" : "border-indigo-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={!!completions[habit.id]}
                      onChange={() => handleToggle(habit.id)}
                      className="w-5 h-5 cursor-pointer mt-1 accent-indigo-500"
                    />
                    <div>
                      {editingId === habit.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="border p-1 rounded-lg text-sm"
                          />
                          <button onClick={() => handleSaveEdit(habit.id)} className="text-green-500 hover:text-green-700 text-sm">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
                        </div>
                      ) : (
                        <p className={`text-lg font-semibold ${completions[habit.id] ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {habit.name}
                        </p>
                      )}
                      <p className="text-sm text-orange-500 font-medium mt-1">
                        🔥 {streaks[habit.id] || 0} day streak
                      </p>
                      <WeeklyView habitId={habit.id} />
                    </div>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button onClick={() => handleEdit(habit.id, habit.name)} className="text-indigo-400 hover:text-indigo-600 text-sm">Edit</button>
                    <button onClick={() => handleDelete(habit.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;