import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Factor {
  name: string;
  weight: string;
  description: string;
}

interface MetricExplainerProps {
  metric: "UserIQ" | "GPTIQ" | "ConversationIQ";
  className?: string;
}

const metricDefinitions = {
  UserIQ: {
    title: "UserIQ",
    definition: "Measures the quality and effectiveness of user prompts in driving productive AI interactions.",
    methodology: "Composite score (0-100) calculated from three weighted factors analyzing prompt construction, inquiry depth, and originality.",
    factors: [
      {
        name: "Clarity",
        weight: "40%",
        description: "Structure, specificity, and unambiguous communication of intent"
      },
      {
        name: "Depth",
        weight: "35%",
        description: "Thoughtfulness, contextual richness, and multi-layered questioning"
      },
      {
        name: "Creativity",
        weight: "25%",
        description: "Originality, unconventional approaches, and innovative problem framing"
      }
    ]
  },
  GPTIQ: {
    title: "GPTIQ",
    definition: "Evaluates the AI's response quality in addressing user needs and maintaining engagement.",
    methodology: "Composite score (0-100) derived from response analysis across clarity, comprehensiveness, and contextual awareness.",
    factors: [
      {
        name: "Clarity",
        weight: "35%",
        description: "Readability, logical structure, and ease of understanding"
      },
      {
        name: "Depth",
        weight: "40%",
        description: "Thoroughness, actionable detail, and comprehensive coverage"
      },
      {
        name: "Flow",
        weight: "25%",
        description: "Context retention, coherent threading, and natural progression"
      }
    ]
  },
  ConversationIQ: {
    title: "ConversationIQ",
    definition: "Assesses the overall quality of the human-AI dialogue as a collaborative exchange.",
    methodology: "Holistic score (0-100) evaluating interaction dynamics and mutual enhancement between participants.",
    factors: [
      {
        name: "Flow",
        weight: "50%",
        description: "Natural progression, turn-taking rhythm, and topic transitions"
      },
      {
        name: "Synergy",
        weight: "50%",
        description: "Complementary exchanges, building on ideas, and collaborative problem-solving"
      }
    ]
  }
};

export const MetricExplainer = ({ metric, className }: MetricExplainerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const data = metricDefinitions[metric];

  return (
    <div className={cn("rounded-lg border border-white/10 bg-white/5 overflow-hidden", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[hsl(var(--insight-info))]" />
          <span className="text-sm text-white/70">How is {data.title} calculated?</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Definition</h4>
            <p className="text-sm text-white/80 leading-relaxed">{data.definition}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Methodology</h4>
            <p className="text-sm text-white/70 leading-relaxed">{data.methodology}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Factor Breakdown</h4>
            <div className="space-y-2">
              {data.factors.map((factor) => (
                <div 
                  key={factor.name}
                  className="flex items-start gap-3 p-2 rounded-md bg-white/5"
                >
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <span className="text-sm font-medium text-white">{factor.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--insight-info))]/20 text-[hsl(var(--insight-info))]">
                      {factor.weight}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
