import { BookOpen, Brain, Zap, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  user_iq: number;
  gpt_iq: number;
  conversation_iq: number;
  user_clarity?: number;
  user_depth?: number;
  user_creativity?: number;
  conversation_flow?: number;
  conversation_synergy?: number;
}

interface LearningTimelineProps {
  conversations: Conversation[];
  onConversationClick: (conv: Conversation) => void;
  className?: string;
}

const generateTakeaway = (conv: Conversation, prevConv?: Conversation): string => {
  const factors = [
    { name: "clarity", value: conv.user_clarity ?? 0 },
    { name: "depth", value: conv.user_depth ?? 0 },
    { name: "creativity", value: conv.user_creativity ?? 0 },
    { name: "flow", value: conv.conversation_flow ?? 0 },
    { name: "synergy", value: conv.conversation_synergy ?? 0 },
  ];

  // Find strongest and weakest
  const strongest = factors.reduce((max, f) => f.value > max.value ? f : max, factors[0]);
  const weakest = factors.reduce((min, f) => f.value < min.value ? f : min, factors[0]);

  // Compare with previous if available
  if (prevConv) {
    const prevFactors = [
      { name: "clarity", value: prevConv.user_clarity ?? 0 },
      { name: "depth", value: prevConv.user_depth ?? 0 },
      { name: "creativity", value: prevConv.user_creativity ?? 0 },
      { name: "flow", value: prevConv.conversation_flow ?? 0 },
      { name: "synergy", value: prevConv.conversation_synergy ?? 0 },
    ];

    // Check for improvements
    const improved = factors.filter((f, i) => f.value > prevFactors[i].value + 5);
    const declined = factors.filter((f, i) => f.value < prevFactors[i].value - 5);

    if (improved.length > 0 && declined.length > 0) {
      return `${improved[0].name} improved, ${declined[0].name} dropped`;
    } else if (improved.length > 0) {
      return `Notable ${improved[0].name} improvement`;
    } else if (declined.length > 0) {
      return `${declined[0].name} needs attention`;
    }
  }

  // Default based on current scores
  if (strongest.value >= 80 && weakest.value >= 70) {
    return "Well-balanced conversation";
  } else if (strongest.value >= 85) {
    return `Strong ${strongest.name}, work on ${weakest.name}`;
  } else if (weakest.value < 50) {
    return `Focus needed on ${weakest.name}`;
  } else {
    return `Good ${strongest.name}, improve ${weakest.name}`;
  }
};

export const LearningTimeline = ({ 
  conversations, 
  onConversationClick,
  className 
}: LearningTimelineProps) => {
  if (conversations.length === 0) {
    return null;
  }

  // Get latest 3, reversed for display (most recent first)
  const displayConversations = [...conversations].reverse().slice(0, 3);

  return (
    <Card className={cn("glass border-white/10", className)}>
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-white/60" />
          Learning Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayConversations.map((conv, index) => {
            // Find previous conversation for comparison
            const allReversed = [...conversations].reverse();
            const currentIndex = allReversed.findIndex(c => c.id === conv.id);
            const prevConv = currentIndex < allReversed.length - 1 ? allReversed[currentIndex + 1] : undefined;
            const takeaway = generateTakeaway(conv, prevConv);

            return (
              <div
                key={conv.id}
                onClick={() => onConversationClick(conv)}
                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/50 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-medium truncate flex-1 pr-4 group-hover:text-accent transition-colors">
                    {conv.title}
                  </h3>
                  <span className="text-xs text-white/40 whitespace-nowrap">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3 text-white/40" />
                      <span className="text-white font-bold">{conv.user_iq}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-accent" />
                      <span className="text-white font-bold">{conv.gpt_iq}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-white/40" />
                      <span className="text-white font-bold">{conv.conversation_iq}</span>
                    </div>
                  </div>
                  
                  <span className="text-xs text-white/50 italic max-w-[180px] truncate">
                    {takeaway}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
