import { Shield, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface MaintenanceProps {
  message?: string;
}

const Maintenance = ({ message }: MaintenanceProps) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg w-full text-center space-y-6"
    >
      <div className="relative mx-auto w-20 h-20">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <Wrench className="w-20 h-20 text-primary/30" />
        </motion.div>
        <Shield className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div>
        <h1 className="font-display text-3xl font-black text-foreground mb-2">
          Under Maintenance
        </h1>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">
          {message || "We're performing scheduled maintenance. We'll be back online shortly."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
        <div className="w-2 h-2 rounded-full bg-neon-orange animate-pulse" />
        <span>Systems updating</span>
      </div>
    </motion.div>
  </div>
);

export default Maintenance;
