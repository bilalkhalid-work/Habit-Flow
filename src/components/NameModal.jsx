import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

function NameModal({ onSave }) {
  const { theme, themeName } = useTheme();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const isSakura = themeName === "sakura";

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onSave(name.trim());
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: "blur(20px)", background: "rgba(0,0,0,0.3)" }}
    >
      <div
        className="w-full max-w-sm mx-4 rounded-3xl p-8 flex flex-col items-center gap-5"
        style={{
          background: isSakura ? "rgba(255,245,250,0.9)" : "rgba(15,10,35,0.9)",
          border: isSakura ? "1px solid rgba(255,182,193,0.5)" : "1px solid rgba(255,255,255,0.1)",
          boxShadow: isSakura
            ? "0 24px 64px rgba(219,112,147,0.2)"
            : "0 24px 64px rgba(0,0,0,0.4)",
          backdropFilter: "blur(40px)",
        }}
      >
        <div className="text-4xl">
          {themeName === "sakura" ? "🌸" : themeName === "autumn" ? "🍂" : "🌌"}
        </div>

        <div className="text-center">
          <h2
            className="text-2xl font-semibold mb-1"
            style={{
              color: isSakura ? "#3d1f2d" : "#ffffff",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            Welcome to HabitFlow
          </h2>
          <p
            className="text-sm font-light"
            style={{ color: isSakura ? "#9d7088" : "rgba(255,255,255,0.5)" }}
          >
            What should we call you?
          </p>
        </div>

        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none text-center"
          style={{
            background: isSakura ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.08)",
            border: isSakura ? "1px solid rgba(255,182,193,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: isSakura ? "#3d1f2d" : "#ffffff",
            fontFamily: "'Inter', sans-serif",
          }}
        />

        <button
          onClick={handleSave}
          disabled={!name.trim() || loading}
          className="w-full py-3 rounded-2xl text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-40"
          style={{
            background: isSakura
              ? "linear-gradient(135deg, #e91e8c, #f06292)"
              : `linear-gradient(135deg, ${theme.progressRing}, ${theme.progressRing}80)`,
            boxShadow: isSakura ? "0 8px 24px rgba(233,30,140,0.3)" : "none",
          }}
        >
          {loading ? "Saving..." : "Let's Begin →"}
        </button>
      </div>
    </div>
  );
}

export default NameModal;