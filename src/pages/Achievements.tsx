import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen, Zap, Target, Star, Award, Crown } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import { BadgeStorage, StreakStorage, EnrollmentStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import type { UserBadge, LearningStreak } from "../lib/types";
import { formatDate } from "../lib/utils";

const ALL_BADGES = [
  { type: "first_course", name: "First Step", description: "Enrolled in your first course", icon: "🎯", color: "from-violet-500 to-purple-600" },
  { type: "five_courses", name: "Knowledge Seeker", description: "Enrolled in 5 courses", icon: "📚", color: "from-blue-500 to-indigo-600" },
  { type: "ten_courses", name: "Lifelong Learner", description: "Enrolled in 10 courses", icon: "🌟", color: "from-emerald-500 to-teal-600" },
  { type: "first_completion", name: "Course Conqueror", description: "Completed your first course", icon: "🏆", color: "from-amber-500 to-orange-600" },
  { type: "streak_7", name: "Week Warrior", description: "7-day learning streak", icon: "🔥", color: "from-red-500 to-orange-500" },
  { type: "streak_30", name: "Monthly Master", description: "30-day learning streak", icon: "⚡", color: "from-yellow-500 to-amber-500" },
  { type: "top_learner", name: "Top Learner", description: "Ranked in the top 10%", icon: "👑", color: "from-pink-500 to-rose-600" },
  { type: "quiz_ace", name: "Quiz Ace", description: "Perfect score on a quiz", icon: "💯", color: "from-cyan-500 to-blue-600" },
  { type: "fast_learner", name: "Fast Learner", description: "Complete a course in under 3 days", icon: "⚡", color: "from-violet-500 to-indigo-600" },
  { type: "goal_crusher", name: "Goal Crusher", description: "Complete a learning goal", icon: "🎪", color: "from-emerald-500 to-green-600" },
];

export function Achievements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setEarnedBadges(BadgeStorage.getByUser(user.id));
    setStreak(StreakStorage.getOrCreate(user.id));
    setEnrollmentCount(EnrollmentStorage.getByStudent(user.id).length);
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <Trophy className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Sign in to view achievements</h2>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const earnedTypes = new Set(earnedBadges.map((b) => b.type));
  const earnedCount = earnedBadges.length;
  const totalCount = ALL_BADGES.length;

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-br from-card to-secondary border-b border-border py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
          </div>
          <p className="text-muted-foreground ml-13 mt-1">Collect badges as you level up your skills</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Badges Earned", value: `${earnedCount}/${totalCount}`, icon: Trophy, color: "text-amber-400" },
              { label: "Current Streak", value: `${streak?.currentStreak || 0} days`, icon: Flame, color: "text-orange-400" },
              { label: "Longest Streak", value: `${streak?.longestStreak || 0} days`, icon: Zap, color: "text-yellow-400" },
              { label: "Courses Enrolled", value: enrollmentCount, icon: BookOpen, color: "text-violet-400" },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Overall progress */}
          <Card className="mt-4 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{earnedCount} of {totalCount} badges</span>
            </div>
            <Progress value={(earnedCount / totalCount) * 100} color="default" />
          </Card>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Streak card */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl">
              🔥
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{streak?.currentStreak || 0} Day Streak</p>
              <p className="text-sm text-muted-foreground">Keep learning every day to maintain your streak!</p>
              <p className="text-xs text-muted-foreground mt-1">Personal best: {streak?.longestStreak || 0} days</p>
            </div>
          </div>
        </div>

        {/* Badges grid */}
        <h2 className="text-lg font-bold text-foreground mb-4">All Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge, i) => {
            const isEarned = earnedTypes.has(badge.type);
            const earned = earnedBadges.find((b) => b.type === badge.type);
            return (
              <motion.div
                key={badge.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`p-4 text-center transition-all ${isEarned ? "border-amber-500/30 shadow-lg shadow-amber-500/10" : "opacity-50"}`}>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl mx-auto mb-3 ${!isEarned && "grayscale"}`}>
                    {badge.icon}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{badge.description}</p>
                  {isEarned && earned && (
                    <p className="text-xs text-amber-400 mt-2">Earned {formatDate(earned.earnedAt)}</p>
                  )}
                  {!isEarned && (
                    <Badge variant="outline" className="mt-2 text-[10px]">Locked</Badge>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
