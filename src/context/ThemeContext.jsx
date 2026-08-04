import { createContext, useContext, useState } from "react";

const themes = {
  galaxy: {
    name: "Galaxy",
    emoji: "🌌",
    tagline: "Every star is a habit waiting to shine.",
    bg: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
    sidebar: "bg-[#0a0820]/40 border-white/10 backdrop-blur-xl",    card: "bg-white/5 border-white/10 backdrop-blur-md",
    cardSolid: "bg-[#1a1535]/80",
    accent: "from-violet-500 to-indigo-500",
    accentSolid: "bg-violet-500",
    accentText: "text-violet-400",
    accentBorder: "border-violet-500/30",
    text: "text-white",
    textMuted: "text-gray-400",
    input: "bg-white/5 border-white/10 text-white placeholder-gray-500",
    button: "bg-violet-600 hover:bg-violet-500 text-white",
    progressRing: "#8b5cf6",
    particle: "bg-white",
    focusIcon: "🌌",
  },
  sakura: {
    name: "Sakura",
    emoji: "🌸",
    tagline: "Peaceful. Focused. Bloom every day.",
    bg: "from-[#fce4ec] via-[#f8bbd0] to-[#fce4ec]",
    sidebar: "bg-white/20 border-white/40",
    card: "bg-white/50 border-white/60 backdrop-blur-[40px]",
    cardSolid: "bg-white/60",
    accent: "from-pink-400 to-rose-400",
    accentSolid: "bg-pink-400",
    accentText: "text-pink-500",
    accentBorder: "border-pink-200/60",
    text: "text-[#3d1f2d]",
    textMuted: "text-[#9d7088]",
    input: "bg-white/40 border-white/50 text-[#3d1f2d] placeholder-[#c4a0b0]",
    button: "bg-pink-400 hover:bg-pink-500 text-white",
    progressRing: "#f472b6",
    particle: "bg-pink-300",
    focusIcon: "🌸",
    tagline: "Peaceful. Focused. Bloom every day.",
    glow: "rgba(244,114,182,0.12)",
    cardShadow: "0 8px 32px rgba(219,112,147,0.12), 0 2px 8px rgba(219,112,147,0.08)",
  },
    autumn: {
    name: "Autumn",
    emoji: "🍂",
    tagline: "Every leaf that falls is a reminder that change is beautiful.",
    bg: "from-[#1a0a00] via-[#2d1200] to-[#1a0a00]",
    sidebar: "bg-[#1a0800]/30 border-orange-800/20 backdrop-blur-xl",
    card: "bg-[#1a0800]/50 border-orange-800/40 backdrop-blur-md",
    cardSolid: "bg-[#2d1200]/70",
    accent: "from-orange-500 to-amber-500",
    accentSolid: "bg-orange-500",
    accentText: "text-orange-400",
    accentBorder: "border-orange-500/30",
    text: "text-orange-50",
    textMuted: "text-orange-300/70",
    input: "bg-black/20 border-orange-900/40 text-orange-50 placeholder-orange-300/50",
    button: "bg-orange-600 hover:bg-orange-500 text-white",
    progressRing: "#f97316",
    particle: "bg-orange-400",
    focusIcon: "🍁",
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem("habitflow-theme") || "galaxy";
  });
  const theme = themes[themeName];

  const handleSetTheme = (name) => {
    setThemeName(name);
    localStorage.setItem("habitflow-theme", name);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName: handleSetTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}