import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User, Mail, Calendar, Crown, MessageSquare, TrendingUp, Award, ArrowUp, ArrowDown, Sparkles, ChevronRight, KeyRound, Trash2 } from "lucide-react";
import gptiqxIcon from "@/assets/gptiqx-icon.png";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileData {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  created_at: string | null;
}

interface ConversationStats {
  total: number;
  avgUserIQ: number;
  avgGPTIQ: number;
  avgConversationIQ: number;
  bestScore: number;
  lastActive: string | null;
  firstConversation: { date: string; score: number } | null;
  firstAbove80: { date: string; score: number } | null;
  bestConversation: { date: string; score: number } | null;
  initialAvgIQ: number;
  currentAvgIQ: number;
  improvement: number;
  strongestArea: string;
  weakestArea: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const fetchProfileAndStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch all conversations
    const { data: conversations } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });

    if (conversations && conversations.length > 0) {
      // Calculate stats
      const total = conversations.length;
      const avgUserIQ = Math.round(conversations.reduce((acc, c) => acc + (c.user_iq || 0), 0) / total);
      const avgGPTIQ = Math.round(conversations.reduce((acc, c) => acc + (c.gpt_iq || 0), 0) / total);
      const avgConversationIQ = Math.round(conversations.reduce((acc, c) => acc + (c.conversation_iq || 0), 0) / total);
      
      // Best score
      let bestConv = conversations[0];
      conversations.forEach(c => {
        if ((c.conversation_iq || 0) > (bestConv.conversation_iq || 0)) {
          bestConv = c;
        }
      });

      // First conversation above 80
      const above80 = conversations.find(c => (c.conversation_iq || 0) >= 80);

      // Calculate initial vs current averages (first 3 vs last 3)
      const first3 = conversations.slice(0, 3);
      const last3 = conversations.slice(-3);
      
      const initialAvgIQ = Math.round(first3.reduce((acc, c) => acc + (c.conversation_iq || 0), 0) / first3.length);
      const currentAvgIQ = Math.round(last3.reduce((acc, c) => acc + (c.conversation_iq || 0), 0) / last3.length);
      const improvement = currentAvgIQ - initialAvgIQ;

      // Find strongest and weakest areas
      const avgClarity = conversations.reduce((acc, c) => acc + (c.user_clarity || 0), 0) / total;
      const avgDepth = conversations.reduce((acc, c) => acc + (c.user_depth || 0), 0) / total;
      const avgCreativity = conversations.reduce((acc, c) => acc + (c.user_creativity || 0), 0) / total;

      const areas = [
        { name: "clarity", value: avgClarity },
        { name: "depth", value: avgDepth },
        { name: "creativity", value: avgCreativity },
      ];

      const strongest = areas.reduce((max, a) => a.value > max.value ? a : max, areas[0]);
      const weakest = areas.reduce((min, a) => a.value < min.value ? a : min, areas[0]);

      setStats({
        total,
        avgUserIQ,
        avgGPTIQ,
        avgConversationIQ,
        bestScore: bestConv.conversation_iq || 0,
        lastActive: conversations[conversations.length - 1].created_at,
        firstConversation: {
          date: conversations[0].created_at || "",
          score: conversations[0].conversation_iq || 0,
        },
        firstAbove80: above80 ? {
          date: above80.created_at || "",
          score: above80.conversation_iq || 0,
        } : null,
        bestConversation: {
          date: bestConv.created_at || "",
          score: bestConv.conversation_iq || 0,
        },
        initialAvgIQ,
        currentAvgIQ,
        improvement,
        strongestArea: strongest.name,
        weakestArea: weakest.name,
      });
    } else {
      setStats(null);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setShowPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsUpdatingPassword(false);
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
    });
    setShowDeleteDialog(false);
  };

  const generateLearningSummary = () => {
    if (!stats) return null;
    
    const improvementText = stats.improvement > 0 
      ? `improved by ${stats.improvement} points` 
      : stats.improvement < 0 
        ? `needs attention` 
        : `remained consistent`;

    const strongestText = stats.strongestArea === "clarity" 
      ? "clear and well-structured prompts"
      : stats.strongestArea === "depth"
        ? "thoughtful and detailed questions"
        : "creative and original thinking";

    const weakestText = stats.weakestArea === "clarity"
      ? "prompt clarity"
      : stats.weakestArea === "depth"
        ? "question depth"
        : "creative exploration";

    return `Over ${stats.total} conversations, your overall ConversationIQ has ${improvementText}. Your strength lies in ${strongestText}, while ${weakestText} offers the most room for growth.`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black grid-pattern flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img src={gptiqxIcon} alt="GPTIQX" className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="text-lg sm:text-xl font-bold text-white">GPTIQX</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button size="sm" variant="ghost" onClick={() => navigate("/dashboard")} className="gap-1.5 text-xs sm:text-sm">
              Dashboard
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-1.5 text-xs sm:text-sm">
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Section 1: User Identity */}
          <Card className="glass border-white/10">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <Avatar className="h-20 w-20 border-2 border-white/20">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-white/10 text-white text-2xl">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{profile?.full_name || "User"}</h1>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mt-2 text-white/60 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {profile?.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Member since {formatDate(profile?.created_at || null)}
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm">
                    <Crown className="w-3.5 h-3.5" />
                    {profile?.subscription_tier === "pro" ? "Pro" : "Free"} Plan
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Overall Usage Summary */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-white/60" />
                Overall Usage Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-white/50 mt-1">Conversations</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white">{stats.avgUserIQ}</p>
                    <p className="text-xs text-white/50 mt-1">Avg UserIQ</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white">{stats.avgGPTIQ}</p>
                    <p className="text-xs text-white/50 mt-1">Avg GPTIQ</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-white">{stats.avgConversationIQ}</p>
                    <p className="text-xs text-white/50 mt-1">Avg ConversationIQ</p>
                  </div>
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 text-center">
                    <p className="text-3xl font-bold text-accent">{stats.bestScore}</p>
                    <p className="text-xs text-accent/70 mt-1">Best Score</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-sm font-medium text-white truncate">{formatDate(stats.lastActive)}</p>
                    <p className="text-xs text-white/50 mt-1">Last Active</p>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-center py-8">No conversations analyzed yet</p>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Then vs Now Progress Card */}
          {stats && stats.total >= 3 && (
            <Card className="glass border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-white/50 mb-2">When you started</p>
                    <p className="text-3xl font-bold text-white/70">{stats.initialAvgIQ}</p>
                    <p className="text-xs text-white/40 mt-1">Avg ConversationIQ</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-white/50 mb-2">Now</p>
                    <p className="text-3xl font-bold text-white">{stats.currentAvgIQ}</p>
                    <p className="text-xs text-white/40 mt-1">Avg ConversationIQ</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${stats.improvement > 0 ? 'bg-green-500/10 border-green-500/30' : stats.improvement < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                    <p className="text-xs text-white/50 mb-2">Change</p>
                    <div className="flex items-center justify-center gap-1">
                      {stats.improvement > 0 ? (
                        <ArrowUp className="w-5 h-5 text-green-400" />
                      ) : stats.improvement < 0 ? (
                        <ArrowDown className="w-5 h-5 text-red-400" />
                      ) : null}
                      <p className={`text-3xl font-bold ${stats.improvement > 0 ? 'text-green-400' : stats.improvement < 0 ? 'text-red-400' : 'text-white/70'}`}>
                        {stats.improvement > 0 ? '+' : ''}{stats.improvement}
                      </p>
                    </div>
                    <p className="text-xs text-white/40 mt-1">points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 4: Learning Summary */}
          {stats && stats.total >= 3 && (
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 leading-relaxed">
                  {generateLearningSummary()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Section 5: Milestones */}
          {stats && (
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.firstConversation && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">First Conversation</p>
                        <p className="text-xs text-white/50">{formatDate(stats.firstConversation.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{stats.firstConversation.score}</p>
                      <p className="text-xs text-white/50">Score</p>
                    </div>
                  </div>
                )}

                {stats.firstAbove80 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">First Score Above 80</p>
                        <p className="text-xs text-white/50">{formatDate(stats.firstAbove80.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">{stats.firstAbove80.score}</p>
                      <p className="text-xs text-white/50">Score</p>
                    </div>
                  </div>
                )}

                {stats.bestConversation && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Award className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Best Conversation</p>
                        <p className="text-xs text-white/50">{formatDate(stats.bestConversation.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-accent">{stats.bestConversation.score}</p>
                      <p className="text-xs text-white/50">Score</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section 6: Account Controls */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <User className="w-5 h-5 text-white/60" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between text-white/80 hover:text-white hover:bg-white/5"
                onClick={() => setShowPasswordDialog(true)}
              >
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Change Password
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-white/80 hover:text-white hover:bg-white/5"
                onClick={handleSignOut}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-between text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-white/80">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white/80">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-black/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Account</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Request Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
