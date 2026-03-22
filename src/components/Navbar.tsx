import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";
import cyberopsLogo from "@/assets/cyberops-logo.png";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSiteSettings();
  const toggles = settings.feature_toggles;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Challenges", href: "#challenges" },
    { label: "Leaderboard", href: "#leaderboard" },
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "glass-strong border-b border-border/30 shadow-lg shadow-background/50" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative">
              <img src={cyberopsLogo} alt="CyberOps Logo" className="h-9 w-9 rounded-full ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--neon-green)/0.8)]" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-gradient">
              CyberOps
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="relative px-4 py-2 text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-hover:w-3/4 transition-all duration-300 rounded-full" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary/40 blur-sm group-hover:w-3/4 transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Terminal className="mr-2 h-4 w-4" />
                Login
              </Button>
            </a>
            {toggles.registration && (
              <a href="/signup">
                <Button variant="hero" size="sm" className="relative overflow-hidden group">
                  <span className="relative z-10">Join CTF</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative p-2 text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border/30"
            >
              <div className="py-4 space-y-1">
                {navItems.map((item, i) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="block py-3 px-4 rounded-lg text-sm font-mono uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <span className="text-primary mr-2">&gt;</span>
                    {item.label}
                  </motion.a>
                ))}
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/30 px-4">
                  <Button variant="ghost" size="sm" className="justify-start" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Terminal className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  {toggles.registration && (
                    <Button variant="hero" size="sm" asChild>
                      <Link to="/signup" onClick={() => setIsOpen(false)}>
                        Join CTF
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
