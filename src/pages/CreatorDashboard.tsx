import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Plus, BookOpen, Users, DollarSign, Star,
  Eye, EyeOff, Trash2, Edit, BarChart3, TrendingUp, Crown,
  Sparkles, AlertCircle, Globe, Lock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { CourseStorage, EnrollmentStorage, ReviewStorage, SubscriptionStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { Course, CreatorSubscription } from "../lib/types";
import { formatCurrency, formatNumber, formatDate, cn } from "../lib/utils";

// Mock revenue data
function getRevenueData(courses: Course[]) {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  return months.map((month, i) => ({
    month,
    revenue: courses.reduce((sum, c) => {
      const base = (c.totalStudents || 0) * c.price * 0.8;
      const factor = 0.5 + (i / 5) * 0.8 + Math.random() * 0.3;
      return sum + Math.round(base * factor * 0.15);
    }, 0),
    students: courses.reduce((sum, c) => sum + Math.round((c.totalStudents || 0) * (0.1 + i * 0.02)), 0),
  }));
}

export function CreatorDashboard() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [subscription, setSubscription] = useState<CreatorSubscription | null>(null);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; students: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const creatorCourses = CourseStorage.getByCreator(user.id);
    setCourses(creatorCourses);
    setSubscription(SubscriptionStorage.getByCreator(user.id) || null);
    setRevenueData(getRevenueData(creatorCourses));
  }, [user]);

  if (!user || (user.role !== "creator" && user.role !== "admin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Crown className="w-12 h-12 text-violet-400" />
        <h2 className="text-xl font-bold text-foreground">Creator Access Required</h2>
        <p className="text-muted-foreground">Register as a creator to access the dashboard</p>
        <Button onClick={() => navigate("/register?role=creator")}>Become a Creator</Button>
      </div>
    );
  }

  const totalStudents = courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
  const totalRevenue = courses.reduce((sum, c) => sum + (c.totalStudents || 0) * c.price * 0.8, 0);
  const avgRating = courses.length > 0
    ? courses.filter((c) => c.reviewCount > 0).reduce((sum, c) => sum + c.rating, 0) / (courses.filter((c) => c.reviewCount > 0).length || 1)
    : 0;
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const isPro = subscription?.plan === "pro";
  const isStarter = !subscription || subscription.plan === "starter";
  const atCourseLimit = isStarter && courses.length >= 3;

  const handleToggleStatus = (course: Course) => {
    const newStatus = course.status === "published" ? "draft" : "published";
    CourseStorage.update(course.id, { status: newStatus });
    setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, status: newStatus } : c));
    info(`Course ${newStatus}`, `"${course.title}" is now ${newStatus}.`);
  };

  const handleDelete = (course: Course) => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    CourseStorage.delete(course.id);
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
    success("Course deleted");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-card to-secondary border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-foreground">Creator Dashboard</h1>
                <Badge variant={isPro ? "gradient" : "default"}>
                  {isPro ? "Pro" : "Starter"}
                </Badge>
              </div>
              <p className="text-muted-foreground">Welcome back, {user.fullName.split(" ")[0]} 👋</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" leftIcon={<BarChart3 className="w-4 h-4" />} onClick={() => navigate("/analytics")}>
                Analytics
              </Button>
              <Button
                variant="gradient"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  if (atCourseLimit) {
                    info("Course limit reached", "Upgrade to Pro for unlimited courses.");
                    navigate("/subscription");
                  } else {
                    navigate("/creator/create");
                  }
                }}
              >
                New Course
              </Button>
            </div>
          </div>

          {/* Upgrade banner */}
          {atCourseLimit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-400">Course limit reached</p>
                <p className="text-xs text-muted-foreground">Starter plan allows 3 courses. Upgrade to Pro for unlimited.</p>
              </div>
              <Button size="sm" variant="gradient" onClick={() => navigate("/subscription")} leftIcon={<Crown className="w-3.5 h-3.5" />}>
                Upgrade
              </Button>
            </motion.div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "from-emerald-500 to-teal-500", change: "+12%" },
              { label: "Total Students", value: formatNumber(totalStudents), icon: Users, color: "from-blue-500 to-indigo-500", change: "+8%" },
              { label: "Avg Rating", value: avgRating > 0 ? avgRating.toFixed(1) + " ★" : "N/A", icon: Star, color: "from-amber-500 to-orange-500" },
              { label: "Courses", value: `${publishedCount}/${courses.length}`, icon: BookOpen, color: "from-violet-500 to-purple-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      {stat.change && <p className="text-xs text-emerald-400 mt-0.5">{stat.change} this month</p>}
                    </div>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Charts */}
        {courses.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" /> Revenue (6 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" /> New Students (6 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    />
                    <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Courses table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Your Courses</h2>
            <span className="text-sm text-muted-foreground">{courses.length} total {!isPro && `/ 3 max`}</span>
          </div>

          {courses.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">Create your first course and start earning</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/creator/create")} leftIcon={<Plus className="w-4 h-4" />}>
                  Create Manually
                </Button>
                {isPro && (
                  <Button variant="outline" onClick={() => navigate("/creator/ai-generator")} leftIcon={<Sparkles className="w-4 h-4" />}>
                    AI Generator
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Course</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Students</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Revenue</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Rating</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((course) => {
                      const revenue = (course.totalStudents || 0) * course.price * 0.8;
                      return (
                        <tr key={course.id} className="hover:bg-accent/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 rounded-lg overflow-hidden bg-secondary shrink-0">
                                {course.coverImage ? (
                                  <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">{course.title}</p>
                                <p className="text-xs text-muted-foreground">{course.category} · {formatDate(course.createdAt)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <Badge variant={course.status === "published" ? "success" : "outline"} className="capitalize">
                              {course.status === "published" ? <Globe className="w-2.5 h-2.5 mr-1" /> : <Lock className="w-2.5 h-2.5 mr-1" />}
                              {course.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-foreground hidden md:table-cell">
                            {formatNumber(course.totalStudents || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-emerald-400 hidden md:table-cell">
                            {formatCurrency(revenue)}
                          </td>
                          <td className="px-4 py-3 text-right hidden lg:table-cell">
                            {course.reviewCount > 0 ? (
                              <span className="text-sm text-amber-400">{course.rating.toFixed(1)} ★</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => navigate(`/creator/edit/${course.id}`)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(course)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title={course.status === "published" ? "Unpublish" : "Publish"}
                              >
                                {course.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDelete(course)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: "Edit Branding", desc: "Customize your creator profile", icon: Edit, href: "/creator/branding", color: "from-violet-500 to-purple-500" },
            { title: "AI Generator", desc: isPro ? "Create a course with AI" : "Pro feature — upgrade to unlock", icon: Sparkles, href: isPro ? "/creator/ai-generator" : "/subscription", color: "from-amber-500 to-orange-500", locked: !isPro },
            { title: "Analytics", desc: "Deep performance insights", icon: BarChart3, href: "/analytics", color: "from-blue-500 to-indigo-500" },
          ].map((action) => (
            <Card
              key={action.title}
              hover
              className={cn("p-5 flex items-start gap-4 cursor-pointer", action.locked && "opacity-75")}
              onClick={() => navigate(action.href)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-sm">{action.title}</p>
                  {action.locked && <Badge variant="warning" className="text-[10px]">Pro</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
