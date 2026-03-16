import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Filter, Star, Users, BookOpen, X, SlidersHorizontal, Heart,
  Play, TrendingUp, Clock,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { StarRating } from "../components/ui/StarRating";
import { CourseStorage, WishlistStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { Course } from "../lib/types";
import { formatCurrency, formatNumber, CATEGORIES, DIFFICULTIES, cn } from "../lib/utils";

const PRICE_FILTERS = [
  { label: "All Prices", value: "" },
  { label: "Free", value: "free" },
  { label: "Under $50", value: "under50" },
  { label: "$50–$100", value: "50-100" },
  { label: "Premium ($100+)", value: "premium" },
];

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

function filterByPrice(course: Course, filter: string): boolean {
  if (!filter) return true;
  if (filter === "free") return course.price === 0;
  if (filter === "under50") return course.price > 0 && course.price < 50;
  if (filter === "50-100") return course.price >= 50 && course.price <= 100;
  if (filter === "premium") return course.price > 100;
  return true;
}

function sortCourses(courses: Course[], sort: string): Course[] {
  return [...courses].sort((a, b) => {
    switch (sort) {
      case "rating": return b.rating - a.rating;
      case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-asc": return a.price - b.price;
      case "price-desc": return b.price - a.price;
      default: return b.totalStudents - a.totalStudents;
    }
  });
}

function CourseGridCard({ course, isWishlisted, onWishlist }: { course: Course; isWishlisted: boolean; onWishlist: () => void }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {course.coverImage ? (
          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <BookOpen className="w-16 h-16 text-violet-400/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge variant={course.price === 0 ? "success" : "default"}>
            {formatCurrency(course.price)}
          </Badge>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(); }}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all",
            isWishlisted ? "bg-red-500 text-white" : "bg-black/40 text-white hover:bg-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] py-0">{course.category}</Badge>
          <Badge variant={course.difficulty === "Beginner" ? "success" : course.difficulty === "Intermediate" ? "warning" : "destructive"} className="text-[10px] py-0">
            {course.difficulty}
          </Badge>
        </div>
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-1 group-hover:text-violet-400 transition-colors flex-1">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">by {course.creatorName}</p>

        <div className="flex items-center gap-2 mb-3">
          <StarRating value={course.rating} size="sm" />
          <span className="text-xs font-semibold text-amber-400">{course.rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({formatNumber(course.reviewCount)})</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatNumber(course.totalStudents)}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.round(course.totalDuration / 60)}h</span>
        </div>
      </div>
    </motion.div>
  );
}

export function Explore() {
  const { user } = useAuth();
  const { info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const price = searchParams.get("price") || "";
  const sort = searchParams.get("sort") || "popular";

  useEffect(() => {
    setCourses(CourseStorage.getPublished());
  }, []);

  useEffect(() => {
    if (user) {
      const wl = WishlistStorage.getByUser(user.id);
      setWishlisted(new Set(wl.map((w) => w.courseId)));
    }
  }, [user]);

  const filtered = useMemo(() => {
    let result = courses;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.creatorName.toLowerCase().includes(q)
      );
    }
    if (category) result = result.filter((c) => c.category === category);
    if (difficulty) result = result.filter((c) => c.difficulty === difficulty);
    result = result.filter((c) => filterByPrice(c, price));
    return sortCourses(result, sort);
  }, [courses, query, category, difficulty, price, sort]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleWishlist = (courseId: string) => {
    if (!user) {
      info("Sign in required", "Please sign in to save courses to your wishlist.");
      return;
    }
    const added = WishlistStorage.toggle(user.id, courseId);
    setWishlisted((prev) => {
      const next = new Set(prev);
      if (added) next.add(courseId);
      else next.delete(courseId);
      return next;
    });
  };

  const hasFilters = query || category || difficulty || price || sort !== "popular";

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-card/50 border-b border-border sticky top-16 z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses, topics, creators..."
                value={query}
                onChange={(e) => updateParam("q", e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm transition-all"
              />
              {query && (
                <button onClick={() => updateParam("q", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button variant="outline" size="default" onClick={() => setShowFilters(!showFilters)} leftIcon={<SlidersHorizontal className="w-4 h-4" />} className={showFilters ? "border-violet-500/50 text-violet-400" : ""}>
              Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-violet-500" />}
            </Button>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-2 pb-2"
            >
              <select
                value={category}
                onChange={(e) => updateParam("category", e.target.value)}
                className="h-8 px-3 rounded-lg border border-border bg-secondary text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={difficulty}
                onChange={(e) => updateParam("difficulty", e.target.value)}
                className="h-8 px-3 rounded-lg border border-border bg-secondary text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
              >
                <option value="">All Levels</option>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={price}
                onChange={(e) => updateParam("price", e.target.value)}
                className="h-8 px-3 rounded-lg border border-border bg-secondary text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
              >
                {PRICE_FILTERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="h-8 px-3 rounded-lg border border-border bg-secondary text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50 cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {hasFilters && (
                <button onClick={clearFilters} className="h-8 px-3 rounded-lg text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Clear all
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Result count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> course{filtered.length !== 1 && "s"} found
            {query && <> for "<span className="text-violet-400">{query}</span>"</>}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            Sorted by: {SORT_OPTIONS.find((s) => s.value === sort)?.label}
          </div>
        </div>

        {/* Category pills */}
        {!category && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
            <button
              onClick={() => updateParam("category", "")}
              className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors", !category ? "bg-violet-600 text-white" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent")}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => updateParam("category", c)}
                className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors", category === c ? "bg-violet-600 text-white" : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent")}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">Try different keywords or remove some filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((course) => (
              <CourseGridCard
                key={course.id}
                course={course}
                isWishlisted={wishlisted.has(course.id)}
                onWishlist={() => handleWishlist(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
