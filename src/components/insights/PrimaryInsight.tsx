import { Lightbulb, TrendingUp, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationData {
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
}

interface PrimaryInsightProps {
  currentScores: ConversationData | null;
  conversationCount: number;
  isPro?: boolean;
  className?: string;
}

interface Insight {
  problem: string;
  reason: string;
  action: string;
  category: "clarity" | "depth" | "creativity" | "synergy" | "flow" | "general";
  confidence: "high" | "moderate" | "low";
}

const generatePrimaryInsight = (scores: ConversationData): Insight => {
  // Find the weakest factor to focus on
  const factors = [
    { name: "clarity", value: scores.user_clarity ?? 100, category: "clarity" as const },
    { name: "depth", value: scores.user_depth ?? 100, category: "depth" as const },
    { name: "creativity", value: scores.user_creativity ?? 100, category: "creativity" as const },
    { name: "synergy", value: scores.conversation_synergy ?? 100, category: "synergy" as const },
    { name: "flow", value: scores.conversation_flow ?? 100, category: "flow" as const },
  ];

  const weakest = factors.reduce((min, f) => f.value < min.value ? f : min, factors[0]);
  
  // Determine confidence based on score gap
  const secondWeakest = factors
    .filter(f => f.name !== weakest.name)
    .reduce((min, f) => f.value < min.value ? f : min, factors[1]);
  
  const scoreGap = secondWeakest.value - weakest.value;
  const confidence: "high" | "moderate" | "low" = 
    scoreGap >= 15 ? "high" : 
    scoreGap >= 5 ? "moderate" : 
    "low";

  // Generate insight based on weakest factor
  const insights: Record<string, Insight> = {
    clarity: {
      problem: "Your prompts could be clearer",
      reason: `Your clarity score is ${weakest.value}. The AI may struggle to understand exactly what you're asking for.`,
      action: "Start with your main question first, then add context. Be specific about what format you want the answer in.",
      category: "clarity",
      confidence
    },
    depth: {
      problem: "Your questions lack depth",
      reason: `Your depth score is ${weakest.value}. Simple questions often get surface-level answers.`,
      action: "Add 'why' or 'how' to your questions. Ask the AI to explain its reasoning or consider alternatives.",
      category: "depth",
      confidence
    },
    creativity: {
      problem: "Your prompts are too predictable",
      reason: `Your creativity score is ${weakest.value}. Standard questions get standard answers.`,
      action: "Try asking from a different angle. Use 'what if' scenarios or ask the AI to challenge assumptions.",
      category: "creativity",
      confidence
    },
    synergy: {
      problem: "The conversation isn't building momentum",
      reason: `Your synergy score is ${weakest.value}. Each exchange feels disconnected from the previous one.`,
      action: "Reference what the AI said in your follow-ups. Build on previous answers instead of starting fresh.",
      category: "synergy",
      confidence
    },
    flow: {
      problem: "The conversation flow is choppy",
      reason: `Your flow score is ${weakest.value}. The dialogue doesn't progress naturally.`,
      action: "Guide the conversation step by step. After each response, ask a logical follow-up question.",
      category: "flow",
      confidence
    }
  };

  // If all scores are good, provide positive reinforcement
  if (weakest.value >= 80) {
    return {
      problem: "You're doing great!",
      reason: `All your scores are above 80. Your conversation quality is excellent.`,
      action: "Keep experimenting with complex topics. Try multi-step reasoning or creative challenges to push further.",
      category: "general",
      confidence: "high"
    };
  }

  return insights[weakest.name] || insights.clarity;
};

export const PrimaryInsight = ({ 
  currentScores, 
  conversationCount,
  isPro = false,
  className 
}: PrimaryInsightProps) => {
  if (!currentScores) {
    return (
      <div className={cn(
        "rounded-xl border border-white/10 bg-white/5 p-6",
        className
      )}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent/10">
            <Lightbulb className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">What should you improve?</h3>
            <p className="text-white/60">
              Analyze your first conversation to get personalized guidance on improving your AI interactions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const insight = generatePrimaryInsight(currentScores);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Primary Insight Card */}
      <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-transparent p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent/20 flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-accent uppercase tracking-wide">Your Next Improvement</p>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide",
                  insight.confidence === "high" && "bg-[hsl(var(--insight-positive))]/20 text-[hsl(var(--insight-positive))]",
                  insight.confidence === "moderate" && "bg-[hsl(var(--insight-info))]/20 text-[hsl(var(--insight-info))]",
                  insight.confidence === "low" && "bg-white/10 text-white/60"
                )}>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {insight.confidence} confidence
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white">{insight.problem}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-white/40 uppercase w-16 flex-shrink-0 pt-0.5">Why</span>
                <p className="text-sm text-white/70">{insight.reason}</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-white/40 uppercase w-16 flex-shrink-0 pt-0.5">Do This</span>
                <p className="text-sm text-white font-medium">{insight.action}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Features Teaser */}
      {!isPro && conversationCount >= 3 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Lock className="w-4 h-4 text-white/60" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80">
                <span className="text-accent font-medium">Pro:</span> See patterns across sessions, improvement predictions, and personalized roadmaps
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pro Features - shown when isPro is true */}
      {isPro && conversationCount >= 3 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-medium text-white">Pro Insights</h4>
          </div>
          
          <div className="grid gap-3">
            {/* Pattern Detection */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--insight-info))] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Repeated Pattern Detected</p>
                <p className="text-xs text-white/60 mt-1">
                  {insight.category === "clarity" && "Clarity issues appeared in 3 of your last 5 sessions."}
                  {insight.category === "depth" && "Shallow questions are a recurring theme in your conversations."}
                  {insight.category === "creativity" && "Your prompts follow similar patterns across sessions."}
                  {insight.category === "synergy" && "Conversation momentum drops mid-session repeatedly."}
                  {insight.category === "flow" && "Flow issues persist across multiple conversations."}
                  {insight.category === "general" && "Your strong performance is consistent across sessions."}
                </p>
              </div>
            </div>

            {/* Improvement Prediction */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <Sparkles className="w-4 h-4 text-[hsl(var(--insight-positive))] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Improvement Potential</p>
                <p className="text-xs text-white/60 mt-1">
                  Fixing this issue could raise your average score by ~8-12 points based on similar user patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
