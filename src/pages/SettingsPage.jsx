import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { auth } from "../firebase";

function SettingsPage() {
  const { theme, themeName, setThemeName, themes } = useTheme();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>Settings</h1>
          <p className={`${theme.textMuted} mt-1`}>Personalize your HabitFlow experience</p>
        </div>

        {/* Theme Selector */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-2`}>Choose Your Theme</h2>
          <p className={`text-sm ${theme.textMuted} mb-6`}>Each theme transforms the entire app into a different visual world.</p>

          <div className="grid grid-cols-3 gap-4">
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setThemeName(key)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  themeName === key
                    ? "border-white/50 scale-105 shadow-xl"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                {/* Theme Preview */}
                <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${t.accent} mb-3 flex items-center justify-center`}>
                  <span className="text-3xl">{t.emoji}</span>
                </div>
                <p className={`font-semibold text-sm ${theme.text}`}>{t.name}</p>
                {themeName === key && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                    <span className="text-xs text-black">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-4`}>Account</h2>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.accent} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {auth.currentUser?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className={`font-medium ${theme.text}`}>{auth.currentUser?.email}</p>
              <p className={`text-sm ${theme.textMuted}`}>Free Plan · Member since 2026</p>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className={`${theme.card} border backdrop-blur-xl rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-4`}>About HabitFlow</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={`text-sm ${theme.textMuted}`}>Version</span>
              <span className={`text-sm font-medium ${theme.text}`}>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme.textMuted}`}>Built with</span>
              <span className={`text-sm font-medium ${theme.text}`}>React + Firebase</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme.textMuted}`}>Developer</span>
              <span className={`text-sm font-medium ${theme.text}`}>Bilal Khalid</span>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default SettingsPage;