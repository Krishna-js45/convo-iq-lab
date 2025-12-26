import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  X, 
  Plus, 
  Search, 
  LayoutDashboard, 
  Clock, 
  TrendingUp, 
  Map, 
  User, 
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  user_iq?: number;
  gpt_iq?: number;
  conversation_iq?: number;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  conversations: Conversation[];
  onNewAnalysis: () => void;
  onSelectConversation: (conversation: Conversation) => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", locked: false },
  { label: "Learning Timeline", icon: Clock, path: "/history", locked: false },
  { label: "Your Intelligence Progress", icon: TrendingUp, path: null, locked: true },
  { label: "Improvement Roadmaps", icon: Map, path: null, locked: true },
  { label: "Profile", icon: User, path: "/profile", locked: false },
  { label: "Settings", icon: Settings, path: "/profile", locked: false },
];

const DashboardSidebar = ({
  isOpen,
  onClose,
  onToggle,
  conversations,
  onNewAnalysis,
  onSelectConversation,
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.locked) return;
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Toggle button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 p-2 bg-white/5 border border-white/10 rounded-r-lg hover:bg-white/10 transition-all"
        >
          <ChevronRight className="w-4 h-4 text-white/60" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full"
        )}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-sm font-medium text-white/80">Conversations</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* New Analysis Button */}
        <div className="p-3">
          <Button
            onClick={onNewAnalysis}
            className="w-full justify-start gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            variant="ghost"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5 py-2">
            {filteredConversations.length === 0 ? (
              <div className="px-3 py-8 text-center text-white/40 text-sm">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </div>
            ) : (
              [...filteredConversations].reverse().map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/80 truncate group-hover:text-white transition-colors">
                        {conv.title}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {formatDate(conv.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Navigation Section */}
        <div className="border-t border-white/10 p-2">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = item.path === location.pathname;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  disabled={item.locked}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors",
                    item.locked 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-white/5",
                    isActive && !item.locked && "bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4",
                    isActive && !item.locked ? "text-white" : "text-white/40"
                  )} />
                  <span className={cn(
                    "text-sm flex-1",
                    isActive && !item.locked ? "text-white" : "text-white/60"
                  )}>
                    {item.label}
                  </span>
                  {item.locked && (
                    <Lock className="w-3 h-3 text-white/30" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Pro Features Description */}
          <div className="mt-3 px-3 py-2 bg-white/5 rounded-lg">
            <p className="text-[11px] text-white/40 leading-relaxed">
              See patterns across sessions, improvement predictions, and personalized roadmaps
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
