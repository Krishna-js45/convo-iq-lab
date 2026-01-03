import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Sparkles, BarChart3, Zap } from "lucide-react";
import gptiqxIcon from "@/assets/gptiqx-icon.png";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartAnalyzing = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-black grid-pattern">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src={gptiqxIcon} alt="GPTIQX" className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0" />
            <span className="text-lg sm:text-xl font-bold text-white truncate">GPTIQX</span>
          </Link>
          {isLoggedIn ? (
            <Button size="sm" onClick={() => navigate("/dashboard")} className="text-xs sm:text-sm">
              Dashboard
            </Button>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="text-xs sm:text-sm">
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 bg-white/5 mb-6 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
            <span className="text-xs sm:text-sm text-white/80">AI Intelligence Measurement Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
            Measure Your
            <br />
            <span className="text-accent">Conversation IQ</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-white/60 mb-8 sm:mb-12 max-w-2xl mx-auto">
            Advanced analytics for AI conversations. Get precise UserIQ, GPTIQ, and ConversationIQ scores.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleStartAnalyzing}
              className="gap-2 glow-white w-full sm:w-auto"
            >
              Start Analyzing
              <ArrowRight className="h-4 w-4" />
            </Button>
            {isLoggedIn && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto"
              >
                View Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass p-6 sm:p-8 rounded-xl hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-white/20 transition-colors">
                <img src={gptiqxIcon} alt="UserIQ" className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">UserIQ</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Analyzes prompt clarity, reasoning depth, creative thinking, and engagement quality
              </p>
            </div>

            <div className="glass p-6 sm:p-8 rounded-xl hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-accent/30 transition-colors">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">GPTIQ</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Evaluates AI response accuracy, coherence, problem-solving ability, and creativity
              </p>
            </div>

            <div className="glass p-6 sm:p-8 rounded-xl hover:bg-white/10 transition-all group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-white/20 transition-colors">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">ConversationIQ</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Measures conversation flow, engagement balance, productivity, and synergy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Choose Your Plan
            </h2>
            <p className="text-white/60 text-base sm:text-lg">
              Start free or unlock unlimited analyses with Pro
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="glass p-8 rounded-2xl hover:bg-white/10 transition-all border border-white/10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-white/60">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>3 analyses per day</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>UserIQ, GPTIQ & ConversationIQ scores</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Conversation history</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">✓</span>
                  </div>
                  <span>Basic analytics</span>
                </li>
              </ul>

              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                Try Free
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="glass p-8 rounded-2xl hover:bg-white/10 transition-all border-2 border-accent/50 relative glow-accent">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent rounded-full">
                <span className="text-xs font-semibold text-black">POPULAR</span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$25</span>
                  <span className="text-white/60">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-accent">✓</span>
                  </div>
                  <span className="font-semibold text-white">Unlimited analyses</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-accent">✓</span>
                  </div>
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-accent">✓</span>
                  </div>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-accent">✓</span>
                  </div>
                  <span>Export to PDF & CSV</span>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-accent">✓</span>
                  </div>
                  <span>Custom branding options</span>
                </li>
              </ul>

              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="w-full glow-white"
              >
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center glass p-8 sm:p-12 rounded-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/60 text-base sm:text-lg mb-6 sm:mb-8">
            Join thousands of users measuring their conversation intelligence
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="glow-white w-full sm:w-auto">
            Create Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;