import { motion } from "framer-motion";
import { Shield, Users, Target, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Shield, title: "Real-World Scenarios", description: "Challenges based on actual vulnerabilities and attack vectors used by professionals.", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { icon: Users, title: "Community Driven", description: "Learn from peers, share writeups, and collaborate with hackers worldwide.", color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
  { icon: Target, title: "Skill Progression", description: "Start from basics and advance to expert-level challenges at your own pace.", color: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { icon: Zap, title: "Instant Feedback", description: "Real-time flag verification and hints to keep you moving forward.", color: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/20" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const About = () => (
  <section id="about" className="py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-10" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-center max-w-3xl mx-auto mb-20"
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          About CyberOps
        </span>
        <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
          The Ultimate <span className="text-gradient">Hacking Arena</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          CyberOps Official is the premier platform for security enthusiasts to sharpen their skills.
          Whether you're a beginner or a seasoned professional, our challenges will push your limits.
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="glass-card rounded-xl p-7 text-center group cursor-default"
          >
            <div className={`inline-flex p-4 rounded-xl ${feature.bg} border ${feature.border} mb-5`}>
              <feature.icon className={`h-7 w-7 ${feature.color}`} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-3">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <div className="inline-flex flex-col sm:flex-row gap-4">
          <Button variant="hero" size="lg" className="group">
            Join the Community
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="neon" size="lg">Learn More</Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default About;
