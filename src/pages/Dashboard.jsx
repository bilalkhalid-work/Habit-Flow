import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, setDoc, getDoc, updateDoc, getDocs } from "firebase/firestore";
import AddHabit from "../components/AddHabit";
import { calculateStreak } from "../utils/streakCalculator";
import WeeklyView from "../components/WeeklyView";

function Dashboard() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
  const [streaks, setStreaks] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const today = new Date().toISOString().split("T")[0];

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
        if (todaySnap.exists()) {
          newCompletions[habit.id] = true;
        }

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
      await setDoc(ref, {
        habitId,
        userId: auth.currentUser.uid,
        date: today,
      });
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Habits</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <AddHabit />
        {habits.length === 0 ? (
          <p className="text-gray-500">No habits yet. Add one above!</p>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={!!completions[habit.id]}
                    onChange={() => handleToggle(habit.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  {editingId === habit.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border p-1 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => handleSaveEdit(habit.id)}
                        className="text-green-500 hover:text-green-700 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className={`text-lg font-medium ${completions[habit.id] ? "line-through text-gray-400" : ""}`}>
                        {habit.name}
                      </span>
                      <p className="text-sm text-orange-500 font-medium">
                        🔥 {streaks[habit.id] || 0} day streak
                      </p>
                      <WeeklyView habitId={habit.id} />
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(habit.id, habit.name)}
                    className="text-blue-400 hover:text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
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