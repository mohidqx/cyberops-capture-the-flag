import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface Sponsor {
  name: string;
  logo: string;
  url: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
}

// Placeholder sponsors - in production, these would come from the database
const sponsors: Sponsor[] = [
  {
    name: "CyberDefense Corp",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop&auto=format",
    url: "#",
    tier: "platinum",
  },
  {
    name: "SecureNet Labs",
    logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=100&fit=crop&auto=format",
    url: "#",
    tier: "platinum",
  },
  {
    name: "HackShield Inc",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=100&fit=crop&auto=format",
    url: "#",
    tier: "gold",
  },
  {
    name: "CryptoGuard",
    logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=100&fit=crop&auto=format",
    url: "#",
    tier: "gold",
  },
  {
    name: "ByteSecure",
    logo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=100&fit=crop&auto=format",
    url: "#",
    tier: "silver",
  },
  {
    name: "FireWall Pro",
    logo: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=100&fit=crop&auto=format",
    url: "#",
    tier: "silver",
  },
];

const tierConfig = {
  platinum: {
    label: "Platinum Sponsors",
    size: "w-48 h-24",
    glow: "hover:shadow-[0_0_30px_rgba(0,255,170,0.3)]",
  },
  gold: {
    label: "Gold Sponsors",
    size: "w-40 h-20",
    glow: "hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]",
  },
  silver: {
    label: "Silver Sponsors",
    size: "w-32 h-16",
    glow: "hover:shadow-[0_0_15px_rgba(192,192,192,0.3)]",
  },
  bronze: {
    label: "Bronze Sponsors",
    size: "w-28 h-14",
    glow: "hover:shadow-[0_0_10px_rgba(205,127,50,0.3)]",
  },
};

const Sponsors = () => {
  const groupedSponsors = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) {
      acc[sponsor.tier] = [];
    }
    acc[sponsor.tier].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>);

  const tierOrder: Array<"platinum" | "gold" | "silver" | "bronze"> = [
    "platinum",
    "gold",
    "silver",
    "bronze",
  ];

  return (
    <section className="py-20 bg-card/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-neon-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Our Partners
            </span>
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powered by <span className="text-gradient">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            CyberOps is made possible by the generous support of our sponsors who share our passion for cybersecurity education.
          </p>
        </motion.div>

        <div className="space-y-12">
          {tierOrder.map((tier) => {
            const tierSponsors = groupedSponsors[tier];
            if (!tierSponsors || tierSponsors.length === 0) return null;

            const config = tierConfig[tier];

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
                  {config.label}
                </h3>
                <div className="flex flex-wrap justify-center items-center gap-6">
                  {tierSponsors.map((sponsor, index) => (
                    <motion.a
                      key={sponsor.name}
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`relative group ${config.size} rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden transition-all duration-300 ${config.glow}`}
                    >
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                        <span className="text-xs font-mono text-foreground flex items-center gap-1">
                          {sponsor.name}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Interested in sponsoring CyberOps?
          </p>
          <a
            href="mailto:sponsors@cyberops.io"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 bg-primary/10 text-primary font-mono text-sm hover:bg-primary/20 transition-colors"
          >
            Become a Sponsor
            <ExternalLink className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Sponsors;
