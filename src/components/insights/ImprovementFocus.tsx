import { Target, TrendingUp } from "lucide-react";
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

interface ImprovementFocusProps {
  scores: ConversationData | null;
  className?: string;
}

interface FocusArea {
  name: string;
  description: string;
  impactRange: string;
  priority: number;
}

const determineFocusArea = (scores: ConversationData): FocusArea => {
  const factors = [
    { 
      name: "Prompt Clarity", 
      value: scores.user_clarity ?? 100, 
      description: "Clear, well-structured prompts help AI understand your intent precisely.",
      impact: "8–12"
    },
    { 
      name: "Question Depth", 
      value: scores.user_depth ?? 100, 
      description: "Deeper questions unlock more comprehensive and valuable responses.",
      impact: "6–10"
    },
    { 
      name: "Creative Framing", 
      value: scores.user_creativity ?? 100, 
      description: "Unique perspectives lead to more insightful and novel answers.",
      impact: "5–8"
    },
    { 
      name: "Conversation Flow", 
      value: scores.conversation_flow ?? 100, 
      description: "Building on previous responses creates richer dialogue.",
      impact: "7–11"
    },
    { 
      name: "Synergy Building", 
      value: scores.conversation_synergy ?? 100, 
      description: "Strong back-and-forth creates compounding value in conversations.",
      impact: "8–14"
    },
  ];

  // Find the weakest factor
  const weakest = factors.reduce((min, f) => f.value < min.value ? f : min, factors[0]);
  
  // If all scores are good, focus on the one with highest impact potential
  if (weakest.value >= 80) {
    const synergyFactor = factors.find(f => f.name === "Synergy Building")!;
    return {
      name: synergyFactor.name,
      description: "Your fundamentals are strong. Push synergy for peak performance.",
      impactRange: synergyFactor.impact,
      priority: 1
    };
  }

  return {
    name: weakest.name,
    description: weakest.description,
    impactRange: weakest.impact,
    priority: weakest.value < 50 ? 1 : weakest.value < 70 ? 2 : 3
  };
};

export const ImprovementFocus = ({ scores, className }: ImprovementFocusProps) => {
  if (!scores) {
    return null;
  }

  const focus = determineFocusArea(scores);

  return (
    <div className={cn(
      "rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-white/10 flex-shrink-0">
          <Target className="w-5 h-5 text-white/80" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-1">
              Current Improvement Focus
            </p>
            <h3 className="text-lg font-semibold text-white">{focus.name}</h3>
          </div>
          
          <p className="text-sm text-white/60 leading-relaxed">
            {focus.description}
          </p>
          
          <div className="flex items-center gap-2 pt-1">
            <TrendingUp className="w-4 h-4 text-[hsl(var(--insight-positive))]" />
            <span className="text-sm text-white/80">
              Improving this could raise your ConversationIQ by{" "}
              <span className="font-medium text-[hsl(var(--insight-positive))]">
                ~{focus.impactRange} points
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
