import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Brain, Trash2, Calendar, Download, FileText, Menu, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name: string; avatar_url: string } | null>(null);

  useEffect(() => {
    checkAuth();
    fetchConversations();
  }, []);

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
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!conversationToDelete) return;

    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationToDelete);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Conversation removed from history",
      });

      setConversations(conversations.filter((c) => c.id !== conversationToDelete));
      if (selectedConversation?.id === conversationToDelete) {
        setSelectedConversation(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const exportToPDF = (conversation: Conversation) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(conversation.title, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(formatDate(conversation.created_at), 20, 28);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Intelligence Quotient Scores", 20, 40);
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Score']],
      body: [
        ['UserIQ', conversation.user_iq.toString()],
        ['GPTIQ', conversation.gpt_iq.toString()],
        ['ConversationIQ', conversation.conversation_iq.toString()],
      ],
      theme: 'grid',
    });
    
    let currentY = (doc as any).lastAutoTable.finalY + 10;
    
    if (conversation.user_clarity) {
      doc.text("UserIQ Breakdown", 20, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Component', 'Score']],
        body: [
          ['Clarity', conversation.user_clarity.toString()],
          ['Depth', conversation.user_depth?.toString() || 'N/A'],
          ['Creativity', conversation.user_creativity?.toString() || 'N/A'],
        ],
        theme: 'grid',
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
    
    if (conversation.gpt_clarity) {
      doc.text("GPTIQ Breakdown", 20, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Component', 'Score']],
        body: [
          ['Clarity', conversation.gpt_clarity.toString()],
          ['Depth', conversation.gpt_depth?.toString() || 'N/A'],
          ['Flow', conversation.gpt_flow?.toString() || 'N/A'],
        ],
        theme: 'grid',
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
    
    if (conversation.conversation_flow) {
      doc.text("ConversationIQ Breakdown", 20, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Component', 'Score']],
        body: [
          ['Flow', conversation.conversation_flow.toString()],
          ['Synergy', conversation.conversation_synergy?.toString() || 'N/A'],
        ],
        theme: 'grid',
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }
    
    if (conversation.justification) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text("Analysis Summary", 20, 20);
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(conversation.justification, 170);
      doc.text(splitText, 20, 30);
    }
    
    doc.addPage();
    doc.setFontSize(12);
    doc.text("Full Transcript", 20, 20);
    doc.setFontSize(10);
    const splitTranscript = doc.splitTextToSize(conversation.transcript, 170);
    doc.text(splitTranscript, 20, 30);
    
    doc.save(`${conversation.title.replace(/[^a-z0-9]/gi, '_')}_analysis.pdf`);
    
    toast({
      title: "Exported",
      description: "Conversation exported as PDF",
    });
  };

  const exportToCSV = (conversation: Conversation) => {
    const csvRows = [];
    
    csvRows.push(['GPTIQX Analysis Report']);
    csvRows.push(['Title', conversation.title]);
    csvRows.push(['Date', formatDate(conversation.created_at)]);
    csvRows.push([]);
    
    csvRows.push(['Main Scores']);
    csvRows.push(['Metric', 'Score']);
    csvRows.push(['UserIQ', conversation.user_iq]);
    csvRows.push(['GPTIQ', conversation.gpt_iq]);
    csvRows.push(['ConversationIQ', conversation.conversation_iq]);
    csvRows.push([]);
    
    if (conversation.user_clarity) {
      csvRows.push(['UserIQ Breakdown']);
      csvRows.push(['Component', 'Score']);
      csvRows.push(['Clarity', conversation.user_clarity]);
      csvRows.push(['Depth', conversation.user_depth || 'N/A']);
      csvRows.push(['Creativity', conversation.user_creativity || 'N/A']);
      csvRows.push([]);
    }
    
    if (conversation.gpt_clarity) {
      csvRows.push(['GPTIQ Breakdown']);
      csvRows.push(['Component', 'Score']);
      csvRows.push(['Clarity', conversation.gpt_clarity]);
      csvRows.push(['Depth', conversation.gpt_depth || 'N/A']);
      csvRows.push(['Flow', conversation.gpt_flow || 'N/A']);
      csvRows.push([]);
    }
    
    if (conversation.conversation_flow) {
      csvRows.push(['ConversationIQ Breakdown']);
      csvRows.push(['Component', 'Score']);
      csvRows.push(['Flow', conversation.conversation_flow]);
      csvRows.push(['Synergy', conversation.conversation_synergy || 'N/A']);
      csvRows.push([]);
    }
    
    if (conversation.justification) {
      csvRows.push(['Analysis Summary']);
      csvRows.push([conversation.justification]);
      csvRows.push([]);
    }
    
    csvRows.push(['Full Transcript']);
    csvRows.push([conversation.transcript]);
    
    const csvContent = csvRows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}_analysis.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Conversation exported as CSV",
    });
  };

  const scrollToAnalysis = () => {
    navigate("/dashboard");
  };

  const openConversationDetails = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  // Generate takeaway for a conversation
  const generateTakeaway = (conv: Conversation, prevConv?: Conversation): string => {
    const avgScore = (conv.user_iq + conv.gpt_iq + conv.conversation_iq) / 3;
    
    if (prevConv) {
      const prevAvg = (prevConv.user_iq + prevConv.gpt_iq + prevConv.conversation_iq) / 3;
      const diff = avgScore - prevAvg;
      
      if (diff > 10) {
        return "Significant improvement from previous session";
      } else if (diff > 5) {
        return "Steady progress in conversation quality";
      } else if (diff < -10) {
        return "Consider reviewing what worked in previous sessions";
      } else if (diff < -5) {
        return "Slight dip - focus on clarity next time";
      }
    }
    
    if (avgScore >= 85) {
      return "Excellent conversation quality achieved";
    } else if (avgScore >= 70) {
      return "Good performance with room to grow";
    } else if (avgScore >= 55) {
      return "Average session - focus on depth and clarity";
    } else {
      return "Learning opportunity - try more specific prompts";
    }
  };

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {/* Sidebar */}
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
                  <span className="text-lg sm:text-xl font-bold text-white truncate">Learning Timeline</span>
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
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="text-center text-white/60 py-12">Loading history...</div>
            ) : conversations.length === 0 ? (
              <Card className="glass border-white/10">
                <CardContent className="py-12 text-center">
                  <Brain className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">No conversations yet</p>
                  <p className="text-white/40 text-sm mt-2">
                    Analyze your first conversation to see it here
                  </p>
                  <Button onClick={() => navigate("/dashboard")} className="mt-4">
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {conversations.map((conversation, index) => {
                  const prevConversation = index < conversations.length - 1 ? conversations[index + 1] : undefined;
                  const takeaway = generateTakeaway(conversation, prevConversation);
                  
                  return (
                    <Card
                      key={conversation.id}
                      className="glass border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer group animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2 group-hover:text-accent transition-colors">
                              {conversation.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-white/40">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(conversation.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-white/50 mt-2 italic">{takeaway}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversationToDelete(conversation.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <div className="text-2xl font-bold text-white mb-1">
                              {conversation.user_iq}
                            </div>
                            <div className="text-xs text-white/40">UserIQ</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <div className="text-2xl font-bold text-white mb-1">
                              {conversation.gpt_iq}
                            </div>
                            <div className="text-xs text-white/40">GPTIQ</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/5">
                            <div className="text-2xl font-bold text-white mb-1">
                              {conversation.conversation_iq}
                            </div>
                            <div className="text-xs text-white/40">ConversationIQ</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Detail Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-white/20">
          {selectedConversation && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl text-white flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-accent" />
                      {selectedConversation.title}
                    </DialogTitle>
                    <p className="text-white/40 text-sm mt-1">
                      {formatDate(selectedConversation.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToPDF(selectedConversation)}
                            className="gap-2 border-white/20 text-white hover:bg-white/10"
                          >
                            <FileText className="w-4 h-4" />
                            PDF
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export as PDF</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToCSV(selectedConversation)}
                            className="gap-2 border-white/20 text-white hover:bg-white/10"
                          >
                            <Download className="w-4 h-4" />
                            CSV
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export as CSV</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </DialogHeader>

              {/* Main Scores */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="glass border-white/10">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {selectedConversation.user_iq}
                    </div>
                    <div className="text-sm text-white/60">UserIQ</div>
                  </CardContent>
                </Card>
                <Card className="glass border-white/10">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {selectedConversation.gpt_iq}
                    </div>
                    <div className="text-sm text-white/60">GPTIQ</div>
                  </CardContent>
                </Card>
                <Card className="glass border-white/10">
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {selectedConversation.conversation_iq}
                    </div>
                    <div className="text-sm text-white/60">ConversationIQ</div>
                  </CardContent>
                </Card>
              </div>

              {/* Score Breakdowns */}
              <div className="grid md:grid-cols-3 gap-4">
                {selectedConversation.user_clarity && (
                  <Card className="glass border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white/60">UserIQ Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Clarity</span>
                        <span className="text-white">{selectedConversation.user_clarity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Depth</span>
                        <span className="text-white">{selectedConversation.user_depth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Creativity</span>
                        <span className="text-white">{selectedConversation.user_creativity}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedConversation.gpt_clarity && (
                  <Card className="glass border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white/60">GPTIQ Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Clarity</span>
                        <span className="text-white">{selectedConversation.gpt_clarity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Depth</span>
                        <span className="text-white">{selectedConversation.gpt_depth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Flow</span>
                        <span className="text-white">{selectedConversation.gpt_flow}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedConversation.conversation_flow && (
                  <Card className="glass border-white/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white/60">ConversationIQ Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Flow</span>
                        <span className="text-white">{selectedConversation.conversation_flow}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Synergy</span>
                        <span className="text-white">{selectedConversation.conversation_synergy}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Justification */}
              {selectedConversation.justification && (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 leading-relaxed select-text">
                      {selectedConversation.justification}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Transcript */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Full Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <p className="text-white/70 whitespace-pre-wrap text-sm leading-relaxed select-text">
                      {selectedConversation.transcript}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;
