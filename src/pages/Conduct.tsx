import { motion } from "framer-motion";
import { Shield, ArrowLeft, Heart, Users, MessageSquare, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Conduct = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <Shield className="h-8 w-8 text-primary glow-text" />
              <span className="font-display text-xl font-bold tracking-wider text-gradient">
                CyberOps
              </span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-mono uppercase tracking-widest text-primary mb-4">
              Community
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Code of <span className="text-gradient">Conduct</span>
            </h1>
            <p className="text-muted-foreground">Building a respectful hacking community</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Our Pledge */}
            <section className="p-6 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">Our Pledge</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We as members, contributors, and leaders pledge to make participation in our community 
                a harassment-free experience for everyone, regardless of age, body size, visible or 
                invisible disability, ethnicity, sex characteristics, gender identity and expression, 
                level of experience, education, socio-economic status, nationality, personal appearance, 
                race, religion, or sexual identity and orientation.
              </p>
            </section>

            {/* Expected Behavior */}
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-neon-cyan" />
                <h2 className="font-display text-xl font-bold text-foreground">Expected Behavior</h2>
              </div>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Be respectful and inclusive in all interactions</li>
                <li>Give constructive feedback when helping others</li>
                <li>Accept responsibility for mistakes and learn from them</li>
                <li>Focus on what is best for the overall community</li>
                <li>Show empathy and kindness toward other community members</li>
                <li>Respect differing viewpoints and experiences</li>
              </ul>
            </section>

            {/* Communication Guidelines */}
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">Communication Guidelines</h2>
              </div>
              <ul className="text-muted-foreground space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">→</span>
                  <span>Use welcoming and inclusive language</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">→</span>
                  <span>Be patient with beginners and those still learning</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">→</span>
                  <span>Keep discussions on-topic and productive</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">→</span>
                  <span>Avoid spoilers—use hint systems instead of revealing solutions</span>
                </li>
              </ul>
            </section>

            {/* Unacceptable Behavior */}
            <section className="p-6 rounded-lg border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Ban className="h-6 w-6 text-red-500" />
                <h2 className="font-display text-xl font-bold text-foreground">Unacceptable Behavior</h2>
              </div>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Harassment, discrimination, or hate speech of any kind</li>
                <li>Sexual or violent content and unwelcome advances</li>
                <li>Personal attacks, trolling, or insulting comments</li>
                <li>Publishing others' private information without consent</li>
                <li>Deliberate intimidation or stalking behavior</li>
                <li>Advocating for or encouraging any of the above</li>
              </ul>
            </section>

            {/* Enforcement */}
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Enforcement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Community leaders are responsible for clarifying and enforcing our standards of 
                acceptable behavior and will take appropriate and fair corrective action in response 
                to any behavior that they deem inappropriate, threatening, offensive, or harmful.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Instances of abusive, harassing, or otherwise unacceptable behavior may be reported 
                to the community leaders responsible for enforcement at{" "}
                <a href="mailto:conduct@cyberops.io" className="text-primary hover:underline">
                  conduct@cyberops.io
                </a>
                . All complaints will be reviewed and investigated promptly and fairly.
              </p>
            </section>

            {/* Attribution */}
            <section className="p-6 rounded-lg border border-border/50 bg-card/30">
              <h2 className="font-display text-lg font-bold text-foreground mb-2">Attribution</h2>
              <p className="text-sm text-muted-foreground">
                This Code of Conduct is adapted from the Contributor Covenant, version 2.1.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Conduct;
