import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Zap, TrendingUp, Upload, LogOut, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    checkUser();
    loadConversations();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    // Load profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error loading conversations:", error);
    } else {
      setConversations(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpload = async () => {
    if (!title.trim() || !transcript.trim()) {
      toast.error("Please provide both title and transcript");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      // Generate mock scores for demo (replace with actual AI analysis later)
      const userScore = Math.floor(Math.random() * 30) + 70;
      const gptScore = Math.floor(Math.random() * 30) + 70;
      const conversationScore = Math.floor(Math.random() * 30) + 70;

      const userIQ = 70 + 0.6 * userScore;
      const gptIQ = 70 + 0.6 * gptScore;
      const conversationIQ = 70 + 0.6 * conversationScore;

      const { error } = await supabase.from("conversations").insert({
        user_id: user.id,
        title,
        transcript,
        user_iq: Math.round(userIQ),
        gpt_iq: Math.round(gptIQ),
        conversation_iq: Math.round(conversationIQ),
        raw_user_score: userScore,
        raw_gpt_score: gptScore,
        raw_conversation_score: conversationScore,
        analysis_details: {
          user_breakdown: {
            clarity: Math.random() * 100,
            depth: Math.random() * 100,
            creativity: Math.random() * 100,
          },
          gpt_breakdown: {
            accuracy: Math.random() * 100,
            coherence: Math.random() * 100,
            problemSolving: Math.random() * 100,
          },
        },
      });

      if (error) throw error;

      toast.success("Analysis complete!");
      setTitle("");
      setTranscript("");
      loadConversations();
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze conversation");
    } finally {
      setLoading(false);
    }
  };

  const getIQColor = (iq: number) => {
    if (iq >= 120) return "text-accent";
    if (iq >= 110) return "text-primary";
    if (iq >= 90) return "text-foreground";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Recent UserIQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${conversations[0] ? getIQColor(conversations[0].user_iq) : 'text-muted-foreground'}`}>
                {conversations[0]?.user_iq || "--"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {conversations[0] ? "Last analysis" : "No data yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Recent GPTIQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${conversations[0] ? getIQColor(conversations[0].gpt_iq) : 'text-muted-foreground'}`}>
                {conversations[0]?.gpt_iq || "--"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {conversations[0] ? "Last analysis" : "No data yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                ConversationIQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${conversations[0] ? getIQColor(conversations[0].conversation_iq) : 'text-muted-foreground'}`}>
                {conversations[0]?.conversation_iq || "--"}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {conversations[0] ? "Last analysis" : "No data yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="glass border-white/10 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Analyze New Conversation
            </CardTitle>
            <CardDescription>
              Upload your conversation transcript to get IQ scores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Conversation Title</Label>
              <Input
                id="title"
                placeholder="e.g., Marketing Strategy Discussion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                placeholder="Paste your conversation transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={8}
                className="glass border-white/10 resize-none"
              />
            </div>
            <Button
              variant="hero"
              onClick={handleUpload}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Analyzing..." : "Analyze Conversation"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        {conversations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Analyses</h2>
            <div className="space-y-4">
              {conversations.map((conv) => (
                <Card key={conv.id} className="glass border-white/10 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{conv.title}</CardTitle>
                    <CardDescription>
                      {new Date(conv.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">UserIQ</p>
                        <p className={`text-2xl font-bold ${getIQColor(conv.user_iq)}`}>
                          {conv.user_iq}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">GPTIQ</p>
                        <p className={`text-2xl font-bold ${getIQColor(conv.gpt_iq)}`}>
                          {conv.gpt_iq}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">ConversationIQ</p>
                        <p className={`text-2xl font-bold ${getIQColor(conv.conversation_iq)}`}>
                          {conv.conversation_iq}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;