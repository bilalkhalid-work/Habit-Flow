import { useTheme } from "../context/ThemeContext";
import Sidebar from "./Sidebar";
import AnimatedBackground from "./AnimatedBackground";

function Layout({ children }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} relative`}>
      <AnimatedBackground />
      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10 p-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;