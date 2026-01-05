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
        className="fixed top-0 left-0 z-[100] h-16 px-4 sm:px-6 flex items-center"
        aria-label="Go to Dashboard"
      >
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-lg hover:bg-background/90 hover:border-primary/30 hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
          <img
            src={gptiqxIcon}
            alt="GPTIQX"
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Page Content */}
      {children}
    </div>
  );
};

export default AppShell;
