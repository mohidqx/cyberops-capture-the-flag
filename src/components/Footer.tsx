import { Shield, Github, Twitter, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold tracking-wider text-gradient">
              CyberOps Official
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
              Rules
            </a>
            <a href="#" className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition-all">
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            © 2025 CyberOps Official. Hack responsibly.{" "}
            <span className="text-primary animate-terminal-blink">▋</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
