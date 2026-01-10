import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

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
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Teams", href: "/teams", icon: Users },
    { label: "Writeups", href: "/writeups", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const adminItems = [
    { label: "Admin Panel", href: "/admin", icon: ShieldCheck },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border bg-card/50">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-display text-xl font-bold tracking-wider text-gradient">
              CyberOps
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-colors ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <span className="px-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Admin
                </span>
              </div>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono uppercase tracking-wider transition-colors ${
                    location.pathname.startsWith(item.href)
                      ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {profile?.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-semibold truncate">
                {profile?.username || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.total_points || 0} pts
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <span className="font-display text-lg font-bold tracking-wider text-gradient">
            CyberOps
          </span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16 bg-background">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono uppercase tracking-wider ${
                  location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            {isAdmin && adminItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono uppercase tracking-wider ${
                  location.pathname.startsWith(item.href)
                    ? "bg-neon-cyan/10 text-neon-cyan"
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
        </div>
      )}
    </>
  );
};

export default DashboardNav;
