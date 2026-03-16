import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Trophy, Play, CheckCircle, TrendingUp, Flame } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { Card, CardContent } from "../components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/Tabs";
import { EnrollmentStorage, CourseStorage, StreakStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import type { Enrollment, Course, LearningStreak } from "../lib/types";
import { formatDate } from "../lib/utils";

function EnrollmentCard({ enrollment, course }: { enrollment: Enrollment; course: Course }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row"
      onClick={() => navigate(`/learn/${course.id}`)}
    >
      <div className="w-full sm:w-48 aspect-video sm:aspect-auto sm:h-auto shrink-0 bg-secondary overflow-hidden">
        {course.coverImage ? (
          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full min-h-[96px] flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <BookOpen className="w-8 h-8 text-violet-400/50" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-1 group-hover:text-violet-400 transition-colors">
              {course.title}
            </h3>
            <Badge variant={enrollment.status === "completed" ? "success" : "default"} className="shrink-0">
              {enrollment.status === "completed" ? "Completed" : "In Progress"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">by {course.creatorName}</p>
          <div className="mb-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{enrollment.completedLessons.length} of {course.totalLessons} lessons</span>
              <span className="font-medium text-foreground">{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} size="sm" color={enrollment.status === "completed" ? "success" : "default"} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Enrolled {formatDate(enrollment.enrolledAt)}</p>
          <Button size="sm" variant="outline" className="group-hover:border-violet-500/50 group-hover:text-violet-400 transition-colors" leftIcon={<Play className="w-3 h-3" />}>
            {enrollment.progress === 0 ? "Start" : "Continue"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function MyLearning() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Record<string, Course>>({});
  const [streak, setStreak] = useState<LearningStreak | null>(null);

  useEffect(() => {
    if (!user) return;
    const enrs = EnrollmentStorage.getByStudent(user.id);
    setEnrollments(enrs);

    const courseMap: Record<string, Course> = {};
    enrs.forEach((e) => {
      const c = CourseStorage.getById(e.courseId);
      if (c) courseMap[e.courseId] = c;
    });
    setCourses(courseMap);
    setStreak(StreakStorage.getOrCreate(user.id));
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Sign in to view your learning</h2>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const active = enrollments.filter((e) => e.status === "active");
  const completed = enrollments.filter((e) => e.status === "completed");
  const totalStudyMinutes = enrollments.reduce((sum, e) => {
    const course = courses[e.courseId];
    return sum + (course ? Math.round((e.progress / 100) * course.totalDuration) : 0);
  }, 0);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">My Learning</h1>
          <p className="text-muted-foreground">Track your progress and continue where you left off</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Enrolled", value: enrollments.length, icon: BookOpen, color: "text-violet-400" },
              { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-emerald-400" },
              { label: "Study Time", value: `${Math.round(totalStudyMinutes / 60)}h`, icon: Clock, color: "text-blue-400" },
              { label: "Day Streak", value: streak?.currentStreak || 0, icon: Flame, color: "text-orange-400" },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {enrollments.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">Start your learning journey by enrolling in a course</p>
            <Button variant="gradient" onClick={() => navigate("/explore")}>Explore Courses</Button>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">
                In Progress ({active.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completed.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({enrollments.length})
              </TabsTrigger>
            </TabsList>

            {["active", "completed", "all"].map((tab) => {
              const list = tab === "active" ? active : tab === "completed" ? completed : enrollments;
              return (
                <TabsContent key={tab} value={tab}>
                  {list.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {tab === "completed" ? "Complete a course to see it here" : "No courses in this category"}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {list.map((enr) => {
                        const course = courses[enr.courseId];
                        if (!course) return null;
                        return <EnrollmentCard key={enr.id} enrollment={enr} course={course} />;
                      })}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </div>
  );
}
