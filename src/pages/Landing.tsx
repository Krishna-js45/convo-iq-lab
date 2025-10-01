import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Sparkles, TrendingUp, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 animated-gradient" />
        <img 
          src={heroBg} 
          alt="Neural network background" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Measure Intelligence. Unlock Insights.</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">GPTIQX</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in">
            The world's first platform to measure the intelligence quotient of your AI conversations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button asChild variant="hero" size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">Start Free Analysis</Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="text-lg px-8 py-6">
              <Link to="/dashboard">View Demo</Link>
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Three Scores. <span className="gradient-text">One Platform.</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 text-lg">
            Comprehensive analysis of every conversation dimension
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* UserIQ Card */}
            <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-6 glow-primary">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">UserIQ</h3>
              <p className="text-muted-foreground mb-4">
                Measures prompt clarity, reasoning depth, creativity, and engagement quality
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Prompt clarity & logic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Depth of reasoning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Creative thinking</span>
                </div>
              </div>
            </div>

            {/* GPTIQ Card */}
            <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mb-6 glow-accent">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">GPTIQ</h3>
              <p className="text-muted-foreground mb-4">
                Evaluates AI response accuracy, coherence, depth, and creative problem-solving
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Factual accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Response coherence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Creative solutions</span>
                </div>
              </div>
            </div>

            {/* ConversationIQ Card */}
            <div className="glass p-8 rounded-2xl hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center mb-6 glow-primary">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">ConversationIQ</h3>
              <p className="text-muted-foreground mb-4">
                Analyzes flow, engagement balance, productivity, and collaborative creativity
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
                  <span>Conversation flow</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
                  <span>Engagement balance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
                  <span>Overall productivity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center glass p-12 rounded-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to measure your <span className="gradient-text">conversation intelligence?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Get 3 free analyses per day. Upgrade to Pro for unlimited insights.
          </p>
          <Button asChild variant="hero" size="lg" className="text-lg px-12 py-6">
            <Link to="/auth">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;