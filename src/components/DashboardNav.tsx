import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield, LayoutDashboard, Target, Trophy, Users, FileText, Settings,
  LogOut, ShieldCheck, Menu, X, Layers, User, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DashboardNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const NavItem = ({ item, isAdminLink = false }: { item: typeof navItems[0]; isAdminLink?: boolean }) => {
    const isActive = location.pathname === item.href || (item.href === "/admin" && location.pathname.startsWith("/admin"));
    const activeColor = isAdminLink ? "text-secondary" : "text-primary";
    const activeBorder = isAdminLink ? "border-secondary/30" : "border-primary/30";
    const activeBg = isAdminLink ? "bg-secondary/5" : "bg-primary/5";
    const activeGlow = isAdminLink
      ? "shadow-[0_0_12px_hsl(var(--neon-cyan)/0.08)]"
      : "shadow-[0_0_12px_hsl(var(--neon-green)/0.08)]";

    const content = (
      <Link
        to={item.href}
        className={`group relative flex items-center rounded-xl transition-all duration-200 ${
          collapsed ? "justify-center p-3" : "gap-3.5 px-4 py-3"
        } ${
          isActive
            ? `${activeBg} ${activeColor} border ${activeBorder} ${activeGlow}`
            : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border border-transparent"
        }`}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator"
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${isAdminLink ? "bg-secondary" : "bg-primary"}`}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        <item.icon
          className={`h-[18px] w-[18px] flex-shrink-0 transition-all duration-200 ${
            isActive ? "" : "group-hover:scale-110"
          }`}
        />

        {!collapsed && (
          <span className="text-[11px] font-mono uppercase tracking-[0.15em] font-medium">
            {item.label}
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-mono text-xs uppercase tracking-wider">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col min-h-screen border-r border-border/20 bg-card/40 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        {/* Logo */}
        <div className={`border-b border-border/15 flex items-center ${collapsed ? "justify-center p-4" : "px-5 py-5"}`}>
          <Link to="/" className="flex items-center gap-2.5 group">
            <Shield className="h-7 w-7 text-primary transition-all group-hover:drop-shadow-[0_0_8px_hsl(var(--neon-green)/0.6)]" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display text-lg font-bold tracking-wider text-gradient overflow-hidden whitespace-nowrap"
              >
                CyberOps
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}

          {isAdmin && (
            <>
              <div className="py-3">
                <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : "px-4"}`}>
                  <div className={`h-px flex-1 bg-gradient-to-r from-transparent via-secondary/20 to-transparent ${collapsed ? "hidden" : ""}`} />
                  {!collapsed && (
                    <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-secondary/50">
                      Admin
                    </span>
                  )}
                  <div className={`h-px flex-1 bg-gradient-to-r from-secondary/20 via-transparent to-transparent ${collapsed ? "hidden" : ""}`} />
                  {collapsed && <div className="w-6 h-px bg-secondary/20" />}
                </div>
              </div>
              {adminItems.map((item) => (
                <NavItem key={item.href} item={item} isAdminLink />
              ))}
            </>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2.5 py-2 border-t border-border/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User card */}
        <div className={`border-t border-border/15 ${collapsed ? "p-2.5" : "p-3"}`}>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs border border-primary/15 cursor-default">
                  {profile?.username?.[0]?.toUpperCase() || "?"}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-mono text-xs">
                {profile?.username || "Anonymous"} · {profile?.total_points || 0} pts
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/10 border border-border/10 mb-2">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs border border-primary/15 flex-shrink-0">
                {profile?.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[11px] font-semibold truncate text-foreground">
                  {profile?.username || "Anonymous"}
                </p>
                <p className="text-[9px] text-muted-foreground font-mono">
                  {profile?.total_points || 0} pts
                </p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={`text-muted-foreground hover:text-destructive hover:bg-destructive/5 ${collapsed ? "w-full" : "w-full justify-start"}`}
            onClick={handleSignOut}
          >
            <LogOut className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`} />
            {!collapsed && <span className="text-xs font-mono">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card/80 backdrop-blur-xl border-b border-border/20 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display text-base font-bold tracking-wider text-gradient">CyberOps</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-primary">
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Menu className="h-5 w-5" />
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
            className="lg:hidden fixed inset-0 z-40 pt-14 bg-background/95 backdrop-blur-xl"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[11px] font-mono uppercase tracking-[0.15em] ${
                      location.pathname === item.href
                        ? "bg-primary/5 text-primary border border-primary/20"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {isAdmin && adminItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[11px] font-mono uppercase tracking-[0.15em] ${
                    location.pathname.startsWith(item.href)
                      ? "bg-secondary/5 text-secondary border border-secondary/20"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
              <div className="pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive text-xs font-mono"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardNav;
