import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Users, Target, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const features = [
  { icon: Shield, title: "Real-World Scenarios", description: "Challenges based on actual vulnerabilities and attack vectors used by professionals.", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { icon: Users, title: "Community Driven", description: "Learn from peers, share writeups, and collaborate with hackers worldwide.", color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
  { icon: Target, title: "Skill Progression", description: "Start from basics and advance to expert-level challenges at your own pace.", color: "text-neon-purple", bg: "bg-neon-purple/10", border: "border-neon-purple/20" },
  { icon: Zap, title: "Instant Feedback", description: "Real-time flag verification and hints to keep you moving forward.", color: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/20" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -15 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }
};

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const orbX = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const orbY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={sectionRef} id="about" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <motion.div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-neon-purple/3 rounded-full blur-[150px]" style={{ x: orbX, y: orbY }} />
      <motion.div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-neon-cyan/3 rounded-full blur-[120px]" style={{ x: useTransform(scrollYProgress, [0, 1], [100, -100]) }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-100px" }}>
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
        </div>

        <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
          variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}
              className="glass-card rounded-xl p-7 text-center group cursor-default">
              <motion.div whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }}
                className={`inline-flex p-4 rounded-xl ${feature.bg} border ${feature.border} mb-5 transition-all`}>
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </motion.div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}
          className="text-center">
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
};

export default About;
