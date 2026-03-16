/**
 * localStorage-based data layer for Learnova.
 * Provides CRUD operations for all entities.
 */

import { generateId } from "./utils";
import type {
  User, Course, Module, Lesson, Enrollment, Review, Quiz, QuizResult,
  Notification, LearningStreak, UserBadge, UserGoal, StudySession,
  CourseQuestion, InstructorRating, Wishlist, CreatorSubscription,
  AffiliateLink, AffiliateCommission, AffiliatePayoutRequest, LearningProfile,
} from "./types";

// ─── Generic helpers ──────────────────────────────────────────────────────────

function get<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getOne<T extends { id: string }>(key: string, id: string): T | undefined {
  return get<T>(key).find((item) => item.id === id);
}

function create<T extends { id: string }>(key: string, data: Omit<T, "id">): T {
  const items = get<T>(key);
  const newItem = { ...data, id: generateId() } as T;
  items.push(newItem);
  set(key, items);
  return newItem;
}

function update<T extends { id: string }>(key: string, id: string, data: Partial<T>): T | null {
  const items = get<T>(key);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...data };
  set(key, items);
  return items[idx];
}

function remove(key: string, id: string): void {
  const items = get<{ id: string }>(key).filter((item) => item.id !== id);
  set(key, items);
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  users: "ln_users",
  courses: "ln_courses",
  modules: "ln_modules",
  lessons: "ln_lessons",
  enrollments: "ln_enrollments",
  reviews: "ln_reviews",
  quizzes: "ln_quizzes",
  quizResults: "ln_quiz_results",
  notifications: "ln_notifications",
  streaks: "ln_streaks",
  badges: "ln_badges",
  goals: "ln_goals",
  sessions: "ln_study_sessions",
  questions: "ln_questions",
  instructorRatings: "ln_instructor_ratings",
  wishlists: "ln_wishlists",
  subscriptions: "ln_subscriptions",
  affiliateLinks: "ln_affiliate_links",
  affiliateCommissions: "ln_affiliate_commissions",
  affiliatePayouts: "ln_affiliate_payouts",
  learningProfiles: "ln_learning_profiles",
  currentUser: "ln_current_user",
  chatHistories: "ln_chat_histories",
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const AuthStorage = {
  getCurrentUser: (): User | null => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.currentUser) || "null");
    } catch {
      return null;
    }
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.currentUser);
    }
  },
  register: (email: string, password: string, fullName: string, role: "creator" | "student" = "student"): User => {
    const users = get<User & { password: string }>(KEYS.users);
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error("An account with this email already exists.");

    const newUser: User & { password: string } = {
      id: generateId(),
      email: email.toLowerCase(),
      password,
      fullName,
      role,
      createdAt: new Date().toISOString(),
      brandColor: "#6366f1",
    };
    users.push(newUser);
    set(KEYS.users, users);

    // Create welcome notification
    NotificationStorage.create({
      userId: newUser.id,
      type: "welcome",
      title: "Welcome to Learnova!",
      message: `Hi ${fullName}, you're all set! Start exploring courses or create your first one.`,
      read: false,
      link: "/explore",
      createdAt: new Date().toISOString(),
    });

    // Create streak record
    StreakStorage.getOrCreate(newUser.id);

    const { password: _pw, ...user } = newUser;
    return user;
  },
  login: (email: string, password: string): User => {
    // Check for seeded admin
    if (email === "admin@learnova.io" && password === "admin123") {
      const adminUser: User = {
        id: "admin-seed",
        email: "admin@learnova.io",
        fullName: "Platform Admin",
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      AuthStorage.setCurrentUser(adminUser);
      return adminUser;
    }

    const users = get<User & { password: string }>(KEYS.users);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Invalid email or password.");

    const { password: _pw, ...cleanUser } = user;
    AuthStorage.setCurrentUser(cleanUser);
    return cleanUser;
  },
  logout: () => {
    localStorage.removeItem(KEYS.currentUser);
  },
  updateProfile: (userId: string, data: Partial<User>): User => {
    const users = get<User & { password?: string }>(KEYS.users);
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error("User not found.");
    users[idx] = { ...users[idx], ...data };
    set(KEYS.users, users);
    const { password: _pw, ...cleanUser } = users[idx];
    AuthStorage.setCurrentUser(cleanUser);
    return cleanUser;
  },
  getAllUsers: (): User[] => {
    const users = get<User & { password?: string }>(KEYS.users);
    return users.map(({ password: _pw, ...u }) => u);
  },
  deleteUser: (userId: string) => remove(KEYS.users, userId),
};

