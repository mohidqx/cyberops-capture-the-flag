import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageContent, PageContent } from "@/hooks/usePageContent";

const Privacy = () => {
  const { content } = usePageContent("page_privacy");
  const page = content as PageContent | null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <Shield className="h-8 w-8 text-primary glow-text" />
              <span className="font-display text-xl font-bold tracking-wider text-gradient">CyberOps</span>
            </Link>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-mono uppercase tracking-widest text-primary mb-4">Legal</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground">{page?.subtitle || "Last updated: March 2026"}</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            {page?.sections?.length ? (
              page.sections.map((section, i) => (
                <section key={i} className="p-6 rounded-lg border border-border bg-card/50">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{section.content}</p>
                </section>
              ))
            ) : (
              <>
                <section className="p-6 rounded-lg border border-border bg-card/50">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">1. Information We Collect</h2>
                  <p className="text-muted-foreground leading-relaxed">We collect information you provide directly to us when you create an account or participate in competitions.</p>
                </section>
                <section className="p-6 rounded-lg border border-border bg-card/50">
                  <h2 className="font-display text-xl font-bold text-foreground mb-4">2. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">We implement appropriate security measures to protect your personal information.</p>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;
