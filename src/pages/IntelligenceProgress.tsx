import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Lock, Menu } from "lucide-react";
import FuturisticTrendsChart from "@/components/charts/FuturisticTrendsChart";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  transcript: string;
  created_at: string;
  user_iq: number;
  gpt_iq: number;
  conversation_iq: number;
  user_clarity?: number;
  user_depth?: number;
  user_creativity?: number;
  gpt_clarity?: number;
  gpt_depth?: number;
  gpt_flow?: number;
  conversation_flow?: number;
  conversation_synergy?: number;
  justification?: string;
}

const IntelligenceProgress = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "all">("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name: string; avatar_url: string } | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [isPro] = useState(false); // TODO: Check actual subscription status

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [dateFilter]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name, avatar_url")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
    }
  };

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (dateFilter === "7d") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte("created_at", sevenDaysAgo.toISOString());
    } else if (dateFilter === "30d") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte("created_at", thirtyDaysAgo.toISOString());
    }

    const { data } = await query;
    if (data) {
      setConversations(data);
    }
  };

  const chartData = conversations.map((conv) => ({
    date: new Date(conv.created_at).toLocaleDateString(),
    UserIQ: conv.user_iq,
    GPTIQ: conv.gpt_iq,
    ConversationIQ: conv.conversation_iq,
  }));

  const findBestSessionIndex = () => {
    if (conversations.length === 0) return undefined;
    let bestIndex = 0;
    let bestTotal = 0;
    conversations.forEach((conv, index) => {
      const total = (conv.user_iq || 0) + (conv.gpt_iq || 0) + (conv.conversation_iq || 0);
      if (total > bestTotal) {
        bestTotal = total;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const openConversationDetails = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationDialog(true);
  };

  const scrollToAnalysis = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black grid-pattern">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        onNewAnalysis={scrollToAnalysis}
        onSelectConversation={openConversationDetails}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
        {/* Header */}
        <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSidebarOpen(true)}
                    className="p-2"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <Link to="/" className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                  <span className="text-lg sm:text-xl font-bold text-white truncate">GPTIQX</span>
                </Link>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {userProfile && (
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-white/20 flex-shrink-0">
                      <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
                      <AvatarFallback className="bg-white/10 text-white text-xs">
                        {userProfile.full_name?.charAt(0) || userProfile.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block min-w-0">
                      <p className="text-sm font-medium text-white leading-none truncate">{userProfile.full_name}</p>
                      <p className="text-xs text-white/60 mt-0.5 truncate">{userProfile.email}</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-24 pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Pro Feature Notice */}
            {!isPro && (
              <Card className="glass border-amber-500/30 bg-amber-500/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Lock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-amber-200 font-medium">Pro Feature Preview</p>
                      <p className="text-amber-200/60 text-sm">
                        Upgrade to Pro to unlock full intelligence progress tracking, trend analysis, and personalized insights.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chart */}
            {conversations.length > 0 ? (
              <Card className="glass border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      Your Intelligence Progress
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={dateFilter === "7d" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateFilter("7d")}
                        className="text-xs"
                      >
                        7 Days
                      </Button>
                      <Button
                        variant={dateFilter === "30d" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateFilter("30d")}
                        className="text-xs"
                      >
                        30 Days
                      </Button>
                      <Button
                        variant={dateFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateFilter("all")}
                        className="text-xs"
                      >
                        All Time
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="min-w-0 p-6">
                  <FuturisticTrendsChart data={chartData} bestSessionIndex={findBestSessionIndex()} />
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-white/10">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">No data yet</p>
                  <p className="text-white/40 text-sm mt-2">
                    Analyze conversations to see your intelligence progress over time
                  </p>
                  <Button 
                    onClick={() => navigate("/dashboard")} 
                    className="mt-4"
                  >
                    Analyze a Conversation
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Details Dialog */}
      <Dialog open={showConversationDialog} onOpenChange={setShowConversationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-black/95 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              {selectedConversation?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedConversation && (
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white/60 mb-1">UserIQ</div>
                    <div className="text-3xl font-bold text-white">{selectedConversation.user_iq}</div>
                  </div>
                  <div className="glass p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white/60 mb-1">GPTIQ</div>
                    <div className="text-3xl font-bold text-white">{selectedConversation.gpt_iq}</div>
                  </div>
                  <div className="glass p-4 rounded-lg border border-white/10">
                    <div className="text-sm text-white/60 mb-1">ConversationIQ</div>
                    <div className="text-3xl font-bold text-white">{selectedConversation.conversation_iq}</div>
                  </div>
                </div>

                {selectedConversation.justification && (
                  <Card className="glass border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 leading-relaxed">{selectedConversation.justification}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Transcript</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed select-text">
                      {selectedConversation.transcript}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntelligenceProgress;
