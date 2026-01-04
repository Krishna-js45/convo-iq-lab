import { Link } from "react-router-dom";
import gptiqxIcon from "@/assets/gptiqx-icon.png";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen relative">
      {/* Global Logo - Fixed position, vertically centered in header area */}
      <Link
        to="/dashboard"
        className="fixed top-0 left-0 z-[100] h-16 px-4 sm:px-6 flex items-center hover:opacity-70 transition-opacity"
        aria-label="Go to Dashboard"
      >
        <img
          src={gptiqxIcon}
          alt="GPTIQX"
          className="h-7 sm:h-8 w-auto object-contain"
        />
      </Link>

      {/* Page Content */}
      {children}
    </div>
  );
};

export default AppShell;
