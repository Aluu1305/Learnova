import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Bell, Menu, X, ChevronDown, User, Settings, LogOut,
  LayoutDashboard, Compass, GraduationCap, Sparkles, Trophy, Heart,
  Target, Calendar, Users, BarChart3, Crown, Link as LinkIcon, Shield,
  Zap, Plus,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { NotificationStorage } from "../../lib/storage";
import { cn } from "../../lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "My Learning", href: "/my-learning", icon: GraduationCap, roles: ["student", "creator", "admin"] },
];

const userMenuItems = [
  { label: "My Learning", href: "/my-learning", icon: GraduationCap, roles: ["student"] },
  { label: "Creator Dashboard", href: "/creator", icon: LayoutDashboard, roles: ["creator", "admin"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["creator", "admin"] },
  { label: "Goals", href: "/goals", icon: Target, roles: ["student", "creator", "admin"] },
  { label: "Achievements", href: "/achievements", icon: Trophy, roles: ["student", "creator", "admin"] },
  { label: "Study Schedule", href: "/schedule", icon: Calendar, roles: ["student", "creator", "admin"] },
  { label: "Wishlist", href: "/wishlist", icon: Heart, roles: ["student", "creator", "admin"] },
  { label: "Affiliate Program", href: "/affiliate", icon: LinkIcon, roles: ["student", "creator", "admin"] },
  { label: "Subscription", href: "/subscription", icon: Crown, roles: ["creator", "admin"] },
  { label: "Admin Dashboard", href: "/admin", icon: Shield, roles: ["admin"] },
  { label: "Profile", href: "/profile", icon: User, roles: ["student", "creator", "admin"] },
];

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      setUnreadCount(NotificationStorage.getUnreadCount(user.id));
    }
  }, [user, location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const filteredUserMenu = userMenuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || "")
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/10"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300 group-hover:scale-110">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">
                Learn<span className="gradient-text">ova</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.roles && !item.roles.includes(user?.role || "")) return null;
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-violet-400 bg-violet-500/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              {user?.role === "creator" || user?.role === "admin" ? (
                <Link
                  to="/creator"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname.startsWith("/creator")
                      ? "text-violet-400 bg-violet-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : null}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Create Course quick button */}
                  {(user.role === "creator" || user.role === "admin") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="hidden md:flex"
                      onClick={() => navigate("/creator/create")}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Create
                    </Button>
                  )}

                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User menu */}
                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent transition-colors"
                    >
                      <Avatar name={user.fullName} src={user.avatar} size="sm" color={user.brandColor} />
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {user.fullName.split(" ")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize leading-tight">
                          {user.role}
                        </p>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground hidden md:block transition-transform duration-200", userMenuOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden"
                        >
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-semibold text-foreground">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <Badge variant="default" className="mt-1.5 capitalize text-[10px]">
                              {user.role}
                            </Badge>
                          </div>

                          {/* Menu items */}
                          <div className="py-1">
                            {filteredUserMenu.slice(0, 6).map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            ))}
                            {filteredUserMenu.length > 6 && (
                              <>
                                <div className="h-px bg-border my-1" />
                                {filteredUserMenu.slice(6).map((item) => (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                  >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                  </Link>
                                ))}
                              </>
                            )}
                          </div>

                          <div className="border-t border-border p-1">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link to="/explore" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Compass className="w-4 h-4" /> Explore Courses
              </Link>
              {user ? (
                <>
                  <Link to="/my-learning" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <GraduationCap className="w-4 h-4" /> My Learning
                  </Link>
                  {(user.role === "creator" || user.role === "admin") && (
                    <Link to="/creator" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Creator Dashboard
                    </Link>
                  )}
                  <Link to="/achievements" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Trophy className="w-4 h-4" /> Achievements
                  </Link>
                  <Link to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Bell className="w-4 h-4" /> Notifications
                    {unreadCount > 0 && <Badge variant="default">{unreadCount}</Badge>}
                  </Link>
                  <div className="border-t border-border pt-2 mt-2">
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Sign In</Button>
                  <Button className="flex-1" onClick={() => { navigate("/register"); setMobileOpen(false); }}>Get Started</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
