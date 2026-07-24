import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function AddHabit() {
    const [habitName, setHabitName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddHabit = async (e) => {
        e.preventDefault();
        if (!habitName.trim()) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "habits"), {
                name: habitName,
                userId: auth.currentUser.uid,
                createdAt: serverTimestamp(),
            });
            setHabitName("");
        } catch (error) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleAddHabit} className="flex gap-3 mb-8">
            <input
                type="text"
                placeholder="Enter a new Habit..."
                className="flex-1 border p-3 rounded-lg"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
                Add Habit
            </button>
        </form>
    );
}

export default AddHabit;