import { TrendingUp, TrendingDown, Lightbulb, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightType = "positive" | "negative" | "neutral" | "info" | "warning";

interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
  recommendation?: string;
  className?: string;
}

const insightStyles: Record<InsightType, { 
  icon: typeof TrendingUp;
  borderColor: string;
  iconColor: string;
  bgColor: string;
}> = {
  positive: {
    icon: TrendingUp,
    borderColor: "border-[hsl(var(--insight-positive))]/30",
    iconColor: "text-[hsl(var(--insight-positive))]",
    bgColor: "bg-[hsl(var(--insight-positive))]/5"
  },
  negative: {
    icon: TrendingDown,
    borderColor: "border-[hsl(var(--insight-negative))]/30",
    iconColor: "text-[hsl(var(--insight-negative))]",
    bgColor: "bg-[hsl(var(--insight-negative))]/5"
  },
  neutral: {
    icon: Info,
    borderColor: "border-[hsl(var(--insight-neutral))]/30",
    iconColor: "text-[hsl(var(--insight-neutral))]",
    bgColor: "bg-[hsl(var(--insight-neutral))]/5"
  },
  info: {
    icon: Lightbulb,
    borderColor: "border-[hsl(var(--insight-info))]/30",
    iconColor: "text-[hsl(var(--insight-info))]",
    bgColor: "bg-[hsl(var(--insight-info))]/5"
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-[hsl(var(--insight-warning))]/30",
    iconColor: "text-[hsl(var(--insight-warning))]",
    bgColor: "bg-[hsl(var(--insight-warning))]/5"
  }
};

export const InsightCard = ({ 
  type, 
  title, 
  description, 
  recommendation,
  className 
}: InsightCardProps) => {
  const styles = insightStyles[type];
  const Icon = styles.icon;

  return (
    <div 
      className={cn(
        "rounded-lg border p-4 transition-all duration-300",
        styles.borderColor,
        styles.bgColor,
        "hover:border-opacity-50",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 flex-shrink-0", styles.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          <p className="text-sm text-white/70 leading-relaxed">{description}</p>
          {recommendation && (
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/10">
              <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-accent">{recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
