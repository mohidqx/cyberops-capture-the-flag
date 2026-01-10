import { motion } from "framer-motion";
import { Shield, Users, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Real-World Scenarios",
    description: "Challenges based on actual vulnerabilities and attack vectors used by professionals.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Learn from peers, share writeups, and collaborate with hackers worldwide.",
  },
  {
    icon: Target,
    title: "Skill Progression",
    description: "Start from basics and advance to expert-level challenges at your own pace.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Real-time flag verification and hints to keep you moving forward.",
  },
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-surface-darker relative">
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-mono uppercase tracking-widest text-primary mb-4">
              About CyberOps
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              The Ultimate <span className="text-gradient">Hacking Arena</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              CyberOps Official is the premier platform for security enthusiasts to sharpen their skills. 
              Whether you're a beginner or a seasoned professional, our challenges will push your limits.
            </p>
          </motion.div>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg border border-border bg-card/50 text-center hover:border-primary/30 transition-colors group"
            >
              <div className="inline-flex p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4 group-hover:glow transition-all">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg">
              Join the Community
            </Button>
            <Button variant="neon" size="lg">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
