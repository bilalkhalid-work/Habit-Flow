import { useTheme } from "../context/ThemeContext";
import Sidebar from "./Sidebar";
import AnimatedBackground from "./AnimatedBackground";
import AIAssistant from "./AIAssistant";
import { useState } from "react";

function Layout({ children }) {
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} relative`}>
      <AnimatedBackground />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile top bar */}
      <div className={`fixed top-0 left-0 right-0 z-10 md:hidden flex items-center justify-between px-4 py-3 backdrop-blur-xl border-b border-white/10 ${theme.sidebar}`}>
        <button
          onClick={() => setMobileOpen(true)}
          className={`${theme.text} text-xl`}
        >
          ☰
        </button>
        <h1 className={`font-bold ${theme.text}`}>HabitFlow</h1>
        <div className="w-8" />
      </div>

      <main className="md:ml-64 min-h-screen relative z-10 p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </main>

      <AIAssistant />
    </div>
  );
}

export default Layout;