// ─── Courses ──────────────────────────────────────────────────────────────────

export const CourseStorage = {
  getAll: (): Course[] => get<Course>(KEYS.courses),
  getPublished: (): Course[] => get<Course>(KEYS.courses).filter((c) => c.status === "published"),
  getById: (id: string): Course | undefined => getOne<Course>(KEYS.courses, id),
  getByCreator: (creatorId: string): Course[] =>
    get<Course>(KEYS.courses).filter((c) => c.creatorId === creatorId),
  create: (data: Omit<Course, "id">): Course => create<Course>(KEYS.courses, data),
  update: (id: string, data: Partial<Course>): Course | null =>
    update<Course>(KEYS.courses, id, { ...data, updatedAt: new Date().toISOString() }),
  delete: (id: string) => {
    remove(KEYS.courses, id);
    // Cascade delete
    const modules = get<Module>(KEYS.modules).filter((m) => m.courseId !== id);
    set(KEYS.modules, modules);
    const lessons = get<Lesson>(KEYS.lessons).filter((l) => l.courseId !== id);
    set(KEYS.lessons, lessons);
    const enrollments = get<Enrollment>(KEYS.enrollments).filter((e) => e.courseId !== id);
    set(KEYS.enrollments, enrollments);
  },
};

// ─── Modules ─────────────────────────────────────────────────────────────────

export const ModuleStorage = {
  getByCourse: (courseId: string): Module[] =>
    get<Module>(KEYS.modules)
      .filter((m) => m.courseId === courseId)
      .sort((a, b) => a.order - b.order),
  create: (data: Omit<Module, "id">): Module => create<Module>(KEYS.modules, data),
  update: (id: string, data: Partial<Module>): Module | null =>
    update<Module>(KEYS.modules, id, data),
  delete: (id: string) => remove(KEYS.modules, id),
};

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const LessonStorage = {
  getByCourse: (courseId: string): Lesson[] =>
    get<Lesson>(KEYS.lessons)
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order),
  getByModule: (moduleId: string): Lesson[] =>
    get<Lesson>(KEYS.lessons)
      .filter((l) => l.moduleId === moduleId)
      .sort((a, b) => a.order - b.order),
  getById: (id: string): Lesson | undefined => getOne<Lesson>(KEYS.lessons, id),
  create: (data: Omit<Lesson, "id">): Lesson => create<Lesson>(KEYS.lessons, data),
  update: (id: string, data: Partial<Lesson>): Lesson | null =>
    update<Lesson>(KEYS.lessons, id, data),
  delete: (id: string) => remove(KEYS.lessons, id),
};

// ─── Enrollments ──────────────────────────────────────────────────────────────

