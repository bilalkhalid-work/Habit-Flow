import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { icon: "⊞", label: "Dashboard", path: "/dashboard" },
  { icon: "✦", label: "Habits", path: "/habits" },
  { icon: "◎", label: "Stats", path: "/stats" },
  { icon: "◉", label: "Focus", path: "/focus" },
  { icon: "⚙", label: "Settings", path: "/settings" },
];

function Sidebar() {
  const { theme, themeName } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const logoEmoji = themeName === "galaxy" ? "🌌" : themeName === "sakura" ? "🌸" : "🍂";

  return (
    <div className={`fixed left-0 top-0 h-full w-64 z-20 backdrop-blur-xl border-r ${theme.sidebar} border-white/10 flex flex-col`}>

      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.accent} flex items-center justify-center text-lg shadow-lg`}>
            {logoEmoji}
          </div>
          <div>
            <h1 className={`font-bold text-lg ${theme.text}`}>HabitFlow</h1>
            <p className={`text-xs ${theme.textMuted}`}>Premium</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left
                ${active
                  ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg scale-[1.02]`
                  : `${theme.textMuted} hover:${theme.text} hover:bg-white/5`
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${theme.card} border mb-3`}>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.accent} flex items-center justify-center text-white text-xs font-bold`}>
            {auth.currentUser?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium ${theme.text} truncate`}>{auth.currentUser?.email}</p>
            <p className={`text-xs ${theme.textMuted}`}>Free Plan</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${theme.accentBorder} ${theme.accentText} hover:bg-white/5`}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;