import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, CheckCheck, BookOpen, Trophy, Star, Users, Eye, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { NotificationStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import type { Notification } from "../lib/types";
import { formatRelativeTime, cn } from "../lib/utils";

const TYPE_ICONS: Record<string, React.ElementType> = {
  enrollment: BookOpen,
  progress: TrendingUp,
  completion: Trophy,
  new_student: Users,
  course_view: Eye,
  review: Star,
  welcome: Bell,
  achievement: Trophy,
  payout: CheckCheck,
};

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

const TYPE_COLORS: Record<string, string> = {
  enrollment: "bg-violet-500/10 text-violet-400",
  progress: "bg-blue-500/10 text-blue-400",
  completion: "bg-emerald-500/10 text-emerald-400",
  new_student: "bg-indigo-500/10 text-indigo-400",
  course_view: "bg-cyan-500/10 text-cyan-400",
  review: "bg-amber-500/10 text-amber-400",
  welcome: "bg-purple-500/10 text-purple-400",
  achievement: "bg-orange-500/10 text-orange-400",
  payout: "bg-emerald-500/10 text-emerald-400",
};

export function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    setNotifications(NotificationStorage.getByUser(user.id));
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <Bell className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Sign in to view notifications</h2>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const unread = notifications.filter((n) => !n.read);

  const markRead = (id: string) => {
    NotificationStorage.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    NotificationStorage.markAllRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Notifications
              {unread.length > 0 && (
                <Badge variant="default">{unread.length} new</Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">Stay updated on your activity</p>
          </div>
          {unread.length > 0 && (
            <Button size="sm" variant="outline" onClick={markAllRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
            <p className="text-muted-foreground">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, i) => {
              const Icon = TYPE_ICONS[notif.type] || Bell;
              const colorClass = TYPE_COLORS[notif.type] || "bg-secondary text-muted-foreground";
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group",
                    notif.read
                      ? "border-border bg-card hover:border-border/80"
                      : "border-violet-500/20 bg-violet-500/5 hover:border-violet-500/30"
                  )}
                  onClick={() => {
                    markRead(notif.id);
                    if (notif.link) navigate(notif.link);
                  }}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold leading-snug", notif.read ? "text-foreground" : "text-foreground")}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
