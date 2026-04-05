import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, Terminal, Zap, Shield, Cpu, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import CountdownTimer from "./CountdownTimer";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const Hero = () => {
  const [stats, setStats] = useState({ activeHackers: 0, challenges: 0, prizes: "$50K" });
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: hackersCount }, { count: challengesCount }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("challenges_public").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);
      setStats({ activeHackers: hackersCount || 0, challenges: challengesCount || 0, prizes: "$50K" });
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Static background — no JS animation */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'hsl(var(--neon-cyan) / 0.06)' }} />

      {/* Floating grid icons — CSS only */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { Icon: Shield, x: "10%", y: "20%" },
          { Icon: Cpu, x: "85%", y: "15%" },
          { Icon: Lock, x: "80%", y: "70%" },
          { Icon: Terminal, x: "15%", y: "75%" },
        ].map(({ Icon, x, y }, i) => (
          <div key={i} className="absolute animate-pulse opacity-[0.08]" style={{ left: x, top: y }}>
            <Icon size={20} className="text-primary" />
          </div>
        ))}
      </div>

      <motion.div
        className="container mx-auto px-4 pt-20 relative z-10"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Season 2 Now Live</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-6 leading-[1.1] tracking-tight">
            <span className="text-foreground">Hack.</span>{" "}
            <span className="text-gradient glow-text">Learn.</span>{" "}
            <span className="text-foreground">Dominate.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Join the elite ranks of <span className="text-primary font-semibold">CyberOps Official</span>.
            Test your skills across web exploitation, cryptography, reverse engineering, and forensics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild className="relative group">
              <Link to="/signup">
                <Zap className="mr-2 h-5 w-5" />
                Start Hacking
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild className="relative group overflow-hidden">
              <Link to="/login?redirect=/challenges">
                <span className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <Terminal className="mr-2 h-5 w-5 relative z-10" />
                <span className="relative z-10">View Challenges</span>
              </Link>
            </Button>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div variants={fadeUp} className="mt-12">
            <CountdownTimer />
          </motion.div>

          {/* Stats */}
          <motion.div variants={stagger} className="mt-16 pb-20 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl p-5 text-center">
                  <Skeleton className="h-10 w-20 mx-auto mb-2 bg-primary/10" />
                  <Skeleton className="h-4 w-24 mx-auto bg-muted/20" />
                </div>
              ))
            ) : (
              [
                { value: stats.activeHackers.toLocaleString(), label: "Active Hackers", color: "text-primary" },
                { value: stats.challenges.toLocaleString(), label: "Challenges", color: "text-neon-cyan" },
                { value: stats.prizes, label: "In Prizes", color: "text-neon-purple" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  whileHover={{ scale: 1.06, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-card rounded-xl p-5 text-center cursor-default"
                >
                  <div className={`font-display text-3xl md:text-4xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[10px] md:text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground mt-2">{stat.label}</div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Terminal decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground z-10"
      >
        <span className="text-primary font-mono text-sm">root@cyberops:~$</span>
        <span className="font-mono text-sm">scroll_down</span>
        <span className="w-2 h-4 bg-primary animate-terminal-blink" />
      </motion.div>
    </section>
  );
};

export default Hero;
