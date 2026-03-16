import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ChevronLeft, ChevronRight, Menu, X, Check, CheckCircle, Play,
  Brain, MessageSquare, ListChecks, Award, ChevronDown, Send, Loader2,
  BookOpen, Clock, RotateCcw, Maximize2, Minimize2,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";
import {
  CourseStorage, ModuleStorage, LessonStorage, EnrollmentStorage,
  QuizStorage, QuizResultStorage, StreakStorage, BadgeStorage,
  NotificationStorage, ChatStorage,
} from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { Course, Module, Lesson, Quiz, QuizResult, Enrollment } from "../lib/types";
import { cn, generateId } from "../lib/utils";
import confetti from "canvas-confetti";

// Simulated AI responses
function getAITutorResponse(question: string, lessonContent: string): string {
  const q = question.toLowerCase();
  if (q.includes("what") && q.includes("this lesson")) {
    return `This lesson covers: ${lessonContent.slice(0, 200)}... The key concepts are designed to build your understanding progressively. What specific aspect would you like me to explain further?`;
  }
  if (q.includes("example")) {
    return "Great question! Here's a practical example:\n\n```javascript\n// Example code demonstrating the concept\nconst example = () => {\n  // Your implementation here\n  return 'Result';\n};\n```\n\nThis pattern is commonly used in real-world applications to solve similar problems.";
  }
  if (q.includes("why")) {
    return "That's a thoughtful question! The reason for this approach is to ensure code maintainability and scalability. When you understand the 'why' behind concepts, you can apply them more effectively in novel situations. Would you like me to elaborate on any specific aspect?";
  }
  if (q.includes("how")) {
    return "Here's a step-by-step breakdown:\n\n1. **Start** with understanding the core concept\n2. **Practice** with simple examples\n3. **Apply** to real projects\n4. **Refine** based on feedback\n\nThe key is consistent practice. Which step would you like to explore further?";
  }
  return `Great question! Based on the lesson content, ${lessonContent.slice(0, 100)}...\n\nI'd recommend focusing on the core principles first. The concept you're asking about is fundamental to this topic. Would you like me to provide more specific examples or explain any particular aspect in detail?`;
}

function generateQuizQuestions(lessonContent: string) {
  return [
    {
      id: generateId(),
      question: "What is the primary purpose of the concept covered in this lesson?",
      options: [
        "To improve code organization and maintainability",
        "To make applications run faster",
        "To reduce file sizes",
        "To simplify database queries",
      ],
      correctIndex: 0,
      explanation: "The primary purpose is to improve code organization and maintainability, making it easier to work with complex systems.",
    },
    {
      id: generateId(),
      question: "Which of the following best describes a key benefit discussed?",
      options: [
        "Increased complexity",
        "Better separation of concerns",
        "More verbose syntax",
        "Reduced functionality",
      ],
      correctIndex: 1,
      explanation: "Separation of concerns is a fundamental principle that allows different parts of a system to be developed and maintained independently.",
    },
    {
      id: generateId(),
      question: "When should you apply the techniques from this lesson?",
      options: [
        "Only in large enterprise projects",
        "Never, it's just theoretical",
        "Whenever building maintainable, scalable applications",
        "Only when working with databases",
      ],
      correctIndex: 2,
      explanation: "These techniques are applicable whenever you want to build maintainable, scalable applications, regardless of project size.",
    },
    {
      id: generateId(),
      question: "What is the recommended approach when implementing this concept?",
      options: [
        "Implement everything at once",
        "Start simple and iterate",
        "Avoid using it in production",
        "Only use it in testing environments",
      ],
      correctIndex: 1,
      explanation: "Starting simple and iterating is the best approach, allowing you to build understanding progressively and catch issues early.",
    },
    {
      id: generateId(),
      question: "How does this concept relate to overall software quality?",
      options: [
        "It has no impact on software quality",
        "It decreases code quality",
        "It significantly improves code quality and developer experience",
        "It only affects performance",
      ],
      correctIndex: 2,
      explanation: "This concept significantly improves code quality by making code more readable, testable, and maintainable.",
    },
  ];
}

