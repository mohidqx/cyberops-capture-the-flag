import { motion } from "framer-motion";
import { ChevronRight, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer";
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Scanlines overlay */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 pt-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Terminal badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Season 2 Now Live
            </span>
          </motion.div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="text-foreground">Hack.</span>{" "}
            <span className="text-gradient glow-text animate-flicker">Learn.</span>{" "}
            <span className="text-foreground">Dominate.</span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join the elite ranks of{" "}
            <span className="text-primary font-semibold">CyberOps Official</span>.
            Test your skills across web exploitation, cryptography, reverse engineering, and forensics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                <Zap className="mr-2 h-5 w-5" />
                Start Hacking
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/login?redirect=/challenges">
                <Terminal className="mr-2 h-5 w-5" />
                View Challenges
              </Link>
            </Button>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-10"
          >
            <CountdownTimer />
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 pb-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: "2,847", label: "Active Hackers" },
              { value: "156", label: "Challenges" },
              { value: "$50K", label: "In Prizes" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Terminal decoration - moved outside container for better positioning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground z-10"
      >
        <span className="text-primary font-mono text-sm">root@cyberops:~$</span>
        <span className="font-mono text-sm">scroll_down</span>
        <span className="w-2 h-4 bg-primary animate-terminal-blink" />
      </motion.div>
    </section>
  );
};

export default Hero;
