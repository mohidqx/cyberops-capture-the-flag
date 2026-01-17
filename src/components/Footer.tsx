import { useState } from "react";
import { Shield, Github, Twitter, MessageCircle, Send, Linkedin, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email });

    if (error) {
      if (error.code === "23505") {
        toast.error("You're already subscribed!");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } else {
      toast.success("Welcome to the CyberOps newsletter!");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <footer className="py-16 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center mb-12 pb-12 border-b border-border">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Stay in the Loop
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Get notified about new challenges, competitions, and cybersecurity tips.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hacker@example.com"
              className="bg-input border-border flex-1"
              required
            />
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold tracking-wider text-gradient">
                CyberOps Official
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The premier CTF platform for aspiring hackers and security professionals. 
              Test your skills, learn new techniques, and compete with the best.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/challenges" className="text-sm text-foreground hover:text-primary transition-colors">
                  Challenges
                </a>
              </li>
              <li>
                <a href="/leaderboard" className="text-sm text-foreground hover:text-primary transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="/writeups" className="text-sm text-foreground hover:text-primary transition-colors">
                  Writeups
                </a>
              </li>
              <li>
                <a href="/teams" className="text-sm text-foreground hover:text-primary transition-colors">
                  Teams
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/rules" className="text-sm text-foreground hover:text-primary transition-colors">
                  Competition Rules
                </Link>
              </li>
              <li>
                <Link to="/conduct" className="text-sm text-foreground hover:text-primary transition-colors">
                  Code of Conduct
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
          <p className="text-xs font-mono text-muted-foreground">
            © 2025 CyberOps Official. Hack responsibly.{" "}
            <span className="text-primary animate-terminal-blink">▋</span>
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all"
              aria-label="Discord"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