export const EnrollmentStorage = {
  getAll: (): Enrollment[] => get<Enrollment>(KEYS.enrollments),
  getByStudent: (studentId: string): Enrollment[] =>
    get<Enrollment>(KEYS.enrollments).filter((e) => e.studentId === studentId),
  getByCourse: (courseId: string): Enrollment[] =>
    get<Enrollment>(KEYS.enrollments).filter((e) => e.courseId === courseId),
  getByStudentAndCourse: (studentId: string, courseId: string): Enrollment | undefined =>
    get<Enrollment>(KEYS.enrollments).find(
      (e) => e.studentId === studentId && e.courseId === courseId
    ),
  create: (data: Omit<Enrollment, "id">): Enrollment => {
    const enrollment = create<Enrollment>(KEYS.enrollments, data);
    // Update course student count
    const course = CourseStorage.getById(data.courseId);
    if (course) {
      CourseStorage.update(data.courseId, { totalStudents: (course.totalStudents || 0) + 1 });
    }
    return enrollment;
  },
  update: (id: string, data: Partial<Enrollment>): Enrollment | null =>
    update<Enrollment>(KEYS.enrollments, id, data),
  delete: (id: string) => remove(KEYS.enrollments, id),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const ReviewStorage = {
  getByCourse: (courseId: string): Review[] =>
    get<Review>(KEYS.reviews).filter((r) => r.courseId === courseId),
  create: (data: Omit<Review, "id">): Review => {
    const review = create<Review>(KEYS.reviews, data);
    // Recalculate course rating
    const reviews = ReviewStorage.getByCourse(data.courseId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    CourseStorage.update(data.courseId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });
    return review;
  },
  delete: (id: string) => remove(KEYS.reviews, id),
};

// ─── Quizzes ──────────────────────────────────────────────────────────────────

export const QuizStorage = {
  getByLesson: (lessonId: string): Quiz | undefined =>
    get<Quiz>(KEYS.quizzes).find((q) => q.lessonId === lessonId),
  create: (data: Omit<Quiz, "id">): Quiz => create<Quiz>(KEYS.quizzes, data),
  update: (id: string, data: Partial<Quiz>): Quiz | null =>
    update<Quiz>(KEYS.quizzes, id, data),
};

export const QuizResultStorage = {
  getByStudentAndQuiz: (studentId: string, quizId: string): QuizResult | undefined =>
    get<QuizResult>(KEYS.quizResults).find(
      (r) => r.studentId === studentId && r.quizId === quizId
    ),
  create: (data: Omit<QuizResult, "id">): QuizResult =>
    create<QuizResult>(KEYS.quizResults, data),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const NotificationStorage = {
  getByUser: (userId: string): Notification[] =>
    get<Notification>(KEYS.notifications)
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  getUnreadCount: (userId: string): number =>
    get<Notification>(KEYS.notifications).filter((n) => n.userId === userId && !n.read).length,
  create: (data: Omit<Notification, "id">): Notification =>
    create<Notification>(KEYS.notifications, data),
  markRead: (id: string) => update<Notification>(KEYS.notifications, id, { read: true }),
  markAllRead: (userId: string) => {
    const notifications = get<Notification>(KEYS.notifications).map((n) =>
      n.userId === userId ? { ...n, read: true } : n
    );
    set(KEYS.notifications, notifications);
  },
};

// ─── Streaks ──────────────────────────────────────────────────────────────────

export const StreakStorage = {
  getOrCreate: (userId: string): LearningStreak => {
    const streaks = get<LearningStreak>(KEYS.streaks);
    const existing = streaks.find((s) => s.userId === userId);
    if (existing) return existing;
    const newStreak: LearningStreak = {
      id: generateId(),
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString(),
      totalLessonsCompleted: 0,
      totalStudyMinutes: 0,
    };
    streaks.push(newStreak);
    set(KEYS.streaks, streaks);
    return newStreak;
  },
  update: (userId: string, data: Partial<LearningStreak>) => {
    const streaks = get<LearningStreak>(KEYS.streaks);
    const idx = streaks.findIndex((s) => s.userId === userId);
    if (idx !== -1) {
      streaks[idx] = { ...streaks[idx], ...data };
      set(KEYS.streaks, streaks);
    }
  },
};

// ─── Badges ───────────────────────────────────────────────────────────────────

export const BadgeStorage = {
  getByUser: (userId: string): UserBadge[] =>
    get<UserBadge>(KEYS.badges).filter((b) => b.userId === userId),
  hasBadge: (userId: string, type: string): boolean =>
    get<UserBadge>(KEYS.badges).some((b) => b.userId === userId && b.type === type),
  create: (data: Omit<UserBadge, "id">): UserBadge => create<UserBadge>(KEYS.badges, data),
};

// ─── Goals ────────────────────────────────────────────────────────────────────

export const GoalStorage = {
  getByUser: (userId: string): UserGoal[] =>
    get<UserGoal>(KEYS.goals).filter((g) => g.userId === userId),
  create: (data: Omit<UserGoal, "id">): UserGoal => create<UserGoal>(KEYS.goals, data),
  update: (id: string, data: Partial<UserGoal>): UserGoal | null =>
    update<UserGoal>(KEYS.goals, id, data),
  delete: (id: string) => remove(KEYS.goals, id),
};

// ─── Study Sessions ───────────────────────────────────────────────────────────

export const StudySessionStorage = {
  getByUser: (userId: string): StudySession[] =>
    get<StudySession>(KEYS.sessions).filter((s) => s.userId === userId),
  create: (data: Omit<StudySession, "id">): StudySession =>
    create<StudySession>(KEYS.sessions, data),
  update: (id: string, data: Partial<StudySession>): StudySession | null =>
    update<StudySession>(KEYS.sessions, id, data),
  delete: (id: string) => remove(KEYS.sessions, id),
};

// ─── Questions ────────────────────────────────────────────────────────────────

export const QuestionStorage = {
  getByLesson: (lessonId: string): CourseQuestion[] =>
    get<CourseQuestion>(KEYS.questions)
      .filter((q) => q.lessonId === lessonId)
      .sort((a, b) => b.upvotes - a.upvotes),
  create: (data: Omit<CourseQuestion, "id">): CourseQuestion =>
    create<CourseQuestion>(KEYS.questions, data),
  update: (id: string, data: Partial<CourseQuestion>): CourseQuestion | null =>
    update<CourseQuestion>(KEYS.questions, id, data),
};

// ─── Instructor Ratings ───────────────────────────────────────────────────────

export const InstructorRatingStorage = {
  getByInstructor: (instructorId: string): InstructorRating[] =>
    get<InstructorRating>(KEYS.instructorRatings).filter((r) => r.instructorId === instructorId),
  create: (data: Omit<InstructorRating, "id">): InstructorRating =>
    create<InstructorRating>(KEYS.instructorRatings, data),
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const WishlistStorage = {
  getByUser: (userId: string): Wishlist[] =>
    get<Wishlist>(KEYS.wishlists).filter((w) => w.userId === userId),
  isWishlisted: (userId: string, courseId: string): boolean =>
    get<Wishlist>(KEYS.wishlists).some((w) => w.userId === userId && w.courseId === courseId),
  toggle: (userId: string, courseId: string): boolean => {
    const wishlists = get<Wishlist>(KEYS.wishlists);
    const idx = wishlists.findIndex((w) => w.userId === userId && w.courseId === courseId);
    if (idx !== -1) {
      wishlists.splice(idx, 1);
      set(KEYS.wishlists, wishlists);
      return false;
    } else {
      wishlists.push({ id: generateId(), userId, courseId, addedAt: new Date().toISOString() });
      set(KEYS.wishlists, wishlists);
      return true;
    }
  },
};

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const SubscriptionStorage = {
  getByCreator: (creatorId: string): CreatorSubscription | undefined =>
    get<CreatorSubscription>(KEYS.subscriptions).find(
      (s) => s.creatorId === creatorId && s.status === "active"
    ),
  create: (data: Omit<CreatorSubscription, "id">): CreatorSubscription =>
    create<CreatorSubscription>(KEYS.subscriptions, data),
  update: (id: string, data: Partial<CreatorSubscription>): CreatorSubscription | null =>
    update<CreatorSubscription>(KEYS.subscriptions, id, data),
};

// ─── Affiliate ────────────────────────────────────────────────────────────────

export const AffiliateStorage = {
  getByUser: (userId: string): AffiliateLink | undefined =>
    get<AffiliateLink>(KEYS.affiliateLinks).find((a) => a.userId === userId),
  getAll: (): AffiliateLink[] => get<AffiliateLink>(KEYS.affiliateLinks),
  create: (data: Omit<AffiliateLink, "id">): AffiliateLink =>
    create<AffiliateLink>(KEYS.affiliateLinks, data),
  update: (id: string, data: Partial<AffiliateLink>): AffiliateLink | null =>
    update<AffiliateLink>(KEYS.affiliateLinks, id, data),
  getCommissions: (affiliateId: string): AffiliateCommission[] =>
    get<AffiliateCommission>(KEYS.affiliateCommissions).filter(
      (c) => c.affiliateId === affiliateId
    ),
  createCommission: (data: Omit<AffiliateCommission, "id">): AffiliateCommission =>
    create<AffiliateCommission>(KEYS.affiliateCommissions, data),
  getPayouts: (affiliateId: string): AffiliatePayoutRequest[] =>
    get<AffiliatePayoutRequest>(KEYS.affiliatePayouts).filter(
      (p) => p.affiliateId === affiliateId
    ),
  getAllPayouts: (): AffiliatePayoutRequest[] =>
    get<AffiliatePayoutRequest>(KEYS.affiliatePayouts),
  createPayout: (data: Omit<AffiliatePayoutRequest, "id">): AffiliatePayoutRequest =>
    create<AffiliatePayoutRequest>(KEYS.affiliatePayouts, data),
  updatePayout: (id: string, data: Partial<AffiliatePayoutRequest>): AffiliatePayoutRequest | null =>
    update<AffiliatePayoutRequest>(KEYS.affiliatePayouts, id, data),
};

// ─── Learning Profile ─────────────────────────────────────────────────────────

export const LearningProfileStorage = {
  getByUser: (userId: string): LearningProfile | undefined =>
    get<LearningProfile>(KEYS.learningProfiles).find((p) => p.userId === userId),
  create: (data: Omit<LearningProfile, "id">): LearningProfile =>
    create<LearningProfile>(KEYS.learningProfiles, data),
  update: (userId: string, data: Partial<LearningProfile>) => {
    const profiles = get<LearningProfile>(KEYS.learningProfiles);
    const idx = profiles.findIndex((p) => p.userId === userId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...data };
      set(KEYS.learningProfiles, profiles);
    }
  },
};

// ─── Chat History ─────────────────────────────────────────────────────────────

export const ChatStorage = {
  get: (userId: string, courseId: string): { role: string; content: string }[] => {
    try {
      const all = JSON.parse(localStorage.getItem(KEYS.chatHistories) || "{}");
      return all[`${userId}-${courseId}`] || [];
    } catch {
      return [];
    }
  },
  save: (userId: string, courseId: string, messages: { role: string; content: string }[]) => {
    try {
      const all = JSON.parse(localStorage.getItem(KEYS.chatHistories) || "{}");
      all[`${userId}-${courseId}`] = messages;
      localStorage.setItem(KEYS.chatHistories, JSON.stringify(all));
    } catch {
      // ignore
    }
  },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

export function seedDemoData() {
  if (localStorage.getItem("ln_seeded")) return;

  // Seed courses
  const courses: Omit<Course, "id">[] = [
    {
      title: "Complete React & TypeScript Masterclass",
      description: "Master React 18, TypeScript, hooks, state management, and build production-ready applications from scratch.",
      longDescription: "This comprehensive course takes you from React fundamentals to advanced patterns used by senior engineers at top tech companies. You'll build 5 real-world projects including a full-stack social app, e-commerce platform, and dashboard.",
      category: "Web Development",
      difficulty: "Intermediate",
      price: 89,
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      creatorId: "seed-creator-1",
      creatorEmail: "sarah@learnova.io",
      creatorName: "Sarah Chen",
      status: "published",
      whatYouLearn: [
        "Build modern React apps with TypeScript",
        "Master hooks: useState, useEffect, useContext, useReducer",
        "Implement advanced state management with Zustand & React Query",
        "Write clean, type-safe code with TypeScript best practices",
        "Deploy to production with CI/CD pipelines",
      ],
      requirements: [
        "Basic JavaScript knowledge",
        "Familiarity with HTML & CSS",
        "A computer with Node.js installed",
      ],
      totalLessons: 48,
      totalDuration: 2340,
      rating: 4.9,
      reviewCount: 1847,
      totalStudents: 12430,
      certificateAccentColor: "#6366f1",
      certificateBgStyle: "dark",
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "AI & Machine Learning: From Zero to Hero",
      description: "Build real-world AI applications using Python, TensorFlow, PyTorch, and the latest LLM APIs.",
      longDescription: "Dive deep into the world of artificial intelligence and machine learning. This course covers everything from mathematical foundations to deploying production ML models.",
      category: "Machine Learning",
      difficulty: "Advanced",
      price: 129,
      coverImage: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
      creatorId: "seed-creator-2",
      creatorEmail: "marcus@learnova.io",
      creatorName: "Marcus Johnson",
      status: "published",
      whatYouLearn: [
        "Understand ML algorithms from first principles",
        "Build neural networks with PyTorch",
        "Fine-tune and deploy LLMs",
        "Create production-ready AI pipelines",
        "MLOps best practices",
      ],
      requirements: [
        "Python programming experience",
        "Basic statistics knowledge",
        "Linear algebra fundamentals",
      ],
      totalLessons: 62,
      totalDuration: 3120,
      rating: 4.8,
      reviewCount: 923,
      totalStudents: 8750,
      certificateAccentColor: "#8b5cf6",
      certificateBgStyle: "dark",
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "UI/UX Design Mastery: Design Systems & Figma",
      description: "Learn professional UI/UX design, create stunning design systems, and build a portfolio that gets you hired.",
      longDescription: "Master the complete design workflow used at companies like Apple, Google, and Airbnb. Learn Figma, design principles, accessibility, and how to communicate design decisions effectively.",
      category: "Design",
      difficulty: "Beginner",
      price: 69,
      coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      creatorId: "seed-creator-3",
      creatorEmail: "luna@learnova.io",
      creatorName: "Luna Park",
      status: "published",
      whatYouLearn: [
        "Master Figma from beginner to advanced",
        "Design beautiful, accessible interfaces",
        "Create scalable design systems",
        "Conduct user research and usability testing",
        "Build a standout portfolio",
      ],
      requirements: [
        "No prior design experience needed",
        "Access to Figma (free tier works)",
      ],
      totalLessons: 35,
      totalDuration: 1680,
      rating: 4.95,
      reviewCount: 2341,
      totalStudents: 18920,
      certificateAccentColor: "#ec4899",
      certificateBgStyle: "light",
      createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Python for Data Science & Analytics",
      description: "Transform raw data into powerful insights using Python, Pandas, NumPy, and data visualization.",
      longDescription: "This hands-on course walks you through the complete data science workflow. You'll analyze real datasets, build predictive models, and create compelling visualizations.",
      category: "Data Science",
      difficulty: "Beginner",
      price: 79,
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      creatorId: "seed-creator-1",
      creatorEmail: "sarah@learnova.io",
      creatorName: "Sarah Chen",
      status: "published",
      whatYouLearn: [
        "Python programming for data analysis",
        "Data manipulation with Pandas",
        "Statistical analysis and hypothesis testing",
        "Data visualization with Matplotlib & Seaborn",
        "Machine learning with scikit-learn",
      ],
      requirements: ["No prior experience required", "A laptop or desktop computer"],
      totalLessons: 41,
      totalDuration: 1980,
      rating: 4.7,
      reviewCount: 1123,
      totalStudents: 9340,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Full-Stack Development with Next.js 14",
      description: "Build and deploy full-stack web applications with Next.js, Prisma, tRPC, and Vercel.",
      longDescription: "Learn the modern full-stack development workflow used by startups and enterprises. Build a complete SaaS application from scratch to deployment.",
      category: "Web Development",
      difficulty: "Advanced",
      price: 99,
      coverImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&q=80",
      creatorId: "seed-creator-2",
      creatorEmail: "marcus@learnova.io",
      creatorName: "Marcus Johnson",
      status: "published",
      whatYouLearn: [
        "Next.js 14 App Router & Server Components",
        "Database design with Prisma ORM",
        "Type-safe APIs with tRPC",
        "Authentication with NextAuth.js",
        "Stripe payments integration",
        "Deploy to Vercel with CI/CD",
      ],
      requirements: ["React knowledge required", "Basic Node.js understanding"],
      totalLessons: 55,
      totalDuration: 2640,
      rating: 4.85,
      reviewCount: 768,
      totalStudents: 6890,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Digital Marketing & Growth Hacking",
      description: "Master SEO, social media marketing, email campaigns, and paid ads to grow any business online.",
      longDescription: "Learn the exact strategies used by top growth marketers. From organic SEO to viral social media campaigns, you'll have a complete marketing toolkit.",
      category: "Marketing",
      difficulty: "Beginner",
      price: 0,
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      creatorId: "seed-creator-3",
      creatorEmail: "luna@learnova.io",
      creatorName: "Luna Park",
      status: "published",
      whatYouLearn: [
        "SEO fundamentals and advanced techniques",
        "Social media marketing strategy",
        "Email marketing automation",
        "Google & Meta paid advertising",
        "Analytics and conversion optimization",
      ],
      requirements: ["No experience needed", "Internet access"],
      totalLessons: 28,
      totalDuration: 1260,
      rating: 4.6,
      reviewCount: 3412,
      totalStudents: 28750,
      createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Mobile App Development with React Native",
      description: "Build iOS and Android apps with React Native, Expo, and publish them to the app stores.",
      longDescription: "Master cross-platform mobile development using React Native. You'll build 3 complete apps including a fitness tracker, social app, and e-commerce mobile app.",
      category: "Mobile Development",
      difficulty: "Intermediate",
      price: 85,
      coverImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
      creatorId: "seed-creator-2",
      creatorEmail: "marcus@learnova.io",
      creatorName: "Marcus Johnson",
      status: "published",
      whatYouLearn: [
        "React Native fundamentals",
        "Navigation with Expo Router",
        "Native device APIs (camera, GPS, notifications)",
        "App Store & Google Play publishing",
        "Performance optimization",
      ],
      requirements: ["React knowledge helpful", "iOS or Android device for testing"],
      totalLessons: 44,
      totalDuration: 2100,
      rating: 4.75,
      reviewCount: 654,
      totalStudents: 5620,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Financial Freedom: Investing & Wealth Building",
      description: "Learn stock market investing, index funds, real estate, and how to build lasting wealth.",
      longDescription: "This comprehensive finance course teaches you everything about personal finance, investing strategies, and building multiple income streams for long-term wealth.",
      category: "Finance",
      difficulty: "Beginner",
      price: 49,
      coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      creatorId: "seed-creator-3",
      creatorEmail: "luna@learnova.io",
      creatorName: "Luna Park",
      status: "published",
      whatYouLearn: [
        "Personal budgeting and debt elimination",
        "Stock market investing fundamentals",
        "Index fund and ETF strategies",
        "Real estate investment basics",
        "Tax optimization strategies",
      ],
      requirements: ["No prior knowledge needed"],
      totalLessons: 32,
      totalDuration: 1440,
      rating: 4.8,
      reviewCount: 2187,
      totalStudents: 15430,
      createdAt: new Date(Date.now() - 75 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  courses.forEach((c) => CourseStorage.create(c));
  localStorage.setItem("ln_seeded", "1");
}
