import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, BookOpen, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StarRating } from "../components/ui/StarRating";
import { WishlistStorage, CourseStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import type { Course } from "../lib/types";
import { formatCurrency, formatNumber } from "../lib/utils";

export function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistedCourses, setWishlistedCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!user) return;
    const wl = WishlistStorage.getByUser(user.id);
    const courses = wl
      .map((w) => CourseStorage.getById(w.courseId))
      .filter(Boolean) as Course[];
    setWishlistedCourses(courses);
  }, [user]);

  const removeFromWishlist = (courseId: string) => {
    if (!user) return;
    WishlistStorage.toggle(user.id, courseId);
    setWishlistedCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <Heart className="w-12 h-12 text-muted-foreground" />
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" /> Wishlist
          </h1>
          <p className="text-muted-foreground mt-1">{wishlistedCourses.length} saved course{wishlistedCourses.length !== 1 && "s"}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {wishlistedCourses.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">Save courses to revisit them later</p>
            <Button variant="gradient" onClick={() => navigate("/explore")}>Explore Courses</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistedCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-violet-500/30 transition-all group"
              >
                <div
                  className="w-24 h-16 rounded-xl overflow-hidden bg-secondary shrink-0 cursor-pointer"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {course.coverImage ? (
                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-violet-400 transition-colors">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.creatorName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={course.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">({formatNumber(course.reviewCount)})</span>
                    <Badge variant={course.difficulty === "Beginner" ? "success" : course.difficulty === "Intermediate" ? "warning" : "destructive"} className="text-[10px] py-0">
                      {course.difficulty}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-foreground">{formatCurrency(course.price)}</span>
                  <Button size="sm" onClick={() => navigate(`/course/${course.id}`)} leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}>
                    Enroll
                  </Button>
                  <button
                    onClick={() => removeFromWishlist(course.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
