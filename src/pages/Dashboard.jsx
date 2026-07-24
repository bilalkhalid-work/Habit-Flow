import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, deleteDoc, doc, setDoc, getDoc } from "firebase/firestore";
import AddHabit from "../components/AddHabit";

function Dashboard() {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});
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
    const fetchCompletions = async () => {
      const newCompletions = {};
      for (const habit of habits) {
        const ref = doc(db, "completions", `${habit.id}_${today}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          newCompletions[habit.id] = true;
        }
      }
      setCompletions(newCompletions);
    };
    if (habits.length > 0) fetchCompletions();
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
                  <span className={`text-lg font-medium ${completions[habit.id] ? "line-through text-gray-400" : ""}`}>
                    {habit.name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;