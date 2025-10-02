import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    <div className="h-full bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">GPTIQX Dashboard</h1>
          <Button onClick={handleSignOut} variant="ghost" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">UserIQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">--</p>
              <p className="text-xs text-muted-foreground mt-1">Your prompt quality</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">GPTIQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">--</p>
              <p className="text-xs text-muted-foreground mt-1">AI response quality</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">ConversationIQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">--</p>
              <p className="text-xs text-muted-foreground mt-1">Overall synergy</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Analyze Conversation</CardTitle>
            <CardDescription>Paste your conversation transcript to get IQ scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your conversation here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[250px] resize-none bg-background border-border/40 focus-visible:ring-1"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full gap-2"
              variant="default"
            >
              <Upload className="h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze Conversation"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;