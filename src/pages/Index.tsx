import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Challenges from "@/components/Challenges";
import Leaderboard from "@/components/Leaderboard";
import About from "@/components/About";
import Resources from "@/components/Resources";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Sponsors from "@/components/Sponsors";
import Footer from "@/components/Footer";
import { initVisitorTracking } from "@/lib/visitorTracker";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SectionDivider = () => (
  <div className="relative h-px">
    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
      className="section-divider origin-center" />
  </div>
);

const Index = () => {
  const { settings } = useSiteSettings();
  const toggles = settings.feature_toggles;

  useEffect(() => {
    initVisitorTracking();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <SectionDivider />
      <Challenges />
      <SectionDivider />
      {toggles.leaderboard && (
        <>
          <Leaderboard />
          <SectionDivider />
        </>
      )}
      <About />
      <SectionDivider />
      <Resources />
      <SectionDivider />
      <FAQ />
      <SectionDivider />
      {toggles.contact_form && (
        <>
          <Contact />
          <SectionDivider />
        </>
      )}
      <Sponsors />
      <SectionDivider />
      <Footer />
    </div>
  );
};

export default Index;
