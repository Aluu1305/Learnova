import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Trash2, ChevronRight, ChevronLeft, Check,
  Image, GripVertical, Info, Sparkles, Save, Eye,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Progress } from "../components/ui/Progress";
import {
  CourseStorage, ModuleStorage, LessonStorage, SubscriptionStorage,
} from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { Course, Module, Lesson } from "../lib/types";
import { CATEGORIES, DIFFICULTIES, generateId, cn } from "../lib/utils";

const STEPS = ["Course Basics", "Structure", "Lessons", "Review & Publish"];

interface DraftModule {
  id: string;
  title: string;
  description: string;
  lessons: DraftLesson[];
  collapsed: boolean;
}

interface DraftLesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  description: string;
}

function createDraftModule(): DraftModule {
  return {
    id: generateId(),
    title: "New Module",
    description: "",
    lessons: [],
    collapsed: false,
  };
}

function createDraftLesson(): DraftLesson {
  return {
    id: generateId(),
    title: "New Lesson",
    content: "",
    videoUrl: "",
    duration: 15,
    description: "",
  };
}

export function CourseBuilder() {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id?: string }>();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Step 1 fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [price, setPrice] = useState("0");
  const [coverImage, setCoverImage] = useState("");
  const [whatYouLearn, setWhatYouLearn] = useState<string[]>(["", ""]);
  const [requirements, setRequirements] = useState<string[]>(["", ""]);

  // Step 2 — modules
  const [modules, setModules] = useState<DraftModule[]>([createDraftModule()]);

  // Load existing course for editing
  useEffect(() => {
    if (!editId) return;
    const c = CourseStorage.getById(editId);
    if (!c) return;
    setTitle(c.title);
    setDescription(c.description);
    setLongDesc(c.longDescription || "");
    setCategory(c.category);
    setDifficulty(c.difficulty);
    setPrice(String(c.price));
    setCoverImage(c.coverImage || "");
    setWhatYouLearn(c.whatYouLearn.length > 0 ? c.whatYouLearn : ["", ""]);
    setRequirements(c.requirements.length > 0 ? c.requirements : ["", ""]);

    const mods = ModuleStorage.getByCourse(editId);
    if (mods.length > 0) {
      setModules(mods.map((m) => {
        const lessons = LessonStorage.getByModule(m.id);
        return {
          id: m.id,
          title: m.title,
          description: m.description || "",
          collapsed: false,
          lessons: lessons.map((l) => ({
            id: l.id,
            title: l.title,
            content: l.content,
            videoUrl: l.videoUrl || "",
            duration: l.duration,
            description: l.description || "",
          })),
        };
      }));
    }
  }, [editId]);

  const canProceed = () => {
    if (step === 0) return title.trim() && description.trim() && category && difficulty;
    if (step === 1) return modules.length > 0 && modules[0].title.trim();
    return true;
  };

  const saveDraft = async (publish = false) => {
    if (!user) return;
    setSaving(true);
    try {
      const learnItems = whatYouLearn.filter(Boolean);
      const reqItems = requirements.filter(Boolean);
      const allLessons = modules.flatMap((m) => m.lessons);
      const totalDuration = allLessons.reduce((sum, l) => sum + l.duration, 0);

      const courseData = {
        title: title.trim(),
        description: description.trim(),
        longDescription: longDesc.trim(),
        category,
        difficulty: difficulty as "Beginner" | "Intermediate" | "Advanced",
        price: parseFloat(price) || 0,
        coverImage,
        creatorId: user.id,
        creatorEmail: user.email,
        creatorName: user.brandName || user.fullName,
        status: publish ? "published" as const : "draft" as const,
        whatYouLearn: learnItems,
        requirements: reqItems,
        totalLessons: allLessons.length,
        totalDuration,
        rating: 0,
        reviewCount: 0,
        totalStudents: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let courseId: string;
      if (editId) {
        CourseStorage.update(editId, courseData);
        courseId = editId;
      } else {
        const course = CourseStorage.create(courseData);
        courseId = course.id;
      }

      // Save modules and lessons
      if (!editId) {
        modules.forEach((mod, i) => {
          const savedMod = ModuleStorage.create({
            courseId,
            title: mod.title,
            description: mod.description,
            order: i,
          });
          mod.lessons.forEach((lesson, j) => {
            LessonStorage.create({
              courseId,
              moduleId: savedMod.id,
              title: lesson.title,
              content: lesson.content,
              videoUrl: lesson.videoUrl || undefined,
              duration: lesson.duration,
              description: lesson.description,
              order: j,
              slides: [],
              fileUrls: [],
            });
          });
        });
      }

      success(publish ? "Course published!" : "Draft saved", publish ? "Your course is now live." : "Changes saved successfully.");
      navigate("/creator");
    } catch (err) {
      error("Save failed", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addLearnItem = () => setWhatYouLearn((prev) => [...prev, ""]);
  const addReqItem = () => setRequirements((prev) => [...prev, ""]);

  const addModule = () => setModules((prev) => [...prev, createDraftModule()]);
  const removeModule = (id: string) => setModules((prev) => prev.filter((m) => m.id !== id));

  const addLesson = (moduleId: string) => {
    setModules((prev) => prev.map((m) =>
      m.id === moduleId ? { ...m, lessons: [...m.lessons, createDraftLesson()] } : m
    ));
  };
  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules((prev) => prev.map((m) =>
      m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
    ));
  };
  const updateLesson = (moduleId: string, lessonId: string, data: Partial<DraftLesson>) => {
    setModules((prev) => prev.map((m) =>
      m.id === moduleId ? { ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, ...data } : l) } : m
    ));
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-foreground">
              {editId ? "Edit Course" : "Create New Course"}
            </h1>
            <Button variant="ghost" onClick={() => navigate("/creator")} size="sm">Cancel</Button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    i < step ? "bg-emerald-500 text-white" : i === step ? "bg-violet-600 text-white" : "bg-secondary text-muted-foreground"
                  )}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn("text-sm hidden sm:block", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 mx-2 h-0.5 min-w-[20px]", i < step ? "bg-emerald-500/50" : "bg-border")} />
                )}
              </React.Fragment>
            ))}
          </div>
          <Progress value={(step / (STEPS.length - 1)) * 100} className="mt-3" size="sm" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0 — Basics */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <Input label="Course Title *" placeholder="e.g. Complete React & TypeScript Masterclass" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea label="Short Description *" placeholder="A compelling 1-2 sentence overview" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Textarea label="Detailed Description" placeholder="Full course overview, what students will build, etc." value={longDesc} onChange={(e) => setLongDesc(e.target.value)} className="min-h-[120px]" />

              <div className="grid sm:grid-cols-3 gap-4">
                <Select
                  label="Category *"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                  placeholder="Select category"
                />
                <Select
                  label="Difficulty *"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                  placeholder="Select level"
                />
                <Input label="Price (USD)" type="number" min="0" step="1" value={price} onChange={(e) => setPrice(e.target.value)} hint="Set to 0 for free" />
              </div>

              <Input
                label="Cover Image URL"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                leftIcon={<Image className="w-4 h-4" />}
                hint="Use a high-quality landscape image (16:9 recommended)"
              />
              {coverImage && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-secondary">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">What Students Will Learn</label>
                <div className="space-y-2">
                  {whatYouLearn.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => { const arr = [...whatYouLearn]; arr[i] = e.target.value; setWhatYouLearn(arr); }}
                        placeholder={`Learning outcome ${i + 1}`}
                        className="flex-1 h-10 px-3 rounded-xl border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                      {i >= 2 && <button onClick={() => setWhatYouLearn((p) => p.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={addLearnItem} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add outcome</Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Requirements</label>
                <div className="space-y-2">
                  {requirements.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => { const arr = [...requirements]; arr[i] = e.target.value; setRequirements(arr); }}
                        placeholder={`Requirement ${i + 1}`}
                        className="flex-1 h-10 px-3 rounded-xl border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      />
                      {i >= 1 && <button onClick={() => setRequirements((p) => p.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={addReqItem} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add requirement</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1 — Structure */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Course Modules</h2>
                <Button size="sm" onClick={addModule} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Module</Button>
              </div>
              {modules.map((mod, mi) => (
                <Card key={mod.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-2.5 shrink-0 cursor-grab" />
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <input
                          value={mod.title}
                          onChange={(e) => setModules((prev) => prev.map((m) => m.id === mod.id ? { ...m, title: e.target.value } : m))}
                          placeholder="Module title"
                          className="flex-1 h-9 px-3 rounded-lg border border-border bg-secondary/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-medium"
                        />
                        {modules.length > 1 && (
                          <button onClick={() => removeModule(mod.id)} className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{mod.lessons.length} lesson{mod.lessons.length !== 1 && "s"}</p>
                      <Button size="sm" variant="ghost" onClick={() => addLesson(mod.id)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                        Add Lesson
                      </Button>
                      {mod.lessons.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {mod.lessons.map((lesson, li) => (
                            <div key={lesson.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                              <span className="text-xs text-muted-foreground w-5">{li + 1}.</span>
                              <input
                                value={lesson.title}
                                onChange={(e) => updateLesson(mod.id, lesson.id, { title: e.target.value })}
                                placeholder="Lesson title"
                                className="flex-1 h-7 px-2 rounded-md border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                              />
                              <input
                                type="number"
                                value={lesson.duration}
                                onChange={(e) => updateLesson(mod.id, lesson.id, { duration: parseInt(e.target.value) || 15 })}
                                className="w-14 h-7 px-2 rounded-md border border-border bg-card text-xs text-foreground focus:outline-none"
                                min="1"
                                title="Duration (minutes)"
                              />
                              <span className="text-xs text-muted-foreground">min</span>
                              <button onClick={() => removeLesson(mod.id, lesson.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Step 2 — Lesson Content */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Add lesson content, video links, and resources. You can always edit these later.
                </p>
              </div>
              {modules.map((mod) => (
                <div key={mod.id} className="space-y-3">
                  <h3 className="font-semibold text-foreground">{mod.title}</h3>
                  {mod.lessons.map((lesson) => (
                    <Card key={lesson.id} className="p-4 space-y-3">
                      <h4 className="text-sm font-medium text-foreground">{lesson.title}</h4>
                      <Textarea
                        label="Lesson Content (Markdown)"
                        value={lesson.content}
                        onChange={(e) => updateLesson(mod.id, lesson.id, { content: e.target.value })}
                        placeholder="Write your lesson content here. Supports **bold**, *italic*, headings, code blocks, etc."
                        className="min-h-[100px] font-mono text-xs"
                      />
                      <Input
                        label="Video URL (optional)"
                        value={lesson.videoUrl}
                        onChange={(e) => updateLesson(mod.id, lesson.id, { videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </Card>
                  ))}
                </div>
              ))}
            </motion.div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Review Your Course</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    ["Title", title],
                    ["Category", category],
                    ["Difficulty", difficulty],
                    ["Price", `$${price}`],
                    ["Modules", modules.length],
                    ["Lessons", modules.reduce((sum, m) => sum + m.lessons.length, 0)],
                    ["Learning Outcomes", whatYouLearn.filter(Boolean).length],
                    ["Requirements", requirements.filter(Boolean).length],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">{String(value) || "—"}</p>
                    </div>
                  ))}
                </div>
                {coverImage && (
                  <div className="mt-4 w-full max-w-xs aspect-video rounded-xl overflow-hidden">
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" leftIcon={<Save className="w-4 h-4" />} loading={saving} onClick={() => saveDraft(false)}>
                  Save as Draft
                </Button>
                <Button variant="gradient" className="flex-1" leftIcon={<Eye className="w-4 h-4" />} loading={publishing} onClick={() => saveDraft(true)}>
                  Publish Course
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        {step < 3 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Continue
            </Button>
          </div>
        )}
        {step === 3 && (
          <Button variant="ghost" className="mt-4" onClick={() => setStep((s) => s - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Back
          </Button>
        )}
      </div>
    </div>
  );
}
