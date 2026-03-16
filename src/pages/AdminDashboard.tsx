import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, BookOpen, DollarSign, Trash2, Edit2, ChevronDown, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";
import {
  AuthStorage, CourseStorage, EnrollmentStorage, AffiliateStorage,
} from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { User, Course, Enrollment, AffiliatePayoutRequest } from "../lib/types";
import { formatCurrency, formatDate, formatNumber } from "../lib/utils";

export function AdminDashboard() {
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayoutRequest[]>([]);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    setUsers(AuthStorage.getAllUsers());
    setCourses(CourseStorage.getAll());
    setEnrollments(EnrollmentStorage.getAll());
    setPayouts(AffiliateStorage.getAllPayouts());
  }, [user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Admin Access Required</h2>
        <p className="text-muted-foreground">Login as admin@learnova.io / admin123</p>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const totalRevenue = courses.reduce((sum, c) => sum + (c.totalStudents || 0) * c.price * 0.8, 0);
  const filteredUsers = users.filter((u) =>
    userSearch ? u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) : true
  );

  const deleteUser = (userId: string) => {
    if (!confirm("Delete this user?")) return;
    AuthStorage.deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    success("User deleted");
  };

  const deleteCourse = (courseId: string) => {
    if (!confirm("Delete this course?")) return;
    CourseStorage.delete(courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    success("Course deleted");
  };

  const approvePayout = (payoutId: string) => {
    AffiliateStorage.updatePayout(payoutId, { status: "approved" });
    setPayouts((prev) => prev.map((p) => p.id === payoutId ? { ...p, status: "approved" as const } : p));
    success("Payout approved");
  };

  const rejectPayout = (payoutId: string) => {
    AffiliateStorage.updatePayout(payoutId, { status: "rejected" });
    setPayouts((prev) => prev.map((p) => p.id === payoutId ? { ...p, status: "rejected" as const } : p));
    success("Payout rejected");
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-br from-card to-secondary border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform management and oversight</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: users.length, icon: Users, color: "from-violet-500 to-purple-600" },
              { label: "Total Courses", value: courses.length, icon: BookOpen, color: "from-blue-500 to-indigo-600" },
              { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "from-emerald-500 to-teal-600" },
              { label: "Total Enrollments", value: formatNumber(enrollments.length), icon: Users, color: "from-amber-500 to-orange-600" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments ({enrollments.length})</TabsTrigger>
            <TabsTrigger value="payouts">Payouts ({payouts.filter((p) => p.status === "pending").length} pending)</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="mb-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..." className="w-full max-w-sm h-10 pl-10 pr-4 rounded-xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
            </div>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === "admin" ? "destructive" : u.role === "creator" ? "default" : "outline"} className="capitalize">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Course</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Creator</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Students</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {courses.map((c) => (
                      <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.category} · {c.difficulty}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{c.creatorName}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant={c.status === "published" ? "success" : "outline"} className="capitalize">{c.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden lg:table-cell">
                          {formatNumber(c.totalStudents || 0)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deleteCourse(c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="enrollments">
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Course</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Progress</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {enrollments.slice(0, 50).map((e) => {
                      const course = CourseStorage.getById(e.courseId);
                      return (
                        <tr key={e.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{e.studentName}</p>
                            <p className="text-xs text-muted-foreground">{e.studentEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell line-clamp-1">
                            {course?.title || "Unknown"}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-border rounded-full h-1.5 max-w-[80px]">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${e.progress}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{e.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                            {formatDate(e.enrolledAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payouts">
            {payouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No payout requests yet</div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{payout.affiliateName}</p>
                      <p className="text-xs text-muted-foreground">{payout.paymentMethod} · {formatDate(payout.createdAt)}</p>
                    </div>
                    <p className="font-bold text-foreground">{formatCurrency(payout.amount)}</p>
                    <Badge variant={payout.status === "approved" ? "success" : payout.status === "rejected" ? "destructive" : "warning"} className="capitalize">
                      {payout.status}
                    </Badge>
                    {payout.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => approvePayout(payout.id)}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectPayout(payout.id)}>Reject</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
