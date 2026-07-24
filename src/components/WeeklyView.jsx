import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

function WeeklyView({ habitId }) {
  const [weekDays, setWeekDays] = useState([]);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const fetchWeekData = async () => {
      const days = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        days.push({ dateStr, dayName, completed: false });
      }

      const q = query(
        collection(db, "completions"),
        where("habitId", "==", habitId),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const completedDates = snapshot.docs.map((doc) => doc.data().date);

      const updatedDays = days.map((day) => ({
        ...day,
        completed: completedDates.includes(day.dateStr),
      }));

      const completedCount = updatedDays.filter((d) => d.completed).length;
      setPercentage(Math.round((completedCount / 7) * 100));
      setWeekDays(updatedDays);
    };

    fetchWeekData();
  }, [habitId]);

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        {weekDays.map((day) => (
          <div key={day.dateStr} className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">{day.dayName}</span>
            <div
              className={`w-7 h-7 rounded-full ${
                day.completed ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Weekly completion:{" "}
        <span className={`font-medium ${percentage >= 70 ? "text-green-500" : percentage >= 40 ? "text-yellow-500" : "text-red-400"}`}>
          {percentage}%
        </span>
      </p>
    </div>
  );
}

export default WeeklyView;