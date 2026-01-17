import { motion } from "framer-motion";
import { Shield, ArrowLeft, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Rules = () => {
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
            <span className="inline-block px-4 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-xs font-mono uppercase tracking-widest text-neon-cyan mb-4">
              Competition
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Competition <span className="text-gradient">Rules</span>
            </h1>
            <p className="text-muted-foreground">Fair play for all participants</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {/* Allowed Section */}
            <section className="p-6 rounded-lg border border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h2 className="font-display text-xl font-bold text-foreground">Allowed</h2>
              </div>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Using any publicly available tools and resources</li>
                <li>Collaborating with teammates (team mode only)</li>
                <li>Taking notes and documenting your solutions</li>
                <li>Using search engines and online documentation</li>
                <li>Running tools locally on your own machine</li>
                <li>Writing custom scripts and exploits</li>
              </ul>
            </section>

            {/* Not Allowed Section */}
            <section className="p-6 rounded-lg border border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-6 w-6 text-red-500" />
                <h2 className="font-display text-xl font-bold text-foreground">Not Allowed</h2>
              </div>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Sharing flags or solutions with other teams/participants</li>
                <li>Attacking the CTF infrastructure or scoreboard</li>
                <li>Denial of service attacks against any systems</li>
                <li>Brute forcing flags without understanding the challenge</li>
                <li>Using multiple accounts to gain advantages</li>
                <li>Accessing other participants' accounts or solutions</li>
              </ul>
            </section>

            {/* Scoring Section */}
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Scoring System</h2>
              <ul className="text-muted-foreground space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">01</span>
                  <span>Points are awarded based on challenge difficulty and the number of solves</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">02</span>
                  <span>First blood bonuses may apply for being the first to solve a challenge</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">03</span>
                  <span>Hints may be purchased using earned points</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-mono text-sm mt-0.5">04</span>
                  <span>Dynamic scoring may reduce points as more teams solve a challenge</span>
                </li>
              </ul>
            </section>

            {/* Penalties Section */}
            <section className="p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h2 className="font-display text-xl font-bold text-foreground">Penalties</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Violations of these rules may result in point deductions, temporary suspension, 
                permanent disqualification, or banning from future competitions. Decisions by the 
                organizing committee are final.
              </p>
            </section>

            {/* Flag Format Section */}
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Flag Format</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Unless otherwise specified, flags follow this format:
              </p>
              <code className="block p-4 bg-surface-dark rounded-lg font-mono text-primary border border-primary/20">
                CyberOps{'{'}example_flag_here{'}'}
              </code>
            </section>

            {/* Questions Section */}
            <section className="p-6 rounded-lg border border-border bg-card/50">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Questions?</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about the rules, please contact us at{" "}
                <a href="mailto:ctf@cyberops.io" className="text-primary hover:underline">
                  ctf@cyberops.io
                </a>{" "}
                or reach out on our Discord server.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Rules;
