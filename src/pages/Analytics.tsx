import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, DollarSign, Star, BookOpen } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { CourseStorage, EnrollmentStorage, ReviewStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import type { Course } from "../lib/types";
import { formatCurrency, formatNumber } from "../lib/utils";

const COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    const cr = user.role === "admin" ? CourseStorage.getAll() : CourseStorage.getByCreator(user.id);
    setCourses(cr);
  }, [user]);

  if (!user || (user.role !== "creator" && user.role !== "admin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BarChart3 className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Creator access required</p>
      </div>
    );
  }

  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const revenueData = months.map((month, i) => ({
    month,
    revenue: courses.reduce((sum, c) => sum + Math.round((c.totalStudents || 0) * c.price * 0.8 * (0.1 + i * 0.025)), 0),
    enrollments: courses.reduce((sum, c) => sum + Math.round((c.totalStudents || 0) * (0.08 + i * 0.02)), 0),
  }));

  const categoryData = Object.entries(
    courses.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + (c.totalStudents || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const coursePerformance = courses
    .filter((c) => c.status === "published")
    .map((c) => ({
      title: c.title.length > 25 ? c.title.slice(0, 25) + "…" : c.title,
      students: c.totalStudents || 0,
      revenue: (c.totalStudents || 0) * c.price * 0.8,
      rating: c.rating,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const totalRevenue = courses.reduce((sum, c) => sum + (c.totalStudents || 0) * c.price * 0.8, 0);
  const totalStudents = courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
  const avgRating = courses.filter((c) => c.reviewCount > 0).reduce((sum, c) => sum + c.rating, 0) / (courses.filter((c) => c.reviewCount > 0).length || 1);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground text-sm">Deep insights into your performance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "from-emerald-500 to-teal-600", trend: "+12%" },
              { label: "Total Students", value: formatNumber(totalStudents), icon: Users, color: "from-violet-500 to-purple-600", trend: "+8%" },
              { label: "Published Courses", value: courses.filter((c) => c.status === "published").length, icon: BookOpen, color: "from-blue-500 to-indigo-600" },
              { label: "Avg Rating", value: avgRating > 0 ? avgRating.toFixed(1) + " ★" : "—", icon: Star, color: "from-amber-500 to-orange-600" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      {"trend" in stat && <p className="text-xs text-emerald-400 mt-0.5">{(stat as {trend: string}).trend}</p>}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Revenue chart */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#7c3aed" fill="url(#areaGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> New Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category breakdown + course performance */}
        <div className="grid lg:grid-cols-2 gap-5">
          {categoryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Students by Category</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <PieChart width={140} height={140}>
                  <Pie data={categoryData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="space-y-1.5 flex-1 min-w-0">
                  {categoryData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground truncate flex-1">{item.name}</span>
                      <span className="font-medium text-foreground shrink-0">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coursePerformance.slice(0, 5).map((c) => (
                  <div key={c.title} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(c.students)} students</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-emerald-400">{formatCurrency(c.revenue)}</p>
                      <p className="text-xs text-amber-400">{c.rating.toFixed(1)} ★</p>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Create courses to see analytics</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
