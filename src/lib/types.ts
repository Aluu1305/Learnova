export type Role = "admin" | "creator" | "student";
export type CourseStatus = "draft" | "published";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type SubscriptionPlan = "starter" | "pro";
export type SubscriptionStatus = "active" | "cancelled" | "expired";
export type EnrollmentStatus = "active" | "completed";
export type GoalStatus = "active" | "completed" | "paused";
export type PayoutStatus = "pending" | "approved" | "rejected";
export type CommissionStatus = "pending" | "paid";
export type SlideStyle = "slides" | "infographic" | "mindmap" | "timeline" | "written";
export type NotificationType =
  | "enrollment"
  | "progress"
  | "completion"
  | "new_student"
  | "course_view"
  | "review"
  | "welcome"
  | "achievement"
  | "payout";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatar?: string;
  bio?: string;
  createdAt: string;
  // Creator branding
  brandName?: string;
  brandTagline?: string;
  brandBio?: string;
  brandLogo?: string;
  brandColor?: string;
  brandTwitter?: string;
  brandLinkedIn?: string;
  brandWebsite?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  difficulty: Difficulty;
  price: number;
  coverImage?: string;
  creatorId: string;
  creatorEmail: string;
  creatorName: string;
  status: CourseStatus;
  whatYouLearn: string[];
  requirements: string[];
  totalLessons: number;
  totalDuration: number; // minutes
  rating: number;
  reviewCount: number;
  totalStudents: number;
  certificateAccentColor?: string;
  certificateBgStyle?: "dark" | "light" | "cream";
  certificateSignature?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
}

export interface Slide {
  icon?: string;
  title: string;
  body: string;
  bullets?: string[];
  image?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string;
  fileUrls?: string[];
  slides?: Slide[];
  slideStyle?: SlideStyle;
  order: number;
  duration: number; // minutes
  description?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  completedLessons: string[];
  progress: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
}

export interface Review {
  id: string;
  courseId: string;
  reviewerEmail: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  courseId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  answers: number[];
  passed: boolean;
  completedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface LearningStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  totalLessonsCompleted: number;
  totalStudyMinutes: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface UserGoal {
  id: string;
  userId: string;
  title: string;
  targetDate: string;
  weeklyHours: number;
  status: GoalStatus;
  relatedCourseIds: string[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  courseId: string;
  scheduledDate: string;
  duration: number;
  reminderSet: boolean;
  completed: boolean;
  notes?: string;
}

export interface CourseQuestion {
  id: string;
  lessonId: string;
  courseId: string;
  authorId: string;
  authorName: string;
  question: string;
  answer?: string;
  answered: boolean;
  upvotes: number;
  createdAt: string;
}

export interface InstructorRating {
  id: string;
  instructorId: string;
  reviewerId: string;
  reviewerName: string;
  overallRating: number;
  communicationScore: number;
  expertiseScore: number;
  helpfulnessScore: number;
  comment: string;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  courseId: string;
  addedAt: string;
}

export interface CreatorSubscription {
  id: string;
  creatorId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
}

export interface AffiliateLink {
  id: string;
  userId: string;
  userName: string;
  code: string;
  totalClicks: number;
  totalEarnings: number;
  paidAmount: number;
  commissionRate: number;
  createdAt: string;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  affiliateCode: string;
  referredUserId: string;
  courseId: string;
  courseTitle: string;
  commissionAmount: number;
  commissionRate: number;
  status: CommissionStatus;
  createdAt: string;
}

export interface AffiliatePayoutRequest {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  paymentMethod: string;
  status: PayoutStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface LearningProfile {
  id: string;
  userId: string;
  goals: string[];
  interests: string[];
  experienceLevel: string;
  weeklyTimeAvailable: number;
  learningStyle: string;
  aiPersona?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
