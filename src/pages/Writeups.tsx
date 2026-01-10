import DashboardLayout from "@/layouts/DashboardLayout";
import { motion } from "framer-motion";

const Writeups = () => (
  <DashboardLayout>
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Writeups</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">Share and learn from challenge solutions</p>
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground font-mono">No writeups yet. Complete challenges to share your solutions!</p>
        </div>
      </motion.div>
    </div>
  </DashboardLayout>
);

export default Writeups;
