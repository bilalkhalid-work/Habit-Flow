import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "⛩" },
  { label: "Habits", path: "/habits", icon: "🎋" },
  { label: "Stats", path: "/stats", icon: "🌸" },
  { label: "Focus", path: "/focus", icon: "🪨" },
  { label: "Settings", path: "/settings", icon: "🏮" },
];

const navItemsDark = [
  { label: "Dashboard", path: "/dashboard", icon: "⊹" },
  { label: "Habits", path: "/habits", icon: "◈" },
  { label: "Stats", path: "/stats", icon: "◎" },
  { label: "Focus", path: "/focus", icon: "◉" },
  { label: "Settings", path: "/settings", icon: "⊕" },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  const { theme, themeName } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const isSakura = themeName === "sakura";
  const items = isSakura ? navItems : navItemsDark;
  const logoEmoji = themeName === "galaxy" ? "🌌" : themeName === "sakura" ? "🌸" : "🍂";

  const sidebarStyle = isSakura ? {
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    background: "rgba(255,240,248,0.35)",
    borderRight: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "inset -1px 0 0 rgba(255,182,193,0.2)",
  } : {
    backdropFilter: "blur(32px) saturate(200%)",
    WebkitBackdropFilter: "blur(32px) saturate(200%)",
    background: themeName === "autumn" ? "rgba(15,5,0,0.55)" : "rgba(8,5,25,0.55)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  };

  const activeStyle = isSakura ? {
    background: "rgba(255,182,193,0.35)",
    border: "1px solid rgba(255,182,193,0.5)",
    boxShadow: "0 4px 16px rgba(244,114,182,0.15)",
  } : {
    background: "rgba(139,92,246,0.15)",
    border: "1px solid rgba(139,92,246,0.3)",
  };

  const activeTextColor = isSakura ? "#be185d" : "#ffffff";
  const inactiveTextColor = isSakura ? "#9d7088" : "rgba(255,255,255,0.5)";
  const titleColor = isSakura ? "#3d1f2d" : "#ffffff";
  const glowColor = isSakura ? "rgba(244,114,182,0.5)" : themeName === "autumn" ? "rgba(249,115,22,0.5)" : "rgba(139,92,246,0.5)";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-64 z-20 flex flex-col transition-transform duration-500 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={sidebarStyle}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">
              {logoEmoji}
            </div>
            <div>
              <h1
                className="font-display text-xl font-semibold tracking-tight"
                style={{ color: titleColor, fontFamily: "'Cormorant Garamond', serif" }}
              >
                HabitFlow
              </h1>
              <p
                className="text-xs font-light tracking-widest uppercase"
                style={{ color: inactiveTextColor }}
              >
                Premium
              </p>
            </div>
          </div>

          <div
            className="h-px w-full my-4"
            style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
          />

          <p
            className="text-xs font-light italic leading-relaxed"
            style={{ color: inactiveTextColor, fontFamily: "'Crimson Pro', serif" }}
          >
            {theme.tagline}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01] group"
                style={active ? activeStyle : {
                  background: "transparent",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = isSakura ? "rgba(255,182,193,0.15)" : "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {active && (
                  <div
                    className="absolute left-0 w-0.5 h-5 rounded-full"
                    style={{ background: glowColor, boxShadow: `0 0 8px ${glowColor}` }}
                  />
                )}
                <span className="text-lg">{item.icon}</span>
                <span
                  className="font-medium text-sm tracking-wide"
                  style={{
                    color: active ? activeTextColor : inactiveTextColor,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-6 mb-3">
          <div
            className="h-px w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
          />
        </div>

        {/* User */}
        <div className="px-4 pb-6 space-y-2">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
            style={{
              background: isSakura ? "rgba(255,182,193,0.2)" : "rgba(255,255,255,0.05)",
              border: isSakura ? "1px solid rgba(255,182,193,0.3)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${glowColor}, ${glowColor}80)` }}
            >
              {auth.currentUser?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: titleColor }}>
                {auth.currentUser?.email}
              </p>
              <p className="text-xs font-light" style={{ color: inactiveTextColor }}>Free Plan</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-2xl text-sm font-medium transition-all duration-200"
            style={{
              border: `1px solid ${glowColor}50`,
              color: isSakura ? "#be185d" : inactiveTextColor,
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isSakura ? "rgba(244,114,182,0.1)" : "rgba(255,255,255,0.05)";
              e.currentTarget.style.transform = "scale(1.01)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;