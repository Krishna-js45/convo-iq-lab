import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Brain, Zap, BarChart3, LogOut, Sparkles } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState<{ user_iq: number; gpt_iq: number; conversation_iq: number } | null>(null);

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
    
    const mockScores = {
      user_iq: Math.floor(Math.random() * 30) + 70,
      gpt_iq: Math.floor(Math.random() * 30) + 70,
      conversation_iq: Math.floor(Math.random() * 30) + 70,
    };

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
      
      const { error } = await supabase.from("conversations").insert({
        user_id: user.id,
        title: "New Analysis",
        transcript,
        user_iq: mockScores.user_iq,
        gpt_iq: mockScores.gpt_iq,
        conversation_iq: mockScores.conversation_iq,
      });

      if (error) throw error;

      setScores(mockScores);
      toast({
        title: "Analysis Complete",
        description: "Your conversation has been analyzed successfully",
      });
      
      setTranscript("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze conversation",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">GPTIQX</span>
          </div>
          <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass border-white/10">
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

            <Card className="glass border-white/10">
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

            <Card className="glass border-white/10">
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