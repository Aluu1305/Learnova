import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Sparkles, BookOpen, Users, Star, TrendingUp, Zap, Brain,
  Code, Palette, BarChart, Briefcase, Globe, ArrowRight, Play,
  CheckCircle, Crown, Shield, ChevronRight, GraduationCap,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { CourseStorage } from "../lib/storage";
import type { Course } from "../lib/types";
import { formatCurrency, formatNumber, getCategoryEmoji } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { StarRating } from "../components/ui/StarRating";

const categories = [
  { name: "Web Development", icon: Code, color: "from-blue-500 to-cyan-500" },
  { name: "Machine Learning", icon: Brain, color: "from-violet-500 to-purple-500" },
  { name: "Design", icon: Palette, color: "from-pink-500 to-rose-500" },
  { name: "Data Science", icon: BarChart, color: "from-emerald-500 to-teal-500" },
  { name: "Business", icon: Briefcase, color: "from-amber-500 to-orange-500" },
  { name: "Marketing", icon: Globe, color: "from-indigo-500 to-blue-500" },
];

const stats = [
  { label: "Active Learners", value: "50K+", icon: Users },
  { label: "Expert Courses", value: "1,200+", icon: BookOpen },
  { label: "Average Rating", value: "4.8★", icon: Star },
  { label: "Completion Rate", value: "94%", icon: TrendingUp },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Our AI tutor adapts to your learning style, answers questions in real-time, and generates personalized quizzes to solidify your knowledge.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Build Courses with AI",
    description: "Creators can generate complete courses with modules, lessons, and visual slides in minutes — powered by advanced AI that understands your content.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Crown,
    title: "Earn What You're Worth",
    description: "Set your own prices, keep 80% of revenue, and scale your income with our affiliate program and Pro creator tools.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: GraduationCap,
    title: "Certificates & Achievements",
    description: "Earn industry-recognized certificates, unlock achievement badges, and build a learning profile that showcases your growth.",
    color: "from-blue-500 to-indigo-600",
  },
];

const howItWorksCreator = [
  { step: "01", title: "Create Your Account", desc: "Sign up as a creator in under 2 minutes." },
  { step: "02", title: "Build with AI", desc: "Use our AI builder to generate professional courses instantly." },
  { step: "03", title: "Publish & Earn", desc: "Set your price, publish, and start earning from day one." },
];

const howItWorksStudent = [
  { step: "01", title: "Discover Courses", desc: "Browse 1,200+ expert-crafted courses across 15 categories." },
  { step: "02", title: "Learn with AI", desc: "Get a personalized AI tutor that answers all your questions." },
  { step: "03", title: "Earn Certificates", desc: "Complete courses and earn verifiable certificates." },
];

function CourseCard({ course }: { course: Course }) {
  const navigate = useNavigate();
  return (
    <div
      className="group bg-card rounded-2xl border border-border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-500/30"
      onClick={() => navigate(`/course/${course.id}`)}
    >
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {course.coverImage ? (
          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
            <BookOpen className="w-12 h-12 text-violet-400/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant={course.price === 0 ? "success" : "default"}>
            {course.price === 0 ? "Free" : formatCurrency(course.price)}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-black/40 backdrop-blur-sm border-white/20 text-white text-[10px]">
            {course.difficulty}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-violet-400 font-medium mb-1">{course.category}</p>
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-2 group-hover:text-violet-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">by {course.creatorName}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating value={course.rating} size="sm" />
            <span className="text-xs font-semibold text-amber-400">{course.rating}</span>
            <span className="text-xs text-muted-foreground">({formatNumber(course.reviewCount)})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {formatNumber(course.totalStudents)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  useEffect(() => {
    const courses = CourseStorage.getPublished()
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, 6);
    setFeaturedCourses(courses);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-20 pt-8 md:pt-16">
        {/* Background */}
        <div className="absolute inset-0 mesh-gradient pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="gradient" className="mb-6 inline-flex gap-2 py-1 px-3">
              <Sparkles className="w-3 h-3" />
              AI-Powered Learning Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Learn Without{" "}
              <span className="gradient-text">Limits</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              The platform where creators build transformative courses and learners unlock their full potential — all supercharged by AI.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search any topic, skill, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
                />
              </div>
              <Button type="submit" size="lg" className="px-6">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>Trending:</span>
              {["React", "Python", "AI/ML", "Design", "Finance"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/explore?q=${tag}`)}
                  className="px-2.5 py-1 rounded-full bg-secondary hover:bg-accent text-foreground transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            {!user && (
              <>
                <Button size="xl" variant="gradient" onClick={() => navigate("/register")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Learning Free
                </Button>
                <Button size="xl" variant="outline" onClick={() => navigate("/register?role=creator")}>
                  Become a Creator
                </Button>
              </>
            )}
            {user && (
              <>
                <Button size="xl" variant="gradient" onClick={() => navigate("/explore")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Courses
                </Button>
                {(user.role === "creator" || user.role === "admin") && (
                  <Button size="xl" variant="outline" onClick={() => navigate("/creator/create")}>
                    Create a Course
                  </Button>
                )}
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-5 h-5 text-violet-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Explore by Category</h2>
            <p className="text-muted-foreground mt-1">15 categories, thousands of courses</p>
          </div>
          <Link to="/explore" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              onClick={() => navigate(`/explore?category=${cat.name}`)}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                <cat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16 bg-card/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Featured Courses</h2>
                <p className="text-muted-foreground mt-1">Hand-picked by our editorial team</p>
              </div>
              <Link to="/explore" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="default" className="mb-4">Why Learnova</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Smarter Way to Learn & Teach
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've reimagined online education from the ground up — with AI at the core, designed for results.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex gap-5 p-6 rounded-2xl border border-border bg-card hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground">Simple for everyone — creators and learners alike</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-violet-400" />
                </div>
                For Creators
              </h3>
              <div className="space-y-4">
                {howItWorksCreator.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-6" onClick={() => navigate("/register?role=creator")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Creating
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                For Students
              </h3>
              <div className="space-y-4">
                {howItWorksStudent.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-6" onClick={() => navigate("/explore")} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="default" className="mb-4">Creator Plans</Badge>
          <h2 className="text-3xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Start free, scale as you grow</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
          {[
            {
              name: "Starter",
              price: "$20",
              period: "/month",
              description: "Perfect for getting started",
              features: ["Up to 3 courses", "Basic analytics", "Student management", "Earn revenue", "Email support"],
              cta: "Get Started",
              variant: "outline" as const,
            },
            {
              name: "Pro",
              price: "$50",
              period: "/month",
              description: "For serious creators",
              features: ["Unlimited courses", "Deep analytics", "Revenue breakdown", "Homepage featuring", "AI course builder", "Priority support"],
              cta: "Go Pro",
              variant: "gradient" as const,
              popular: true,
            },
          ].map((plan) => (
            <Card key={plan.name} className={`p-6 ${plan.popular ? "border-violet-500/50 shadow-xl shadow-violet-500/10" : ""}`}>
              {plan.popular && (
                <Badge variant="gradient" className="mb-3">Most Popular</Badge>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2 mb-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.variant}
                className="w-full"
                onClick={() => navigate(user ? "/subscription" : "/register?role=creator")}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join 50,000+ learners who are already building skills that matter. Start free today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="xl" variant="gradient" onClick={() => navigate(user ? "/explore" : "/register")} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {user ? "Explore Courses" : "Join for Free"}
            </Button>
            <Button size="xl" variant="outline" onClick={() => navigate("/explore")}>
              Browse Catalog
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
