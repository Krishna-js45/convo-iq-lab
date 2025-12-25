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

interface IntelligenceStatusProps {
  scores: ConversationData | null;
  className?: string;
}

const generateStatusSummary = (scores: ConversationData): string => {
  const avgScore = (scores.user_iq + scores.gpt_iq + scores.conversation_iq) / 3;
  
  // Find the weakest and strongest areas
  const factors = [
    { name: "prompt clarity", value: scores.user_clarity ?? 0 },
    { name: "question depth", value: scores.user_depth ?? 0 },
    { name: "creativity", value: scores.user_creativity ?? 0 },
    { name: "response quality", value: scores.gpt_clarity ?? 0 },
    { name: "conversation flow", value: scores.conversation_flow ?? 0 },
    { name: "synergy", value: scores.conversation_synergy ?? 0 },
  ];

  const weakest = factors.reduce((min, f) => f.value < min.value ? f : min, factors[0]);
  const strongest = factors.reduce((max, f) => f.value > max.value ? f : max, factors[0]);

  // Generate contextual summary
  if (avgScore >= 85) {
    return `Excellent conversation quality. Your ${strongest.name} is particularly strong.`;
  } else if (avgScore >= 70) {
    if (weakest.value < 65) {
      return `Good overall performance, but ${weakest.name} is limiting further improvement.`;
    }
    return `Solid conversation quality with room to grow in ${weakest.name}.`;
  } else if (avgScore >= 55) {
    return `Average performance. Focus on improving ${weakest.name} for the biggest impact.`;
  } else {
    return `Your ${weakest.name} needs attention. Small improvements here will raise all scores.`;
  }
};

export const IntelligenceStatus = ({ scores, className }: IntelligenceStatusProps) => {
  if (!scores) {
    return null;
  }

  const summary = generateStatusSummary(scores);

  return (
    <div className={cn(
      "w-full text-center py-3 px-4 rounded-lg bg-white/5 border border-white/10",
      className
    )}>
      <p className="text-sm text-white/70 leading-relaxed">
        {summary}
      </p>
    </div>
  );
};
