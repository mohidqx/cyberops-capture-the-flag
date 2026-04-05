import { motion } from "framer-motion";
import { BookOpen, Terminal, Shield, Code, ExternalLink, Zap, Database, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const resources = [
  { title: "Web Exploitation", description: "Learn SQL injection, XSS, CSRF, and modern web vulnerabilities", icon: Code, links: [{ name: "PortSwigger Academy", url: "https://portswigger.net/web-security" }, { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" }], difficulty: "Beginner" },
  { title: "Cryptography", description: "Master encryption, hashing, and cryptanalysis techniques", icon: Lock, links: [{ name: "CryptoHack", url: "https://cryptohack.org/" }, { name: "Crypto101", url: "https://www.crypto101.io/" }], difficulty: "Intermediate" },
  { title: "Reverse Engineering", description: "Analyze binaries, understand assembly, and crack software", icon: Terminal, links: [{ name: "Nightmare", url: "https://guyinatuxedo.github.io/" }, { name: "Crackmes.one", url: "https://crackmes.one/" }], difficulty: "Advanced" },
  { title: "Binary Exploitation", description: "Buffer overflows, ROP chains, and memory corruption", icon: Zap, links: [{ name: "pwn.college", url: "https://pwn.college/" }, { name: "ROP Emporium", url: "https://ropemporium.com/" }], difficulty: "Advanced" },
  { title: "Forensics", description: "File analysis, memory forensics, and data recovery", icon: Database, links: [{ name: "DFIR Training", url: "https://www.dfir.training/" }, { name: "Autopsy", url: "https://www.autopsy.com/support/training/" }], difficulty: "Intermediate" },
  { title: "General CTF Practice", description: "All-in-one platforms to sharpen your hacking skills", icon: Shield, links: [{ name: "PicoCTF", url: "https://picoctf.org/" }, { name: "HackTheBox", url: "https://www.hackthebox.com/" }], difficulty: "All Levels" },
];

const getDifficultyStyle = (d: string) => {
  switch (d) {
    case "Beginner": return "bg-primary/15 text-primary border-primary/30";
    case "Intermediate": return "bg-secondary/15 text-secondary border-secondary/30";
    case "Advanced": return "bg-destructive/15 text-destructive border-destructive/30";
    default: return "bg-neon-purple/15 text-neon-purple border-neon-purple/30";
  }
};

const Resources = () => (
  <section id="resources" className="py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-10" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6">
          <BookOpen className="w-3.5 h-3.5" />
          Learning Resources
        </span>
        <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tight">
          Level Up Your <span className="text-gradient">Skills</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Curated resources to help you master cybersecurity concepts and dominate CTF competitions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
            viewport={{ once: true, margin: "-40px" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="glass-card rounded-xl overflow-hidden group"
          >
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <resource.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className={`text-[10px] font-mono tracking-wider ${getDifficultyStyle(resource.difficulty)}`}>
                  {resource.difficulty}
                </Badge>
              </div>
              <h3 className="text-lg font-display font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
            </div>
            <div className="px-6 pb-6 space-y-2">
              {resource.links.map((link, li) => (
                <a
                  key={li}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-border/20 hover:border-primary/30 hover:bg-primary/5 transition-all group/link"
                >
                  <span className="text-sm text-muted-foreground group-hover/link:text-foreground transition-colors">{link.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover/link:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Resources;