function AITutor({ lesson, courseTitle, userId, courseId }: { lesson: Lesson; courseTitle: string; userId: string; courseId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = ChatStorage.get(userId, courseId);
    if (saved.length > 0) setMessages(saved);
    else {
      const welcome = [{ role: "assistant", content: `Hi! I'm your AI tutor for this course. I'm here to help you understand **${lesson.title}** and answer any questions you have. What would you like to know?` }];
      setMessages(welcome);
    }
  }, [lesson.id, userId, courseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response = getAITutorResponse(input, lesson.content || lesson.description || "");
      const aiMsg = { role: "assistant", content: response };
      const final = [...updated, aiMsg];
      setMessages(final);
      ChatStorage.save(userId, courseId, final);
      setLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const suggestions = ["What is this lesson about?", "Give me an example", "Why is this important?", "How do I apply this?"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
              msg.role === "user"
                ? "bg-violet-600 text-white"
                : "bg-secondary text-foreground"
            )}>
              <div className="prose-dark text-sm [&>*]:mb-1 last:[&>*]:mb-0"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button key={s} onClick={() => { setInput(s); }} className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask anything about this lesson..."
          className="flex-1 h-9 px-3 rounded-xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
        <Button size="icon-sm" onClick={send} disabled={!input.trim() || loading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function QuizPanel({ lesson, userId }: { lesson: Lesson; userId: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const existing = QuizStorage.getByLesson(lesson.id);
    if (existing) {
      setQuiz(existing);
      const existingResult = QuizResultStorage.getByStudentAndQuiz(userId, existing.id);
      if (existingResult) { setResult(existingResult); setSubmitted(true); setAnswers(existingResult.answers); }
    }
  }, [lesson.id, userId]);

  const generateQuiz = () => {
    setGenerating(true);
    setTimeout(() => {
      const questions = generateQuizQuestions(lesson.content || lesson.description || "");
      const newQuiz = QuizStorage.create({ lessonId: lesson.id, courseId: lesson.courseId, questions });
      setQuiz(newQuiz);
      setAnswers(new Array(questions.length).fill(-1));
      setGenerating(false);
    }, 1500);
  };

  const submit = () => {
    if (!quiz) return;
    const score = answers.reduce((correct, ans, i) => ans === quiz.questions[i].correctIndex ? correct + 1 : correct, 0);
    const pct = Math.round((score / quiz.questions.length) * 100);
    const qResult = QuizResultStorage.create({
      quizId: quiz.id,
      studentId: userId,
      score: pct,
      answers,
      passed: pct >= 70,
      completedAt: new Date().toISOString(),
    });
    setResult(qResult);
    setSubmitted(true);
    if (pct === 100) confetti({ particleCount: 100, spread: 70 });
  };

  const retry = () => {
    setSubmitted(false);
    setResult(null);
    setAnswers(quiz ? new Array(quiz.questions.length).fill(-1) : []);
  };

  if (!quiz) {
    return (
      <div className="p-4 flex flex-col items-center justify-center gap-4 h-full text-center">
        <ListChecks className="w-10 h-10 text-violet-400" />
        <div>
          <p className="font-semibold text-foreground">Test Your Knowledge</p>
          <p className="text-xs text-muted-foreground mt-1">AI-generated quiz based on this lesson</p>
        </div>
        <Button onClick={generateQuiz} loading={generating} leftIcon={<Brain className="w-4 h-4" />}>
          Generate Quiz
        </Button>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="p-4 overflow-y-auto scrollbar-thin space-y-4">
        <div className={cn("p-4 rounded-xl text-center", result.passed ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20")}>
          <p className="text-3xl font-bold text-foreground">{result.score}%</p>
          <p className={cn("text-sm font-medium mt-1", result.passed ? "text-emerald-400" : "text-red-400")}>
            {result.passed ? "Passed! 🎉" : "Keep trying! 💪"}
          </p>
          {result.score === 100 && <p className="text-xs text-amber-400 mt-1">Perfect score! Quiz Ace badge earned!</p>}
        </div>
        {quiz.questions.map((q, i) => {
          const isCorrect = answers[i] === q.correctIndex;
          return (
            <div key={q.id} className="space-y-2">
              <p className="text-xs font-medium text-foreground">{i + 1}. {q.question}</p>
              {q.options.map((opt, j) => (
                <div key={j} className={cn("px-3 py-2 rounded-lg text-xs", j === q.correctIndex ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : j === answers[i] && !isCorrect ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-muted-foreground")}>
                  {opt}
                </div>
              ))}
              <p className="text-xs text-muted-foreground italic">{q.explanation}</p>
            </div>
          );
        })}
        <Button variant="outline" className="w-full" onClick={retry} leftIcon={<RotateCcw className="w-4 h-4" />}>Retry Quiz</Button>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto scrollbar-thin space-y-4">
      <p className="text-xs text-muted-foreground">{quiz.questions.length} questions · 70% to pass</p>
      {quiz.questions.map((q, i) => (
        <div key={q.id} className="space-y-2">
          <p className="text-xs font-medium text-foreground">{i + 1}. {q.question}</p>
          <div className="space-y-1.5">
            {q.options.map((opt, j) => (
              <button
                key={j}
                onClick={() => { const a = [...answers]; a[i] = j; setAnswers(a); }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs border transition-all",
                  answers[i] === j
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-400"
                    : "border-border text-muted-foreground hover:border-violet-500/30 hover:text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Button className="w-full" onClick={submit} disabled={answers.some((a) => a === -1)}>
        Submit Quiz
      </Button>
    </div>
  );
}

export function LearningInterface() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<"tutor" | "quiz" | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!courseId || !user) return;
    const c = CourseStorage.getById(courseId);
    if (!c) { navigate("/explore"); return; }
    setCourse(c);

    const mods = ModuleStorage.getByCourse(courseId);
    setModules(mods);
    const map: Record<string, Lesson[]> = {};
    mods.forEach((m) => { map[m.id] = LessonStorage.getByModule(m.id); });
    setLessonsByModule(map);

    // Set first lesson
    const firstMod = mods[0];
    if (firstMod && map[firstMod.id]?.[0]) setCurrentLesson(map[firstMod.id][0]);

    const enr = EnrollmentStorage.getByStudentAndCourse(user.id, courseId);
    if (!enr) { navigate(`/course/${courseId}`); return; }
    setEnrollment(enr);
  }, [courseId, user, navigate]);

  const allLessons = modules.flatMap((m) => lessonsByModule[m.id] || []);

  const markComplete = () => {
    if (!currentLesson || !enrollment || !user) return;
    if (enrollment.completedLessons.includes(currentLesson.id)) return;

    const completed = [...enrollment.completedLessons, currentLesson.id];
    const progress = Math.round((completed.length / allLessons.length) * 100);
    const status = progress === 100 ? "completed" as const : "active" as const;

    const updated = EnrollmentStorage.update(enrollment.id, {
      completedLessons: completed,
      progress,
      status,
      ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}),
    });
    setEnrollment(updated!);

    // Update streak
    const streak = StreakStorage.getOrCreate(user.id);
    StreakStorage.update(user.id, {
      totalLessonsCompleted: (streak.totalLessonsCompleted || 0) + 1,
      lastActivityDate: new Date().toISOString(),
      currentStreak: (streak.currentStreak || 0) + (completed.length % 3 === 0 ? 1 : 0),
    });

    // Award badges
    if (completed.length === 1 && !BadgeStorage.hasBadge(user.id, "first_course")) {
      BadgeStorage.create({ userId: user.id, type: "first_course", name: "First Step", description: "Enrolled in your first course", icon: "🎯", earnedAt: new Date().toISOString() });
    }
    if (status === "completed" && !BadgeStorage.hasBadge(user.id, "first_completion")) {
      BadgeStorage.create({ userId: user.id, type: "first_completion", name: "Course Conqueror", description: "Completed your first course", icon: "🏆", earnedAt: new Date().toISOString() });
      confetti({ particleCount: 150, spread: 80 });
      NotificationStorage.create({
        userId: user.id,
        type: "completion",
        title: "Course Completed! 🎉",
        message: `You completed "${course?.title}"! Your certificate is ready.`,
        read: false,
        link: `/course/${courseId}`,
        createdAt: new Date().toISOString(),
      });
    }

    // Navigate to next lesson
    const idx = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (idx < allLessons.length - 1) {
      setCurrentLesson(allLessons[idx + 1]);
    } else {
      success("🎉 Course Complete!", "You've finished every lesson. Your certificate is ready!");
    }
  };

  const goToLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const isCompleted = (lessonId: string) => enrollment?.completedLessons.includes(lessonId);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen bg-background overflow-hidden", fullscreen && "fixed inset-0 z-50")}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="h-full border-r border-border bg-card flex flex-col overflow-hidden shrink-0"
          >
            {/* Course header */}
            <div className="p-4 border-b border-border shrink-0">
              <button onClick={() => navigate(`/course/${courseId}`)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back to course
              </button>
              <h2 className="text-sm font-semibold text-foreground line-clamp-2">{course.title}</h2>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{enrollment?.completedLessons.length} / {allLessons.length} done</span>
                  <span>{enrollment?.progress}%</span>
                </div>
                <Progress value={enrollment?.progress || 0} size="sm" />
              </div>
            </div>

            {/* Lesson list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {modules.map((mod) => {
                const lessons = lessonsByModule[mod.id] || [];
                return (
                  <div key={mod.id}>
                    <div className="px-4 py-2.5 bg-secondary/50 border-b border-border">
                      <p className="text-xs font-semibold text-foreground">{mod.title}</p>
                      <p className="text-xs text-muted-foreground">{lessons.filter((l) => isCompleted(l.id)).length}/{lessons.length}</p>
                    </div>
                    {lessons.map((lesson) => {
                      const active = lesson.id === currentLesson.id;
                      const done = isCompleted(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => goToLesson(lesson)}
                          className={cn(
                            "w-full flex items-start gap-2.5 px-4 py-3 text-left border-b border-border/50 transition-all",
                            active ? "bg-violet-500/10 border-l-2 border-l-violet-500" : "hover:bg-accent"
                          )}
                        >
                          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                            done ? "border-emerald-500 bg-emerald-500" : active ? "border-violet-500" : "border-border"
                          )}>
                            {done && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-xs font-medium line-clamp-2 leading-snug", active ? "text-violet-400" : done ? "text-muted-foreground" : "text-foreground")}>
                              {lesson.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{lesson.duration}m</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground line-clamp-1">{currentLesson.title}</p>
              <p className="text-xs text-muted-foreground">{currentIndex + 1} of {allLessons.length} · {currentLesson.duration}m</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activePanel === "tutor" ? "default" : "outline"}
              onClick={() => setActivePanel(activePanel === "tutor" ? null : "tutor")}
              leftIcon={<Brain className="w-3.5 h-3.5" />}
              className="hidden sm:flex"
            >
              AI Tutor
            </Button>
            <Button
              size="sm"
              variant={activePanel === "quiz" ? "default" : "outline"}
              onClick={() => setActivePanel(activePanel === "quiz" ? null : "quiz")}
              leftIcon={<ListChecks className="w-3.5 h-3.5" />}
              className="hidden sm:flex"
            >
              Quiz
            </Button>
            <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Lesson content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-3xl mx-auto px-6 py-8">
              {/* Video player */}
              {currentLesson.videoUrl && (
                <div className="video-container rounded-xl overflow-hidden mb-6 border border-border">
                  {currentLesson.videoUrl.includes("youtube") ? (
                    <iframe
                      src={currentLesson.videoUrl.replace("watch?v=", "embed/")}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video controls className="w-full" src={currentLesson.videoUrl} />
                  )}
                </div>
              )}

              {/* Lesson content */}
              <div className="prose-dark">
                {currentLesson.content ? (
                  <div className="[&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-foreground [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-foreground [&>h2]:mb-3 [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>li]:text-muted-foreground [&>pre]:bg-secondary [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:mb-4 [&>code]:bg-secondary [&>code]:px-1.5 [&>code]:rounded [&>code]:text-violet-400">
                    <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No content added yet. Check back later!</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
                <Button
                  variant="outline"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentLesson(allLessons[currentIndex - 1])}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {!isCompleted(currentLesson.id) ? (
                    <Button onClick={markComplete} leftIcon={<CheckCircle className="w-4 h-4" />}>
                      Mark Complete
                    </Button>
                  ) : (
                    <Badge variant="success" className="px-3 py-1.5">
                      <Check className="w-3 h-3 mr-1" /> Completed
                    </Badge>
                  )}
                  {currentIndex < allLessons.length - 1 && (
                    <Button
                      variant={isCompleted(currentLesson.id) ? "default" : "outline"}
                      onClick={() => setCurrentLesson(allLessons[currentIndex + 1])}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <AnimatePresence>
            {activePanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="h-full border-l border-border bg-card flex flex-col overflow-hidden shrink-0"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActivePanel("tutor")}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activePanel === "tutor" ? "bg-violet-500/10 text-violet-400" : "text-muted-foreground hover:text-foreground")}
                    >
                      <Brain className="w-3.5 h-3.5 inline mr-1" /> AI Tutor
                    </button>
                    <button
                      onClick={() => setActivePanel("quiz")}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activePanel === "quiz" ? "bg-violet-500/10 text-violet-400" : "text-muted-foreground hover:text-foreground")}
                    >
                      <ListChecks className="w-3.5 h-3.5 inline mr-1" /> Quiz
                    </button>
                  </div>
                  <button onClick={() => setActivePanel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  {activePanel === "tutor" && user && (
                    <AITutor lesson={currentLesson} courseTitle={course.title} userId={user.id} courseId={course.id} />
                  )}
                  {activePanel === "quiz" && user && (
                    <QuizPanel lesson={currentLesson} userId={user.id} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
