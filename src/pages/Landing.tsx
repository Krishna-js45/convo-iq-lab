import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <Brain className="w-16 h-16 text-primary" />
          </div>
          
          <h1 className="text-5xl font-semibold text-foreground">
            GPTIQX
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Measure the intelligence quotient of your conversations
          </p>
          
          <div className="flex gap-3 justify-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              View Demo
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center text-foreground">
            Three Intelligence Scores
          </h2>
          
          <div className="grid gap-4">
            <div className="border border-border/40 rounded-lg p-6 bg-card/30 hover:bg-card/50 transition-colors">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">UserIQ</h3>
                  <p className="text-sm text-muted-foreground">
                    Measures prompt clarity, reasoning depth, creativity, and consistency
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border border-border/40 rounded-lg p-6 bg-card/30 hover:bg-card/50 transition-colors">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-accent mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">GPTIQ</h3>
                  <p className="text-sm text-muted-foreground">
                    Evaluates AI accuracy, coherence, problem-solving, and creativity
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border border-border/40 rounded-lg p-6 bg-card/30 hover:bg-card/50 transition-colors">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-1">ConversationIQ</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyzes flow, balance, productivity, and mutual creativity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;