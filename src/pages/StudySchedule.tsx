import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Plus, Trash2, Clock, BookOpen, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { StudySessionStorage, CourseStorage, EnrollmentStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { StudySession, Course } from "../lib/types";
import { formatDate, cn } from "../lib/utils";

export function StudySchedule() {
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) return;
    setSessions(StudySessionStorage.getByUser(user.id));
    const enrollments = EnrollmentStorage.getByStudent(user.id);
    const courses = enrollments.map((e) => CourseStorage.getById(e.courseId)).filter(Boolean) as Course[];
    setEnrolledCourses(courses);
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <Calendar className="w-12 h-12 text-muted-foreground" />
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const addSession = () => {
    if (!selectedCourse || !scheduledDate) return;
    const session = StudySessionStorage.create({
      userId: user.id,
      courseId: selectedCourse,
      scheduledDate,
      duration: parseInt(duration),
      reminderSet: false,
      completed: false,
      notes,
    });
    setSessions((prev) => [...prev, session]);
    setShowModal(false);
    setSelectedCourse("");
    setScheduledDate("");
    setNotes("");
    success("Session scheduled", "Your study session has been added to your schedule.");
  };

  const markComplete = (id: string) => {
    StudySessionStorage.update(id, { completed: true });
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, completed: true } : s));
  };

  const deleteSession = (id: string) => {
    StudySessionStorage.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const upcoming = sessions.filter((s) => !s.completed).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  const completed = sessions.filter((s) => s.completed);

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Study Schedule</h1>
            <p className="text-muted-foreground mt-1">Plan your learning sessions in advance</p>
          </div>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />} disabled={enrolledCourses.length === 0}>
            Schedule Session
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No courses enrolled</h3>
            <p className="text-muted-foreground mb-6">Enroll in courses to schedule your study sessions</p>
            <Button variant="gradient" onClick={() => navigate("/explore")}>Explore Courses</Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No sessions scheduled</h3>
            <p className="text-muted-foreground mb-6">Plan your study sessions to stay consistent</p>
            <Button variant="gradient" onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>Schedule First Session</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
                <div className="space-y-3">
                  {upcoming.map((session, i) => {
                    const course = enrolledCourses.find((c) => c.id === session.courseId);
                    return (
                      <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground text-sm">{course?.title || "Unknown Course"}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>{formatDate(session.scheduledDate)}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration}m</span>
                              </div>
                              {session.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{session.notes}"</p>}
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => markComplete(session.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Mark complete">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteSession(session.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Completed ({completed.length})</h2>
                <div className="space-y-2">
                  {completed.map((session) => {
                    const course = enrolledCourses.find((c) => c.id === session.courseId);
                    return (
                      <Card key={session.id} className="p-3 opacity-60">
                        <div className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <p className="text-sm text-muted-foreground flex-1">{course?.title}</p>
                          <span className="text-xs text-muted-foreground">{formatDate(session.scheduledDate)}</span>
                          <Badge variant="success" className="text-[10px]">Done</Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Schedule Study Session">
        <div className="space-y-4">
          <Select
            label="Course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            options={enrolledCourses.map((c) => ({ value: c.id, label: c.title }))}
            placeholder="Select a course"
          />
          <Input label="Date & Time" type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
          <Select
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={[
              { value: "30", label: "30 minutes" },
              { value: "60", label: "1 hour" },
              { value: "90", label: "1.5 hours" },
              { value: "120", label: "2 hours" },
            ]}
          />
          <Input label="Notes (optional)" placeholder="What will you focus on?" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button className="w-full" onClick={addSession} disabled={!selectedCourse || !scheduledDate}>
            Add to Schedule
          </Button>
        </div>
      </Modal>
    </div>
  );
}
