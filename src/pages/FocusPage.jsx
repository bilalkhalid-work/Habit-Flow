import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";

const MODES = {
  focus: { label: "Focus", duration: 25 * 60, emoji: "🎯" },
  short: { label: "Short Break", duration: 5 * 60, emoji: "☕" },
  long: { label: "Long Break", duration: 15 * 60, emoji: "🌿" },
};

function FocusPage() {
  const { theme } = useTheme();
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(MODES[mode].duration);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "focus") setSessions((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const progress = ((MODES[mode].duration - timeLeft) / MODES[mode].duration) * 100;
  const circumference = 2 * Math.PI * 110;
  const offset = circumference - (progress / 100) * circumference;

  const handleReset = () => {
    setRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>Focus Mode</h1>
          <p className={`${theme.textMuted} mt-1`}>Stay focused and get things done.</p>
        </div>

        {/* Mode Selector */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-2 flex gap-2`}>
          {Object.entries(MODES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                mode === key
                  ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg`
                  : `${theme.textMuted} hover:bg-white/10`
              }`}
            >
              {val.emoji} {val.label}
            </button>
          ))}
        </div>

        {/* Timer Ring */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center`}>
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="absolute rotate-[-90deg]" width="264" height="264">
              <circle cx="132" cy="132" r="110" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
              <circle
                cx="132" cy="132" r="110"
                stroke={theme.progressRing}
                strokeWidth="12" fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="text-center z-10">
              <p className={`text-6xl font-bold ${theme.text} font-mono`}>{minutes}:{seconds}</p>
              <p className={`text-sm ${theme.textMuted} mt-2`}>{MODES[mode].label}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={handleReset}
              className={`w-12 h-12 rounded-full border ${theme.accentBorder} ${theme.textMuted} hover:bg-white/10 transition-all flex items-center justify-center text-lg`}
            >
              ↺
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
            className={`w-20 h-20 rounded-full border-2 ${theme.accentBorder} text-4xl shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center backdrop-blur-sm bg-white/10`}            >
            {running ? "⏸" : theme.focusIcon}
            </button>
            <div className={`w-12 h-12 rounded-full border ${theme.accentBorder} flex items-center justify-center`}>
              <span className={`text-sm font-bold ${theme.accentText}`}>{sessions}</span>
            </div>
          </div>
          <p className={`text-sm ${theme.textMuted} mt-4`}>{sessions} sessions completed today</p>
        </div>

        {/* Tips */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
          <h3 className={`font-semibold ${theme.text} mb-3`}>Focus Tips</h3>
          <div className="space-y-2">
            {[
              "📵 Put your phone face down",
              "🎧 Use noise-cancelling headphones",
              "💧 Keep water nearby",
              "🌡️ Work in a comfortable temperature",
            ].map((tip) => (
              <p key={tip} className={`text-sm ${theme.textMuted}`}>{tip}</p>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default FocusPage;