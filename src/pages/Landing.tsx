import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Sparkles, BarChart3, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-white" />
            <span className="text-xl font-bold text-white">GPTIQX</span>
          </div>
          <Button size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-white/80">AI Intelligence Measurement Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Measure Your
            <br />
            <span className="text-accent">Conversation IQ</span>
          </h1>
          
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Advanced analytics for AI conversations. Get precise UserIQ, GPTIQ, and ConversationIQ scores.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="gap-2 glow-white"
            >
              Start Analyzing
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass p-8 rounded-xl hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">UserIQ</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Analyzes prompt clarity, reasoning depth, creative thinking, and engagement quality
              </p>
            </div>

            <div className="glass p-8 rounded-xl hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-colors">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">GPTIQ</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Evaluates AI response accuracy, coherence, problem-solving ability, and creativity
              </p>
            </div>

            <div className="glass p-8 rounded-xl hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">ConversationIQ</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Measures conversation flow, engagement balance, productivity, and synergy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center glass p-12 rounded-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Join thousands of users measuring their conversation intelligence
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="glow-white">
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;