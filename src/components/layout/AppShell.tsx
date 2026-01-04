import { Link } from "react-router-dom";
import gptiqxIcon from "@/assets/gptiqx-icon.png";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen relative">
      {/* Global Logo - Fixed position, always visible */}
      <Link
        to="/dashboard"
        className="fixed top-4 left-4 z-[100] hover:opacity-70 transition-opacity"
        aria-label="Go to Dashboard"
      >
        <img
          src={gptiqxIcon}
          alt="GPTIQX"
          className="h-5 sm:h-6 w-auto object-contain"
        />
      </Link>

      {/* Page Content */}
      {children}
    </div>
  );
};

export default AppShell;
