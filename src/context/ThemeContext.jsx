import { createContext, useContext, useState } from "react";

const themes = {
  galaxy: {
    name: "Galaxy",
    emoji: "🌌",
    bg: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
    sidebar: "bg-[#1a1535]/80",
    card: "bg-[#ffffff0f] border-[#ffffff15]",
    accent: "from-violet-500 to-indigo-500",
    accentSolid: "bg-violet-500",
    accentText: "text-violet-400",
    accentBorder: "border-violet-500/30",
    text: "text-white",
    textMuted: "text-gray-400",
    input: "bg-[#ffffff0a] border-[#ffffff15] text-white placeholder-gray-500",
    button: "bg-violet-600 hover:bg-violet-500 text-white",
    progressRing: "#8b5cf6",
    particle: "bg-white",
  },
  sakura: {
    name: "Sakura",
    emoji: "🌸",
    bg: "from-[#fce4ec] via-[#f8bbd0] to-[#fce4ec]",
    sidebar: "bg-[#fff0f5]/80",
    card: "bg-white/70 border-pink-100",
    accent: "from-pink-400 to-rose-400",
    accentSolid: "bg-pink-400",
    accentText: "text-pink-500",
    accentBorder: "border-pink-300/50",
    text: "text-gray-800",
    textMuted: "text-gray-500",
    input: "bg-white/80 border-pink-200 text-gray-800 placeholder-gray-400",
    button: "bg-pink-400 hover:bg-pink-500 text-white",
    progressRing: "#f472b6",
    particle: "bg-pink-300",
  },
  autumn: {
    name: "Autumn",
    emoji: "🍂",
    bg: "from-[#1a0a00] via-[#2d1200] to-[#1a0a00]",
    sidebar: "bg-[#2d1200]/80",
    card: "bg-[#ffffff08] border-[#ff6b0020]",
    accent: "from-orange-500 to-amber-500",
    accentSolid: "bg-orange-500",
    accentText: "text-orange-400",
    accentBorder: "border-orange-500/30",
    text: "text-orange-50",
    textMuted: "text-orange-300/70",
    input: "bg-[#ffffff08] border-[#ff6b0030] text-orange-50 placeholder-orange-300/50",
    button: "bg-orange-600 hover:bg-orange-500 text-white",
    progressRing: "#f97316",
    particle: "bg-orange-400",
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("galaxy");
  const theme = themes[themeName];

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}