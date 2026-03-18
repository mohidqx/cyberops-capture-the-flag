import { motion } from "framer-motion";
import { HelpCircle, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageContent, FaqContent } from "@/hooks/usePageContent";

const defaultFaqs = [
  { question: "What is a CTF competition?", answer: "CTF (Capture The Flag) is a cybersecurity competition where participants solve security-related challenges to find hidden 'flags' - secret strings that prove you've completed the challenge. It's a hands-on way to learn and practice hacking skills in a legal environment." },
  { question: "Do I need prior experience to participate?", answer: "Not at all! We offer challenges for all skill levels, from beginner-friendly puzzles to advanced exploits. Our resources section has learning materials to help you get started, and our community is welcoming to newcomers." },
  { question: "How do I submit a flag?", answer: "Once you solve a challenge, you'll find a flag in the format CTF{...}. Navigate to the challenge page, enter the exact flag string in the submission box, and click submit. Points are awarded instantly for correct submissions." },
  { question: "Can I participate as a team?", answer: "Yes! You can create or join a team to collaborate with other hackers. Team members share points on the team leaderboard while also earning individual rankings. Team captains can manage members and invite codes." },
  { question: "What challenge categories are available?", answer: "We offer challenges across multiple categories: Web Exploitation, Cryptography, Reverse Engineering, Binary Exploitation (PWN), Forensics, Scripting, and Miscellaneous. Each category tests different security skills." },
  { question: "Are there prizes for winners?", answer: "Competition prizes vary by event. Check the announcements section for details about current competition rewards, which may include cash prizes, hardware, subscriptions to security tools, or other cybersecurity swag." },
  { question: "What tools do I need?", answer: "Basic challenges can be solved with just a web browser and text editor. For more advanced challenges, you might need tools like Burp Suite, Ghidra, pwntools, or Wireshark. We recommend a Linux environment (like Kali or Parrot OS) for the best experience." },
  { question: "Is there a time limit for challenges?", answer: "During live competitions, challenges are available until the event ends. After competition mode ends, challenges may remain available for practice. Check the countdown timer and announcements for specific event timings." },
];

const FAQ = () => {
  const { content } = usePageContent("page_faq");
  const faqContent = content as FaqContent | null;
  const faqs = faqContent?.items?.length ? faqContent.items : defaultFaqs;
  const title = faqContent?.title || "Frequently Asked Questions";
  const subtitle = faqContent?.subtitle || "Everything you need to know about participating in CyberOps CTF competitions";

const FAQ = () => {
  return (
    <section id="faq" className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.4) 0%, transparent 50%)` }} />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tight">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything you need to know about participating in CyberOps CTF competitions
            </p>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="glass-card rounded-xl px-6 data-[state=open]:border-primary/30 transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-mono text-foreground hover:text-primary hover:no-underline py-5 text-sm">
                    <span className="flex items-center gap-4">
                      <span className="text-primary/60 font-display text-xs font-bold min-w-[24px]">{String(index + 1).padStart(2, '0')}</span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 pl-10 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-3">
            <MessageCircle className="w-4 h-4 text-primary" />
            <p className="text-muted-foreground text-sm font-mono">
              Still have questions?{" "}
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Join our Discord
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
