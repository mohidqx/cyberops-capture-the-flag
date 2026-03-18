import { useState, useEffect } from "react";
import { FileText, Save, RotateCcw, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { C2Panel } from "./C2Shared";

interface PageSection {
  title: string;
  content: string;
}

interface PageContent {
  title: string;
  subtitle: string;
  sections: PageSection[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqContent {
  title: string;
  subtitle: string;
  items: FaqItem[];
}

const DEFAULT_PAGES: Record<string, PageContent> = {
  page_rules: {
    title: "Competition Rules",
    subtitle: "Fair play for all participants",
    sections: [
      { title: "Allowed Activities", content: "Participants may use any tools or techniques to solve challenges. Collaboration within your registered team is encouraged. Searching online for general knowledge and techniques is permitted." },
      { title: "Prohibited Activities", content: "Attacking the competition infrastructure. Sharing flags or solutions with other teams. Using automated brute-force attacks against the scoring system. Any form of denial-of-service attack." },
      { title: "Scoring", content: "Points are awarded for correct flag submissions. First blood bonus may apply. Hints may be purchased with points." },
    ],
  },
  page_privacy: {
    title: "Privacy Policy",
    subtitle: "Last updated: March 2026",
    sections: [
      { title: "Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, participate in competitions, or contact us." },
      { title: "How We Use Information", content: "We use the information we collect to provide, maintain, and improve our services, and to communicate with you." },
      { title: "Data Security", content: "We implement appropriate security measures to protect your personal information." },
    ],
  },
  page_terms: {
    title: "Terms of Service",
    subtitle: "Last updated: March 2026",
    sections: [
      { title: "Acceptance of Terms", content: "By accessing or using CyberOps, you agree to be bound by these Terms of Service." },
      { title: "User Accounts", content: "You are responsible for maintaining the security of your account and password." },
      { title: "Acceptable Use", content: "You agree not to misuse the platform or help anyone else do so." },
    ],
  },
  page_conduct: {
    title: "Code of Conduct",
    subtitle: "Building a respectful hacking community",
    sections: [
      { title: "Our Pledge", content: "We pledge to make participation in our community a harassment-free experience for everyone." },
      { title: "Expected Behavior", content: "Be respectful, constructive, and supportive of fellow participants." },
      { title: "Unacceptable Behavior", content: "Harassment, discrimination, or any form of abuse will not be tolerated." },
    ],
  },
};

const DEFAULT_FAQ: FaqContent = {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know about participating in CyberOps CTF",
  items: [
    { question: "What is a CTF competition?", answer: "CTF (Capture The Flag) is a cybersecurity competition where participants solve security-related challenges to find hidden 'flags'." },
    { question: "Do I need prior experience?", answer: "Not at all! We offer challenges for all skill levels." },
    { question: "How do I submit a flag?", answer: "Navigate to the challenge page, enter the exact flag string, and click submit." },
    { question: "Can I participate as a team?", answer: "Yes! You can create or join a team to collaborate with other hackers." },
  ],
};

export const ContentManagementModule = () => {
  const [activeTab, setActiveTab] = useState("page_faq");
  const [pages, setPages] = useState<Record<string, PageContent>>(DEFAULT_PAGES);
  const [faq, setFaq] = useState<FaqContent>(DEFAULT_FAQ);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["page_faq", "page_rules", "page_privacy", "page_terms", "page_conduct"]);

    if (data) {
      const updated = { ...DEFAULT_PAGES };
      data.forEach((row: any) => {
        if (row.key === "page_faq") {
          setFaq({ ...DEFAULT_FAQ, ...(row.value as any) });
        } else if (updated[row.key]) {
          updated[row.key] = { ...updated[row.key], ...(row.value as any) };
        }
      });
      setPages(updated);
    }
  };

  const saveContent = async (key: string, value: any) => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Content saved successfully");
    }
    setSaving(false);
  };

  const updatePageSection = (pageKey: string, sectionIndex: number, field: "title" | "content", value: string) => {
    setPages(prev => {
      const updated = { ...prev };
      const page = { ...updated[pageKey] };
      const sections = [...page.sections];
      sections[sectionIndex] = { ...sections[sectionIndex], [field]: value };
      page.sections = sections;
      updated[pageKey] = page;
      return updated;
    });
  };

  const addPageSection = (pageKey: string) => {
    setPages(prev => {
      const updated = { ...prev };
      const page = { ...updated[pageKey] };
      page.sections = [...page.sections, { title: "New Section", content: "Enter content here..." }];
      updated[pageKey] = page;
      return updated;
    });
  };

  const removePageSection = (pageKey: string, index: number) => {
    setPages(prev => {
      const updated = { ...prev };
      const page = { ...updated[pageKey] };
      page.sections = page.sections.filter((_, i) => i !== index);
      updated[pageKey] = page;
      return updated;
    });
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    setFaq(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addFaqItem = () => {
    setFaq(prev => ({
      ...prev,
      items: [...prev.items, { question: "New Question?", answer: "Answer here..." }],
    }));
  };

  const removeFaqItem = (index: number) => {
    setFaq(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const PAGE_TABS = [
    { key: "page_faq", label: "FAQ" },
    { key: "page_rules", label: "Rules" },
    { key: "page_terms", label: "Terms" },
    { key: "page_privacy", label: "Privacy" },
    { key: "page_conduct", label: "Conduct" },
  ];

  return (
    <C2Panel title="CONTENT MANAGEMENT" icon={FileText} color="text-neon-cyan">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-card/50 border border-border/30">
            {PAGE_TABS.map(t => (
              <TabsTrigger key={t.key} value={t.key} className="text-[10px] font-mono uppercase">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreview(!preview)}
            className="text-[10px] font-mono uppercase gap-1"
          >
            {preview ? <Edit className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {preview ? "Edit" : "Preview"}
          </Button>
        </div>

        {/* FAQ Tab */}
        <TabsContent value="page_faq" className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Title</Label>
              <Input
                value={faq.title}
                onChange={e => setFaq(prev => ({ ...prev, title: e.target.value }))}
                className="h-8 text-xs font-mono bg-card/50 border-border/30"
              />
            </div>
            <div>
              <Label className="text-[10px] font-mono uppercase text-muted-foreground">Subtitle</Label>
              <Input
                value={faq.subtitle}
                onChange={e => setFaq(prev => ({ ...prev, subtitle: e.target.value }))}
                className="h-8 text-xs font-mono bg-card/50 border-border/30"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {faq.items.map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/30 bg-card/30 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[9px] font-mono">Q{i + 1}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => removeFaqItem(i)} className="h-5 w-5 p-0 text-destructive/60 hover:text-destructive">×</Button>
                </div>
                <Input
                  value={item.question}
                  onChange={e => updateFaqItem(i, "question", e.target.value)}
                  placeholder="Question"
                  className="h-7 text-xs font-mono bg-background/50 border-border/20"
                />
                <Textarea
                  value={item.answer}
                  onChange={e => updateFaqItem(i, "answer", e.target.value)}
                  placeholder="Answer"
                  rows={2}
                  className="text-xs font-mono bg-background/50 border-border/20 resize-none"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addFaqItem} className="text-[10px] font-mono uppercase">
              + Add Question
            </Button>
            <Button size="sm" onClick={() => saveContent("page_faq", faq)} disabled={saving} className="text-[10px] font-mono uppercase gap-1 ml-auto">
              <Save className="w-3 h-3" />
              {saving ? "Saving..." : "Save FAQ"}
            </Button>
          </div>
        </TabsContent>

        {/* Page Tabs (Rules, Terms, Privacy, Conduct) */}
        {PAGE_TABS.filter(t => t.key !== "page_faq").map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Page Title</Label>
                <Input
                  value={pages[tab.key]?.title || ""}
                  onChange={e => setPages(prev => ({ ...prev, [tab.key]: { ...prev[tab.key], title: e.target.value } }))}
                  className="h-8 text-xs font-mono bg-card/50 border-border/30"
                />
              </div>
              <div>
                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Subtitle</Label>
                <Input
                  value={pages[tab.key]?.subtitle || ""}
                  onChange={e => setPages(prev => ({ ...prev, [tab.key]: { ...prev[tab.key], subtitle: e.target.value } }))}
                  className="h-8 text-xs font-mono bg-card/50 border-border/30"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {pages[tab.key]?.sections.map((section, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/30 bg-card/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] font-mono">Section {i + 1}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => removePageSection(tab.key, i)} className="h-5 w-5 p-0 text-destructive/60 hover:text-destructive">×</Button>
                  </div>
                  <Input
                    value={section.title}
                    onChange={e => updatePageSection(tab.key, i, "title", e.target.value)}
                    placeholder="Section title"
                    className="h-7 text-xs font-mono bg-background/50 border-border/20"
                  />
                  <Textarea
                    value={section.content}
                    onChange={e => updatePageSection(tab.key, i, "content", e.target.value)}
                    placeholder="Section content"
                    rows={3}
                    className="text-xs font-mono bg-background/50 border-border/20 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addPageSection(tab.key)} className="text-[10px] font-mono uppercase">
                + Add Section
              </Button>
              <Button
                size="sm"
                onClick={() => saveContent(tab.key, pages[tab.key])}
                disabled={saving}
                className="text-[10px] font-mono uppercase gap-1 ml-auto"
              >
                <Save className="w-3 h-3" />
                {saving ? "Saving..." : `Save ${tab.label}`}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </C2Panel>
  );
};
