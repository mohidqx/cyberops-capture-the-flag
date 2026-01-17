import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Terms = () => {
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
              Legal
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using CyberOps Official, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, you may not access or use our services.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">2. Account Registration</h2>
              <p className="text-muted-foreground leading-relaxed">
                You must provide accurate and complete information when creating an account. You are 
                responsible for maintaining the security of your account credentials and for all 
                activities that occur under your account.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">3. Acceptable Use</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Only attack designated challenge infrastructure</li>
                <li>Do not share flags or solutions with other participants</li>
                <li>Do not attempt to disrupt the platform or other users</li>
                <li>Do not use automated tools to gain unfair advantages</li>
                <li>Respect intellectual property rights</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">4. Prohibited Activities</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to engage in denial of service attacks, unauthorized access attempts 
                against non-challenge systems, distribution of malware, or any other activity that 
                violates applicable laws or regulations.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">5. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations 
                of these terms, cheating, or any behavior we deem harmful to the community. Points 
                and rankings may be revoked in cases of rule violations.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">6. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                CyberOps Official is provided "as is" without warranties of any kind. We do not 
                guarantee uninterrupted access to our services. We are not responsible for any 
                damages arising from your use of the platform.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">7. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@cyberops.io" className="text-primary hover:underline">
                  legal@cyberops.io
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Terms;
