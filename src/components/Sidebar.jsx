import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import dashboardIcon from "../assets/dashboard-icon.png";
import habitsIcon from "../assets/habits-icon.png";
import statsIcon from "../assets/stats-icon.png";
import focusIcon from "../assets/focus-icon.png";
import settingsIcon from "../assets/settings-icon.png";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "⛩", img: dashboardIcon },
  { label: "Habits", path: "/habits", icon: "🎋", img: habitsIcon },
  { label: "Stats", path: "/stats", icon: "🌸", img: statsIcon },
  { label: "Focus", path: "/focus", icon: "🪨", img: focusIcon },
  { label: "Settings", path: "/settings", icon: "🏮", img: settingsIcon },
];
const navItemsDark = [
  { label: "Dashboard", path: "/dashboard", icon: "⊹" },
  { label: "Habits", path: "/habits", icon: "◈" },
  { label: "Stats", path: "/stats", icon: "◎" },
  { label: "Focus", path: "/focus", icon: "◉" },
  { label: "Settings", path: "/settings", icon: "⊕" },
];

function Sidebar({ mobileOpen, setMobileOpen, displayName }) {
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
    background: "linear-gradient(135deg, #e91e8c, #f06292)",
    border: "none",
    boxShadow: "0 8px 24px rgba(233,30,140,0.4)",
  } : {
    background: "rgba(139,92,246,0.15)",
    border: "1px solid rgba(139,92,246,0.3)",
  };

  const activeTextColor = "#ffffff";
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
          <div className="text-3xl leading-none">{logoEmoji}</div>
          <div>
            <h1
              style={{
                color: titleColor,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px",
                fontWeight: "600",
                letterSpacing: "-0.02em",
                lineHeight: "1.2",
              }}
            >
              HabitFlow
            </h1>
            <p
              style={{
                color: isSakura ? "#e91e8c" : inactiveTextColor,
                fontSize: "10px",
                fontWeight: "500",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
              }}
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
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.01] group relative"
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
                {isSakura && item.img ? (
                  <img src={item.img} alt={item.label} className="w-9 h-9 object-contain" style={{ filter: "drop-shadow(0 2px 4px rgba(233,30,140,0.2))" }} />
                ) : (
                  <span className="text-lg">{item.icon}</span>
                  )}
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
          <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor})` }} />
          <span style={{ fontSize: "10px", opacity: 0.6 }}>🌸</span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${glowColor}, transparent)` }} />
        </div>
        </div>

        {/* User */}
        <div className="px-4 pb-6 space-y-2">
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-2xl"
            style={{
              background: isSakura ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.05)",
              border: isSakura ? "1px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: isSakura ? "0 4px 16px rgba(219,112,147,0.1)" : "none",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{
                background: isSakura ? "linear-gradient(135deg, #e91e8c, #f06292)" : `linear-gradient(135deg, ${glowColor}, ${glowColor}80)`,
                boxShadow: isSakura ? "0 4px 12px rgba(233,30,140,0.3)" : "none",
              }}
            >
              {(displayName || auth.currentUser?.email)?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: titleColor }}>
              {displayName || auth.currentUser?.email?.split("@")[0]}
            </p>
              <p className="text-xs font-light mt-0.5" style={{ color: inactiveTextColor }}>
                Free Plan
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              border: isSakura ? "1px solid rgba(233,30,140,0.2)" : `1px solid ${glowColor}50`,
              color: isSakura ? "#e91e8c" : inactiveTextColor,
              background: isSakura ? "rgba(255,255,255,0.4)" : "transparent",
              boxShadow: isSakura ? "0 2px 8px rgba(219,112,147,0.1)" : "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isSakura ? "rgba(233,30,140,0.1)" : "rgba(255,255,255,0.05)";
              e.currentTarget.style.transform = "scale(1.01)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSakura ? "rgba(255,255,255,0.4)" : "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span>→</span>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;