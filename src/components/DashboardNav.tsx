import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, LayoutDashboard, Target, Trophy, Users, FileText, Settings,
  LogOut, ShieldCheck, Menu, X, Layers, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DashboardNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Challenges", href: "/challenges", icon: Target },
    { label: "Categories", href: "/categories", icon: Layers },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Teams", href: "/teams", icon: Users },
    { label: "Writeups", href: "/writeups", icon: FileText },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const adminItems = [
    { label: "Admin Panel", href: "/admin", icon: ShieldCheck },
  ];

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.href || (item.href === '/admin' && location.pathname.startsWith('/admin'));
    const isAdminLink = item.href === '/admin';
    
    return (
      <Link
        to={item.href}
        className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono uppercase tracking-wider transition-all duration-300 ${
          isActive
            ? isAdminLink
              ? "glass text-secondary border border-secondary/20 shadow-[0_0_15px_hsl(var(--neon-cyan)/0.1)]"
              : "glass text-primary border border-primary/20 shadow-[0_0_15px_hsl(var(--neon-green)/0.1)]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${isAdminLink ? 'bg-secondary' : 'bg-primary'}`}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <item.icon className={`h-4.5 w-4.5 transition-all ${isActive ? '' : 'group-hover:scale-110'}`} />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border/30 glass-strong">
        <div className="p-6 border-b border-border/20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary transition-all group-hover:drop-shadow-[0_0_8px_hsl(var(--neon-green)/0.8)]" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-gradient">
              CyberOps
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {isAdmin && (
            <>
              <div className="pt-5 pb-2">
                <div className="flex items-center gap-2 px-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-secondary/60">Admin</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-secondary/30 via-transparent to-transparent" />
                </div>
              </div>
              {adminItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border/20">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 glass-card rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
              {profile?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-semibold truncate text-foreground">
                {profile?.username || "Anonymous"}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {profile?.total_points || 0} pts
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 glass-strong border-b border-border/30 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold tracking-wider text-gradient">CyberOps</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-primary">
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Menu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 pt-16 bg-background/95 backdrop-blur-xl"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono uppercase tracking-wider ${
                      location.pathname === item.href
                        ? "glass text-primary border border-primary/20"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {isAdmin && adminItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono uppercase tracking-wider ${
                    location.pathname.startsWith(item.href)
                      ? "glass text-secondary border border-secondary/20"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive mt-4"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardNav;
