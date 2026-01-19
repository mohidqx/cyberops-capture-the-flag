import { BookOpen, Terminal, Shield, Code, ExternalLink, Zap, Database, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const resources = [
  {
    title: "Web Exploitation",
    description: "Learn SQL injection, XSS, CSRF, and modern web vulnerabilities",
    icon: Code,
    links: [
      { name: "PortSwigger Academy", url: "https://portswigger.net/web-security" },
      { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
    ],
    difficulty: "Beginner",
  },
  {
    title: "Cryptography",
    description: "Master encryption, hashing, and cryptanalysis techniques",
    icon: Lock,
    links: [
      { name: "CryptoHack", url: "https://cryptohack.org/" },
      { name: "Crypto101", url: "https://www.crypto101.io/" },
    ],
    difficulty: "Intermediate",
  },
  {
    title: "Reverse Engineering",
    description: "Analyze binaries, understand assembly, and crack software",
    icon: Terminal,
    links: [
      { name: "Nightmare", url: "https://guyinatuxedo.github.io/" },
      { name: "Crackmes.one", url: "https://crackmes.one/" },
    ],
    difficulty: "Advanced",
  },
  {
    title: "Binary Exploitation",
    description: "Buffer overflows, ROP chains, and memory corruption",
    icon: Zap,
    links: [
      { name: "pwn.college", url: "https://pwn.college/" },
      { name: "ROP Emporium", url: "https://ropemporium.com/" },
    ],
    difficulty: "Advanced",
  },
  {
    title: "Forensics",
    description: "File analysis, memory forensics, and data recovery",
    icon: Database,
    links: [
      { name: "DFIR Training", url: "https://www.dfir.training/" },
      { name: "Autopsy", url: "https://www.autopsy.com/support/training/" },
    ],
    difficulty: "Intermediate",
  },
  {
    title: "General CTF Practice",
    description: "All-in-one platforms to sharpen your hacking skills",
    icon: Shield,
    links: [
      { name: "PicoCTF", url: "https://picoctf.org/" },
      { name: "HackTheBox", url: "https://www.hackthebox.com/" },
    ],
    difficulty: "All Levels",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Intermediate":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Advanced":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-primary/20 text-primary border-primary/30";
  }
};

const Resources = () => {
  return (
    <section id="resources" className="py-20 px-4 bg-background relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">LEARNING_RESOURCES</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-foreground mb-4">
            Level Up Your <span className="text-primary">Skills</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated resources to help you master cybersecurity concepts and dominate CTF competitions
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <Card 
              key={index} 
              className="bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 group backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 group-hover:bg-primary/20 transition-colors">
                    <resource.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
                    {resource.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-mono text-foreground group-hover:text-primary transition-colors">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {resource.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all group/link"
                    >
                      <span className="text-sm text-muted-foreground group-hover/link:text-foreground transition-colors">
                        {link.name}
                      </span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover/link:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm font-mono">
            <span className="text-primary">$</span> Ready to test your skills? Join our next competition!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Resources;
