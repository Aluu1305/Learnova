import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Star, Clock, CheckCircle, Lock, Play, ChevronDown,
  Globe, Award, BarChart, Heart, Share2, ShoppingCart, ArrowLeft, Zap,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import { StarRating } from "../components/ui/StarRating";
import { Avatar } from "../components/ui/Avatar";
import {
  CourseStorage, ModuleStorage, LessonStorage, EnrollmentStorage,
  ReviewStorage, WishlistStorage, NotificationStorage,
} from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { Course, Module, Lesson, Review, Enrollment } from "../lib/types";
import { formatCurrency, formatNumber, formatDate, cn } from "../lib/utils";

function ModuleAccordion({ module, lessons, isEnrolled }: { module: Module; lessons: Lesson[]; isEnrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-accent transition-colors"
      >
        <div>
          <p className="font-semibold text-foreground text-sm">{module.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {lessons.length} lesson{lessons.length !== 1 && "s"} · {Math.round(totalDuration)} min
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                {isEnrolled ? <Play className="w-3 h-3 text-violet-400" /> : <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{lesson.title}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{lesson.duration}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const c = CourseStorage.getById(id);
    if (!c) { navigate("/explore"); return; }
    setCourse(c);

    const mods = ModuleStorage.getByCourse(id);
    setModules(mods);
    const lessonMap: Record<string, Lesson[]> = {};
    mods.forEach((m) => { lessonMap[m.id] = LessonStorage.getByModule(m.id); });
    setLessonsByModule(lessonMap);

    setReviews(ReviewStorage.getByCourse(id));

    if (user) {
      const enr = EnrollmentStorage.getByStudentAndCourse(user.id, id);
      setEnrollment(enr || null);
      setIsWishlisted(WishlistStorage.isWishlisted(user.id, id));
    }
  }, [id, user, navigate]);

  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }
    if (!course) return;
    setEnrolling(true);
    try {
      const enr = EnrollmentStorage.create({
        courseId: course.id,
        studentId: user.id,
        studentEmail: user.email,
        studentName: user.fullName,
        completedLessons: [],
        progress: 0,
        status: "active",
        enrolledAt: new Date().toISOString(),
      });
      setEnrollment(enr);

      NotificationStorage.create({
        userId: user.id,
        type: "enrollment",
        title: "Enrolled Successfully!",
        message: `You're now enrolled in "${course.title}". Start learning!`,
        read: false,
        link: `/learn/${course.id}`,
        createdAt: new Date().toISOString(),
      });

      if (course.creatorId !== user.id) {
        NotificationStorage.create({
          userId: course.creatorId,
          type: "new_student",
          title: "New Student Enrolled",
          message: `${user.fullName} enrolled in "${course.title}"`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      success("Enrolled!", `Welcome to ${course.title}. Ready to start?`);
      navigate(`/learn/${course.id}`);
    } finally {
      setEnrolling(false);
    }
  };

  const handleWishlist = () => {
    if (!user) { info("Sign in required", "Please sign in to save courses."); return; }
    if (!course) return;
    const added = WishlistStorage.toggle(user.id, course.id);
    setIsWishlisted(added);
    info(added ? "Added to wishlist" : "Removed from wishlist");
  };

  if (!course) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const allLessons = Object.values(lessonsByModule).flat();
  const isCreator = user?.id === course.creatorId || user?.role === "admin";

  return (
    <div className="min-h-screen pb-20">
      {/* Hero banner */}
      <div className="relative bg-gradient-to-br from-card to-secondary border-b border-border">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Course info */}
            <div className="lg:col-span-2">
              <div className="flex gap-2 mb-3">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant={course.difficulty === "Beginner" ? "success" : course.difficulty === "Intermediate" ? "warning" : "destructive"}>
                  {course.difficulty}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">{course.title}</h1>
              <p className="text-muted-foreground mb-5 leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-5">
                <div className="flex items-center gap-1.5">
                  <StarRating value={course.rating} size="sm" showValue />
                  <span className="text-muted-foreground">({formatNumber(course.reviewCount)} reviews)</span>
                </div>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" /> {formatNumber(course.totalStudents)} students
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="w-4 h-4" /> {course.totalLessons} lessons
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" /> {Math.round(course.totalDuration / 60)}h total
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Avatar name={course.creatorName} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">Created by{" "}
                    <Link to={`/instructor/${course.creatorId}`} className="text-violet-400 hover:underline">
                      {course.creatorName}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">Last updated {formatDate(course.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Enrollment card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/20 sticky top-20">
                {course.coverImage && (
                  <div className="aspect-video overflow-hidden">
                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-foreground">{formatCurrency(course.price)}</span>
                    {course.price > 0 && <span className="text-sm text-muted-foreground line-through">{formatCurrency(course.price * 1.5)}</span>}
                    {course.price > 0 && <Badge variant="destructive">33% OFF</Badge>}
                  </div>

                  {enrollment ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-emerald-400 font-medium">You're enrolled!</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                      </div>
                      <Button className="w-full" size="lg" onClick={() => navigate(`/learn/${course.id}`)}>
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="lg"
                        variant="gradient"
                        loading={enrolling}
                        onClick={handleEnroll}
                        leftIcon={course.price === 0 ? <Zap className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                      >
                        {course.price === 0 ? "Enroll for Free" : `Enroll · ${formatCurrency(course.price)}`}
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={handleWishlist} leftIcon={<Heart className={cn("w-4 h-4", isWishlisted && "fill-red-400 text-red-400")} />}>
                          {isWishlisted ? "Saved" : "Save"}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(window.location.href); info("Link copied!"); }}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {isCreator && (
                        <Button variant="outline" className="w-full" onClick={() => navigate(`/creator/edit/${course.id}`)}>
                          Edit Course
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2"><Globe className="w-3 h-3" /> Full lifetime access</p>
                    <p className="flex items-center gap-2"><Award className="w-3 h-3" /> Certificate of completion</p>
                    <p className="flex items-center gap-2"><Zap className="w-3 h-3" /> AI tutor included</p>
                    <p className="flex items-center gap-2"><BarChart className="w-3 h-3" /> 30-day money-back guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.whatYouLearn?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">What You'll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {course.requirements?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-2" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Description */}
            {course.longDescription && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">About This Course</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{course.longDescription}</p>
              </section>
            )}

            {/* Curriculum */}
            {modules.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-2">Course Content</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {modules.length} modules · {allLessons.length} lessons · {Math.round(course.totalDuration / 60)}h total
                </p>
                <div className="space-y-2">
                  {modules.map((mod) => (
                    <ModuleAccordion
                      key={mod.id}
                      module={mod}
                      lessons={lessonsByModule[mod.id] || []}
                      isEnrolled={!!enrollment}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Student Reviews</h2>
                <div className="flex items-center gap-2">
                  <StarRating value={course.rating} size="sm" showValue />
                  <span className="text-sm text-muted-foreground">({formatNumber(course.reviewCount)})</span>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar name={review.reviewerName} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{review.reviewerName}</p>
                          <div className="flex items-center gap-2">
                            <StarRating value={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
