import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAI } from "../ai/useAI";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { calculateStreak } from "../utils/streakCalculator";

const QUICK_ACTIONS = [
  { emoji: "✨", label: "Analyze My Habits" },
  { emoji: "🔥", label: "Why Did I Lose My Streak?" },
  { emoji: "📈", label: "How Can I Improve?" },
  { emoji: "🎯", label: "Plan Tomorrow" },
  { emoji: "🧠", label: "Suggest New Habits" },
  { emoji: "💪", label: "Motivate Me" },
  { emoji: "📅", label: "Build My Morning Routine" },
  { emoji: "🌙", label: "Reflect On Today" },
];

const ASSISTANT_NAMES = {
  galaxy: "Nova",
  sakura: "Hana",
  autumn: "Akio",
};

const ASSISTANT_ICONS = {
  galaxy: "🌌",
  sakura: "🌸",
  autumn: "🍂",
};

const GREETINGS = {
  galaxy: "Hello, I'm Nova. Your cosmic habit companion. How can I guide your journey today?",
  sakura: "Hello, I'm Hana. I'm here to help your habits bloom. What would you like to explore?",
  autumn: "Hello, I'm Akio. Let's reflect on your journey together. What's on your mind?",
};

const PLACEHOLDERS = {
  galaxy: "Ask Nova anything...",
  sakura: "Ask Hana anything...",
  autumn: "Ask Akio anything...",
};

function TypingIndicator({ theme }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center text-xs flex-shrink-0`}>
        {ASSISTANT_ICONS[theme.name?.toLowerCase()] || "🌌"}
      </div>
      <div className={`flex gap-1 px-3 py-2 rounded-2xl ${theme.card} border`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full bg-gradient-to-br ${theme.accent}`}
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Message({ msg, theme, themeName }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-2 px-4 py-1 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center text-xs flex-shrink-0 mt-1`}>
          {ASSISTANT_ICONS[themeName]}
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? `bg-gradient-to-br ${theme.accent} text-white rounded-tr-sm`
            : `${theme.card} border ${theme.text} rounded-tl-sm`
        }`}
      >
        {msg.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-1" : ""}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function AIAssistant() {
  const { theme, themeName } = useTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [userData, setUserData] = useState({
    habits: [],
    completedToday: 0,
    totalHabits: 0,
    currentStreak: 0,
    totalCompletions: 0,
    weeklyPercentage: 0,
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { messages, loading, error, sendMessage, clearMessages } = useAI(themeName, userData);

  useEffect(() => {
    if (open) fetchUserData();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const fetchUserData = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const habitsSnap = await getDocs(
        query(collection(db, "habits"), where("userId", "==", uid))
      );
      const habits = habitsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const today = new Date().toISOString().split("T")[0];
      let completedToday = 0;
      let totalCompletions = 0;
      let maxStreak = 0;

      for (const habit of habits) {
        const compSnap = await getDocs(
          query(
            collection(db, "completions"),
            where("habitId", "==", habit.id),
            where("userId", "==", uid)
          )
        );
        const dates = compSnap.docs.map((d) => d.data().date);
        totalCompletions += dates.length;
        if (dates.includes(today)) completedToday++;
        const streak = calculateStreak(dates);
        if (streak > maxStreak) maxStreak = streak;
      }

      const weeklyPercentage = habits.length > 0
        ? Math.round((completedToday / habits.length) * 100)
        : 0;

      setUserData({
        habits,
        completedToday,
        totalHabits: habits.length,
        currentStreak: maxStreak,
        totalCompletions,
        weeklyPercentage,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (label) => {
    sendMessage(label);
  };

  const name = ASSISTANT_NAMES[themeName];
  const icon = ASSISTANT_ICONS[themeName];
  const greeting = GREETINGS[themeName];
  const placeholder = PLACEHOLDERS[themeName];

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br ${theme.accent} shadow-2xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg`}
        style={{ boxShadow: `0 0 20px ${theme.progressRing}60` }}
      >
        {open ? "✕" : icon}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 md:w-96 flex flex-col rounded-3xl overflow-hidden shadow-2xl border"
          style={{
            animation: "slideUp 0.3s ease-out",
            height: "520px",
            backdropFilter: "blur(20px)",
            background: themeName === "sakura"
              ? "rgba(255,240,245,0.85)"
              : themeName === "autumn"
              ? "rgba(20,8,0,0.85)"
              : "rgba(10,8,30,0.85)",
            borderColor: themeName === "sakura"
              ? "rgba(255,182,193,0.4)"
              : themeName === "autumn"
              ? "rgba(200,80,0,0.3)"
              : "rgba(120,80,255,0.3)",
          }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r ${theme.accent} bg-opacity-10`}
            style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center text-sm shadow-lg`}>
                {icon}
              </div>
              <div>
                <p className={`font-semibold text-sm ${theme.text}`}>{name}</p>
                <p className={`text-xs ${theme.textMuted}`}>HabitFlow AI Coach</p>
              </div>
            </div>
            <button
              onClick={clearMessages}
              className={`text-xs ${theme.textMuted} hover:${theme.text} transition-colors px-2 py-1 rounded-lg hover:bg-white/10`}
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-3 space-y-1">
            {/* Greeting */}
            <div className="flex items-start gap-2 px-4 py-1">
              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center text-xs flex-shrink-0 mt-1`}>
                {icon}
              </div>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed ${theme.card} border ${theme.text}`}>
                {greeting}
              </div>
            </div>

            {/* Quick Actions */}
            {messages.length === 0 && (
              <div className="px-4 py-2 grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className={`text-left px-3 py-2 rounded-xl text-xs ${theme.card} border ${theme.text} hover:bg-white/10 transition-all duration-200 hover:scale-[1.02]`}
                  >
                    <span className="mr-1">{action.emoji}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Conversation */}
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} theme={theme} themeName={themeName} />
            ))}

            {loading && <TypingIndicator theme={theme} />}

            {error && (
              <p className="text-red-400 text-xs text-center px-4">{error}</p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`px-3 py-3 border-t`} style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border ${theme.input}`}
              style={{ borderColor: "rgba(255,255,255,0.15)" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed"
                style={{ color: themeName === "sakura" ? "#374151" : "#f0f0ff" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center text-white text-sm transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0`}
              >
                ↑
              </button>
            </div>
            <p className={`text-center text-xs ${theme.textMuted} mt-2`}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistant;