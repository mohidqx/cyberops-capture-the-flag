import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PageSection {
  title: string;
  content: string;
}

export interface PageContent {
  title: string;
  subtitle: string;
  sections: PageSection[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  title: string;
  subtitle: string;
  items: FaqItem[];
}

export const usePageContent = (pageKey: string) => {
  const [content, setContent] = useState<PageContent | FaqContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", pageKey)
        .maybeSingle();

      if (data?.value) {
        setContent(data.value as any);
      }
      setLoading(false);
    };
    fetch();
  }, [pageKey]);

  return { content, loading };
};
