import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Privacy = () => {
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
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground">Last updated: January 2025</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                participate in challenges, submit flags, or contact us for support. This includes your 
                username, email address, country, and any other information you choose to provide.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>To provide, maintain, and improve our services</li>
                <li>To process and display leaderboard rankings</li>
                <li>To send you technical notices and support messages</li>
                <li>To communicate about competitions, updates, and security alerts</li>
                <li>To detect, prevent, and address cheating or abuse</li>
              </ul>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information only in the 
                following circumstances: with your consent, to comply with legal obligations, to protect 
                our rights, or with service providers who assist in operating our platform.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data. All passwords 
                are hashed, and sensitive data is encrypted in transit using TLS. However, no method 
                of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">5. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal information at any time 
                through your account settings. You may also contact us to request a copy of your data 
                or to exercise any other privacy rights.
              </p>
            </section>

            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">6. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@cyberops.io" className="text-primary hover:underline">
                  privacy@cyberops.io
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
