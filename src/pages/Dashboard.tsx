import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, BarChart3, LogOut, Sparkles, TrendingUp, Calendar, History } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    fetchConversations();
  }, [dateFilter]);

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

  const chartData = conversations.map((conv) => ({
    date: new Date(conv.created_at).toLocaleDateString(),
    UserIQ: conv.user_iq,
    GPTIQ: conv.gpt_iq,
    ConversationIQ: conv.conversation_iq,
  }));

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">GPTIQX</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate("/history")} className="gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
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
                  </CardContent>
                </Card>
              </div>

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
                    <p className="text-white/80 leading-relaxed">{scores.justification}</p>
                  </CardContent>
                </Card>
              )}
            </TooltipProvider>
          )}

          {/* Trend Graphs */}
          {conversations.length > 0 && (
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    IQ Trends Over Time
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
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: "rgba(0,0,0,0.9)", 
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="UserIQ" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="GPTIQ" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="ConversationIQ" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
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
    </div>
  );
};

export default Dashboard;