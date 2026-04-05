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
  { question: "What is a CTF competition?", answer: "CTF (Capture The Flag) is a cybersecurity competition where participants solve security-related challenges to find hidden 'flags' - secret strings that prove you've completed the challenge." },
  { question: "Do I need prior experience to participate?", answer: "Not at all! We offer challenges for all skill levels, from beginner-friendly puzzles to advanced exploits. Our resources section has learning materials to help you get started." },
  { question: "How do I submit a flag?", answer: "Once you solve a challenge, you'll find a flag in the format CTF{...}. Navigate to the challenge page, enter the exact flag string in the submission box, and click submit." },
  { question: "Can I participate as a team?", answer: "Yes! You can create or join a team to collaborate with other hackers. Team members share points on the team leaderboard while also earning individual rankings." },
  { question: "What challenge categories are available?", answer: "We offer Web Exploitation, Cryptography, Reverse Engineering, Binary Exploitation (PWN), Forensics, Scripting, and Miscellaneous categories." },
  { question: "Are there prizes for winners?", answer: "Competition prizes vary by event. Check the announcements section for details about current competition rewards." },
  { question: "What tools do I need?", answer: "Basic challenges can be solved with just a web browser. For advanced challenges, you might need Burp Suite, Ghidra, pwntools, or Wireshark." },
  { question: "Is there a time limit for challenges?", answer: "During live competitions, challenges are available until the event ends. After competition mode ends, challenges may remain available for practice." },
];

const FAQ = () => {
  const { content } = usePageContent("page_faq");
  const faqContent = content as FaqContent | null;
  const faqs = faqContent?.items?.length ? faqContent.items : defaultFaqs;
  const title = faqContent?.title || "Frequently Asked Questions";
  const subtitle = faqContent?.subtitle || "Everything you need to know about participating in CyberOps CTF competitions";

  return (
    <section id="faq" className="py-28 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-xs font-mono uppercase tracking-[0.2em] text-primary mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-black text-foreground mb-5 tracking-tight">
            {title.includes(" ") ? (
              <>{title.split(" ").slice(0, -1).join(" ")} <span className="text-gradient">{title.split(" ").slice(-1)}</span></>
            ) : (
              <span className="text-gradient">{title}</span>
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{subtitle}</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.5 }}
                viewport={{ once: true, margin: "-20px" }}
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
