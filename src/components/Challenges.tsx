import { motion } from "framer-motion";
import { Globe, Lock, Binary, Search, Server, FileCode } from "lucide-react";
import ChallengeCard from "./ChallengeCard";

const challenges = [
  { title: "Web Exploitation", description: "XSS, SQL injection, CSRF, and more. Break into vulnerable web applications.", icon: Globe, difficulty: "Medium" as const, points: 500, solves: 234 },
  { title: "Cryptography", description: "Crack ciphers, break encryption, and decode hidden messages.", icon: Lock, difficulty: "Hard" as const, points: 750, solves: 89 },
  { title: "Reverse Engineering", description: "Analyze binaries, understand malware, and crack license checks.", icon: Binary, difficulty: "Insane" as const, points: 1000, solves: 23 },
  { title: "Forensics", description: "Investigate data breaches, recover deleted files, and analyze logs.", icon: Search, difficulty: "Easy" as const, points: 300, solves: 567 },
  { title: "Pwn", description: "Buffer overflows, ROP chains, and binary exploitation techniques.", icon: Server, difficulty: "Insane" as const, points: 1200, solves: 12 },
  { title: "Scripting", description: "Automate attacks, parse data, and solve programming puzzles.", icon: FileCode, difficulty: "Easy" as const, points: 250, solves: 892 },
];

const Challenges = () => (
  <section id="challenges" className="py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-dense opacity-15" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Challenge Categories
        </span>
        <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tight">
          Choose Your <span className="text-gradient">Battlefield</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          From beginner-friendly to expert-level challenges. Each category tests different skills in the cybersecurity domain.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge, index) => (
          <ChallengeCard key={challenge.title} {...challenge} index={index} />
        ))}
      </div>
    </div>
  </section>
);

export default Challenges;
