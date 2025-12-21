import { InsightCard } from "./InsightCard";

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

interface TrendData {
  current: number;
  previous: number;
  diff: number;
  hasPrevious: boolean;
}

interface InsightEngineProps {
  currentScores: ConversationData | null;
  userTrend: TrendData;
  gptTrend: TrendData;
  convTrend: TrendData;
  conversationCount: number;
}

interface Insight {
  type: "positive" | "negative" | "neutral" | "info" | "warning";
  title: string;
  description: string;
  recommendation?: string;
  priority: number;
}

export const InsightEngine = ({
  currentScores,
  userTrend,
  gptTrend,
  convTrend,
  conversationCount
}: InsightEngineProps) => {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    if (!currentScores) {
      insights.push({
        type: "info",
        title: "Get Started",
        description: "Analyze your first conversation to receive personalized insights and recommendations.",
        priority: 1
      });
      return insights;
    }

    // Trend-based insights
    if (userTrend.hasPrevious) {
      if (userTrend.diff >= 10) {
        insights.push({
          type: "positive",
          title: "UserIQ Surge Detected",
          description: `Your prompt quality improved by ${userTrend.diff} points this week. Your questions are becoming more focused and effective.`,
          recommendation: "Keep refining your prompting style — specificity and context are paying off.",
          priority: 1
        });
      } else if (userTrend.diff <= -10) {
        insights.push({
          type: "warning",
          title: "UserIQ Decline Noticed",
          description: `Your prompt quality dropped ${Math.abs(userTrend.diff)} points compared to last week.`,
          recommendation: "Try adding more context to your prompts and be specific about desired outcomes.",
          priority: 1
        });
      }
    }

    if (gptTrend.hasPrevious && gptTrend.diff <= -10) {
      insights.push({
        type: "negative",
        title: "AI Response Quality Dip",
        description: `GPT responses declined ${Math.abs(gptTrend.diff)} points this week.`,
        recommendation: "Consider breaking complex questions into smaller, focused prompts for better AI responses.",
        priority: 2
      });
    }

    if (convTrend.hasPrevious && convTrend.diff >= 10) {
      insights.push({
        type: "positive",
        title: "Conversation Synergy Improving",
        description: `Your overall dialogue quality is up ${convTrend.diff} points — conversations are flowing more naturally.`,
        priority: 2
      });
    }

    // Score-based insights
    if (currentScores.user_clarity && currentScores.user_depth) {
      const clarityDepthGap = Math.abs(currentScores.user_clarity - currentScores.user_depth);
      if (clarityDepthGap > 20) {
        if (currentScores.user_clarity > currentScores.user_depth) {
          insights.push({
            type: "info",
            title: "Depth Opportunity",
            description: "Your prompts are clear but could go deeper. Adding 'why' and 'how' questions can unlock richer responses.",
            recommendation: "Try layered questions: start broad, then drill into specifics.",
            priority: 3
          });
        } else {
          insights.push({
            type: "info",
            title: "Clarity Enhancement Needed",
            description: "Your questions are deep but could be clearer. Simplifying structure will help AI understand your intent.",
            recommendation: "Lead with your main question, then add context and constraints.",
            priority: 3
          });
        }
      }
    }

    if (currentScores.conversation_synergy && currentScores.conversation_synergy < 60) {
      insights.push({
        type: "warning",
        title: "Low Synergy Alert",
        description: "The back-and-forth isn't building momentum. Responses may not be connecting well with prompts.",
        recommendation: "Reference AI's previous points in follow-ups to create more cohesive dialogue.",
        priority: 2
      });
    }

    if (currentScores.gpt_flow && currentScores.gpt_flow > 85) {
      insights.push({
        type: "positive",
        title: "Excellent Context Retention",
        description: "The AI is maintaining context exceptionally well across your conversation threads.",
        priority: 4
      });
    }

    // Low conversation count guidance
    if (conversationCount < 5) {
      insights.push({
        type: "neutral",
        title: "Building Your Baseline",
        description: `${5 - conversationCount} more conversations needed for meaningful trend analysis.`,
        priority: 5
      });
    }

    // High performer recognition
    const avgScore = (currentScores.user_iq + currentScores.gpt_iq + currentScores.conversation_iq) / 3;
    if (avgScore >= 85) {
      insights.push({
        type: "positive",
        title: "Expert-Level Interactions",
        description: "You're in the top tier of conversation quality. Your prompting skills demonstrate mastery.",
        priority: 1
      });
    }

    // Sort by priority and limit
    return insights.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  const insights = generateInsights();

  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <InsightCard
          key={index}
          type={insight.type}
          title={insight.title}
          description={insight.description}
          recommendation={insight.recommendation}
        />
      ))}
    </div>
  );
};
