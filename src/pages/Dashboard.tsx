import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, BarChart3, LogOut, Sparkles, TrendingUp, Calendar, History, TrendingDown, ArrowUpRight, ArrowDownRight, Lightbulb } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import FuturisticTrendsChart from "@/components/charts/FuturisticTrendsChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MetricExplainer, PrimaryInsight, IntelligenceStatus, ImprovementFocus, LearningTimeline } from "@/components/insights";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "all">("all");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name: string; avatar_url: string } | null>(null);

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

    const { data, error } = await query;
    if (!error && data) {
      setConversations(data);
      if (data.length > 0) {
        const latest = data[data.length - 1];
        setScores(latest);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "Please enter a conversation transcript",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      // Call the AI analysis edge function
      const { data: analysisData, error: functionError } = await supabase.functions.invoke(
        "analyze-conversation",
        { body: { transcript } }
      );

      if (functionError) throw functionError;

      // Generate title from first 6-8 words of transcript
      const words = transcript.trim().split(/\s+/);
      const titleWords = words.slice(0, Math.min(8, words.length));
      const generatedTitle = titleWords.join(" ") + (words.length > 8 ? "..." : "");

      // Insert the analyzed conversation into the database
      const { error: insertError } = await supabase.from("conversations").insert({
        user_id: user.id,
        title: generatedTitle,
        transcript,
        user_iq: analysisData.user_iq,
        user_clarity: analysisData.user_clarity,
        user_depth: analysisData.user_depth,
        user_creativity: analysisData.user_creativity,
        gpt_iq: analysisData.gpt_iq,
        gpt_clarity: analysisData.gpt_clarity,
        gpt_depth: analysisData.gpt_depth,
        gpt_flow: analysisData.gpt_flow,
        conversation_iq: analysisData.conversation_iq,
        conversation_flow: analysisData.conversation_flow,
        conversation_synergy: analysisData.conversation_synergy,
        justification: analysisData.justification,
      });

      if (insertError) throw insertError;

      setScores(analysisData);
      await fetchConversations();
      
      toast({
        title: "Analysis Complete",
        description: "Your conversation has been analyzed successfully",
      });
      
      setTranscript("");
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze conversation",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const chartData = conversations.map((conv, index) => ({
    date: new Date(conv.created_at).toLocaleDateString(),
    UserIQ: conv.user_iq,
    GPTIQ: conv.gpt_iq,
    ConversationIQ: conv.conversation_iq,
  }));

  // Find best session index for chart marker
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

  const bestSessionIndex = findBestSessionIndex();

  // Calculate averages
  const calculateAverage = (field: string) => {
    if (conversations.length === 0) return 0;
    const sum = conversations.reduce((acc, conv) => acc + (conv[field] || 0), 0);
    return Math.round(sum / conversations.length);
  };

  // Calculate week-over-week comparison
  const calculateWeekComparison = (field: string) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeek = conversations
      .filter(c => new Date(c.created_at) >= oneWeekAgo)
      .map(c => c[field])
      .filter((val): val is number => val !== null && val !== undefined);
    
    const previousWeek = conversations
      .filter(c => {
        const date = new Date(c.created_at);
        return date >= twoWeeksAgo && date < oneWeekAgo;
      })
      .map(c => c[field])
      .filter((val): val is number => val !== null && val !== undefined);

    const currentAvg = currentWeek.length > 0 
      ? currentWeek.reduce((sum, val) => sum + val, 0) / currentWeek.length 
      : 0;
    const previousAvg = previousWeek.length > 0 
      ? previousWeek.reduce((sum, val) => sum + val, 0) / previousWeek.length 
      : 0;

    return {
      current: Math.round(currentAvg),
      previous: Math.round(previousAvg),
      diff: Math.round(currentAvg - previousAvg),
      hasPrevious: previousWeek.length > 0
    };
  };

  const avgUserIQ = calculateAverage("user_iq");
  const avgGPTIQ = calculateAverage("gpt_iq");
  const avgConversationIQ = calculateAverage("conversation_iq");
  
  const userComparison = calculateWeekComparison("user_iq");
  const gptComparison = calculateWeekComparison("gpt_iq");
  const convComparison = calculateWeekComparison("conversation_iq");

  // Find highest and lowest scoring conversations
  const getHighestLowest = () => {
    if (conversations.length === 0) return { highest: null, lowest: null };
    
    let highest = conversations[0];
    let lowest = conversations[0];

    conversations.forEach(conv => {
      const convTotal = (conv.user_iq || 0) + (conv.gpt_iq || 0) + (conv.conversation_iq || 0);
      const highestTotal = (highest.user_iq || 0) + (highest.gpt_iq || 0) + (highest.conversation_iq || 0);
      const lowestTotal = (lowest.user_iq || 0) + (lowest.gpt_iq || 0) + (lowest.conversation_iq || 0);

      if (convTotal > highestTotal) highest = conv;
      if (convTotal < lowestTotal) lowest = conv;
    });

    return { highest, lowest };
  };

  const { highest, lowest } = getHighestLowest();

  // Get latest 3 conversations
  const latestConversations = [...conversations].reverse().slice(0, 3);

  const openConversationDetails = (conversation: any) => {
    setSelectedConversation(conversation);
    setShowConversationDialog(true);
  };

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
            <span className="text-lg sm:text-xl font-bold text-white truncate">GPTIQX</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button size="sm" variant="ghost" onClick={() => navigate("/history")} className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">History</span>
            </Button>
            
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
            
            <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Main IQ Scores */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">UserIQ</CardTitle>
                <Brain className="w-4 h-4 text-white/40" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {scores?.user_iq || "--"}
                </div>
                <p className="text-xs text-white/40">Prompt quality score</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">GPTIQ</CardTitle>
                <Zap className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {scores?.gpt_iq || "--"}
                </div>
                <p className="text-xs text-white/40">AI response quality</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/60">ConversationIQ</CardTitle>
                <BarChart3 className="w-4 h-4 text-white/40" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white mb-1">
                  {scores?.conversation_iq || "--"}
                </div>
                <p className="text-xs text-white/40">Overall synergy</p>
              </CardContent>
            </Card>
          </div>

          {/* Intelligence Status Summary */}
          {scores && (
            <IntelligenceStatus scores={scores} />
          )}

          {/* Score Breakdowns */}
          {scores && (
            <TooltipProvider>
              <div className="grid md:grid-cols-3 gap-6">
                {/* UserIQ Breakdown */}
                <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-white/60" />
                      UserIQ Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Clarity</span>
                          <span className="font-bold text-white">{scores.user_clarity || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How clear and well-structured are the prompts?</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Depth</span>
                          <span className="font-bold text-white">{scores.user_depth || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How thoughtful and detailed are the questions?</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Creativity</span>
                          <span className="font-bold text-white">{scores.user_creativity || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How original and innovative are the prompts?</p>
                      </TooltipContent>
                    </Tooltip>

                    <MetricExplainer metric="UserIQ" className="mt-4" />
                  </CardContent>
                </Card>

                {/* GPTIQ Breakdown */}
                <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent" />
                      GPTIQ Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Clarity</span>
                          <span className="font-bold text-white">{scores.gpt_clarity || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How clear and understandable are the responses?</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Depth</span>
                          <span className="font-bold text-white">{scores.gpt_depth || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How comprehensive and detailed are the answers?</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Flow</span>
                          <span className="font-bold text-white">{scores.gpt_flow || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How well does GPT maintain context and flow?</p>
                      </TooltipContent>
                    </Tooltip>

                    <MetricExplainer metric="GPTIQ" className="mt-4" />
                  </CardContent>
                </Card>

                {/* ConversationIQ Breakdown */}
                <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-white/60" />
                      ConversationIQ Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Flow</span>
                          <span className="font-bold text-white">{scores.conversation_flow || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How natural is the conversation progression?</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-help">
                          <span className="text-white/80">Synergy</span>
                          <span className="font-bold text-white">{scores.conversation_synergy || "--"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>How well do user and GPT complement each other?</p>
                      </TooltipContent>
                    </Tooltip>

                    <MetricExplainer metric="ConversationIQ" className="mt-4" />
                  </CardContent>
                </Card>
              </div>

              {/* Primary Insight - What to improve next */}
              <PrimaryInsight
                currentScores={scores}
                conversationCount={conversations.length}
                isPro={false}
              />

              {/* Improvement Focus Mode */}
              <ImprovementFocus scores={scores} />

              {/* Justification */}
              {scores.justification && (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 leading-relaxed select-text">{scores.justification}</p>
                  </CardContent>
                </Card>
              )}
            </TooltipProvider>
          )}

          {/* Analytics & Averages */}
          {conversations.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="glass border-white/10 hover:border-accent/30 transition-all duration-300 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-white/60">Average UserIQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{avgUserIQ}</div>
                  {userComparison.hasPrevious && (
                    <div className={`flex items-center gap-1 text-sm ${userComparison.diff > 0 ? 'text-green-400' : userComparison.diff < 0 ? 'text-red-400' : 'text-white/60'}`}>
                      {userComparison.diff > 0 ? (
                        <><TrendingUp className="h-4 w-4" /> +{userComparison.diff}</>
                      ) : userComparison.diff < 0 ? (
                        <><TrendingDown className="h-4 w-4" /> {userComparison.diff}</>
                      ) : (
                        <span>No change</span>
                      )}
                      <span className="text-white/40 ml-1">vs last week</span>
                    </div>
                  )}
                  {!userComparison.hasPrevious && (
                    <p className="text-xs text-white/40 mt-1">Across {conversations.length} conversations</p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass border-white/10 hover:border-accent/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-white/60">Average GPTIQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{avgGPTIQ}</div>
                  {gptComparison.hasPrevious && (
                    <div className={`flex items-center gap-1 text-sm ${gptComparison.diff > 0 ? 'text-green-400' : gptComparison.diff < 0 ? 'text-red-400' : 'text-white/60'}`}>
                      {gptComparison.diff > 0 ? (
                        <><TrendingUp className="h-4 w-4" /> +{gptComparison.diff}</>
                      ) : gptComparison.diff < 0 ? (
                        <><TrendingDown className="h-4 w-4" /> {gptComparison.diff}</>
                      ) : (
                        <span>No change</span>
                      )}
                      <span className="text-white/40 ml-1">vs last week</span>
                    </div>
                  )}
                  {!gptComparison.hasPrevious && (
                    <p className="text-xs text-white/40 mt-1">Across {conversations.length} conversations</p>
                  )}
                </CardContent>
              </Card>

              <Card className="glass border-white/10 hover:border-accent/30 transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-white/60">Average ConversationIQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{avgConversationIQ}</div>
                  {convComparison.hasPrevious && (
                    <div className={`flex items-center gap-1 text-sm ${convComparison.diff > 0 ? 'text-green-400' : convComparison.diff < 0 ? 'text-red-400' : 'text-white/60'}`}>
                      {convComparison.diff > 0 ? (
                        <><TrendingUp className="h-4 w-4" /> +{convComparison.diff}</>
                      ) : convComparison.diff < 0 ? (
                        <><TrendingDown className="h-4 w-4" /> {convComparison.diff}</>
                      ) : (
                        <span>No change</span>
                      )}
                      <span className="text-white/40 ml-1">vs last week</span>
                    </div>
                  )}
                  {!convComparison.hasPrevious && (
                    <p className="text-xs text-white/40 mt-1">Across {conversations.length} conversations</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Highlights */}
          {conversations.length > 0 && highest && lowest && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass border-white/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer group" onClick={() => openConversationDetails(highest)}>
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                    Highest Scoring Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-white/80 font-medium truncate">{highest.title}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-white/60">UserIQ: <span className="text-white font-bold">{highest.user_iq}</span></span>
                    <span className="text-white/60">GPTIQ: <span className="text-white font-bold">{highest.gpt_iq}</span></span>
                    <span className="text-white/60">ConvIQ: <span className="text-white font-bold">{highest.conversation_iq}</span></span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">{new Date(highest.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to view details →</p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 hover:border-red-500/30 transition-all duration-300 cursor-pointer group" onClick={() => openConversationDetails(lowest)}>
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <ArrowDownRight className="w-5 h-5 text-red-500" />
                    Lowest Scoring Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-white/80 font-medium truncate">{lowest.title}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-white/60">UserIQ: <span className="text-white font-bold">{lowest.user_iq}</span></span>
                    <span className="text-white/60">GPTIQ: <span className="text-white font-bold">{lowest.gpt_iq}</span></span>
                    <span className="text-white/60">ConvIQ: <span className="text-white font-bold">{lowest.conversation_iq}</span></span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">{new Date(lowest.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-accent mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to view details →</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Learning Timeline (replaces Latest Conversations) */}
          {conversations.length > 0 && (
            <LearningTimeline 
              conversations={conversations} 
              onConversationClick={openConversationDetails}
            />
          )}

          {/* Trend Graphs */}
          {conversations.length > 0 && (
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
                <FuturisticTrendsChart data={chartData} bestSessionIndex={bestSessionIndex} />
              </CardContent>
            </Card>
          )}

          {/* Analysis Section */}
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <CardTitle className="text-xl text-white">Analyze Conversation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your conversation transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[300px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-white/20"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full glow-white"
                size="lg"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Conversation"}
              </Button>
            </CardContent>
          </Card>
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
                {/* IQ Scores */}
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

                {/* Score Breakdowns */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="glass p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3">UserIQ Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Clarity</span>
                        <span className="text-white font-bold">{selectedConversation.user_clarity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Depth</span>
                        <span className="text-white font-bold">{selectedConversation.user_depth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Creativity</span>
                        <span className="text-white font-bold">{selectedConversation.user_creativity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3">GPTIQ Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Clarity</span>
                        <span className="text-white font-bold">{selectedConversation.gpt_clarity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Depth</span>
                        <span className="text-white font-bold">{selectedConversation.gpt_depth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Flow</span>
                        <span className="text-white font-bold">{selectedConversation.gpt_flow}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3">ConversationIQ Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Flow</span>
                        <span className="text-white font-bold">{selectedConversation.conversation_flow}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Synergy</span>
                        <span className="text-white font-bold">{selectedConversation.conversation_synergy}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Justification */}
                {selectedConversation.justification && (
                  <div className="glass p-4 rounded-lg border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Analysis Summary
                    </h4>
                    <p className="text-white/80 text-sm leading-relaxed select-text">{selectedConversation.justification}</p>
                  </div>
                )}

                {/* Full Transcript */}
                <div className="glass p-4 rounded-lg border border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-2">Full Transcript</h4>
                  <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap select-text">
                    {selectedConversation.transcript}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;