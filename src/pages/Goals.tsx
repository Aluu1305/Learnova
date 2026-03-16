import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Plus, Check, Pause, Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { GoalStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { UserGoal } from "../lib/types";
import { formatDate, cn } from "../lib/utils";

export function Goals() {
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("5");

  useEffect(() => {
    if (user) setGoals(GoalStorage.getByUser(user.id));
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <Target className="w-12 h-12 text-muted-foreground" />
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const addGoal = () => {
    if (!title.trim()) return;
    const goal = GoalStorage.create({
      userId: user.id,
      title: title.trim(),
      targetDate: targetDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      weeklyHours: parseInt(weeklyHours) || 5,
      status: "active",
      relatedCourseIds: [],
      createdAt: new Date().toISOString(),
    });
    setGoals((prev) => [...prev, goal]);
    setTitle("");
    setTargetDate("");
    setShowModal(false);
    success("Goal created", "Start working toward your goal!");
  };

  const updateStatus = (id: string, status: "active" | "completed" | "paused") => {
    GoalStorage.update(id, { status });
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, status } : g));
  };

  const deleteGoal = (id: string) => {
    GoalStorage.delete(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const paused = goals.filter((g) => g.status === "paused");

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Learning Goals</h1>
            <p className="text-muted-foreground mt-1">Set targets and track your progress</p>
          </div>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>Add Goal</Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {goals.length === 0 ? (
          <div className="text-center py-16">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-6">Create your first learning goal to stay focused</p>
            <Button variant="gradient" onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>Create Goal</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {[{ label: "Active Goals", goals: active, color: "emerald" }, { label: "Paused", goals: paused, color: "amber" }, { label: "Completed", goals: completed, color: "violet" }].map(({ label, goals: list, color }) => (
              list.length > 0 && (
                <div key={label}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</h2>
                  <div className="space-y-3">
                    {list.map((goal, i) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              goal.status === "completed" ? "bg-emerald-500/10" : goal.status === "paused" ? "bg-amber-500/10" : "bg-violet-500/10"
                            )}>
                              <Target className={cn("w-4 h-4",
                                goal.status === "completed" ? "text-emerald-400" : goal.status === "paused" ? "text-amber-400" : "text-violet-400"
                              )} />
                            </div>
                            <div className="flex-1">
                              <p className={cn("font-semibold text-foreground", goal.status === "completed" && "line-through opacity-60")}>{goal.title}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {goal.targetDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(goal.targetDate)}</span>}
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {goal.weeklyHours}h/week</span>
                                <Badge variant={goal.status === "completed" ? "success" : goal.status === "paused" ? "warning" : "default"} className="text-[10px] capitalize">{goal.status}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {goal.status !== "completed" && (
                                <button onClick={() => updateStatus(goal.id, "completed")} className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Mark complete">
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {goal.status === "active" && (
                                <button onClick={() => updateStatus(goal.id, "paused")} className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Pause">
                                  <Pause className="w-4 h-4" />
                                </button>
                              )}
                              {goal.status === "paused" && (
                                <button onClick={() => updateStatus(goal.id, "active")} className="p-1.5 rounded-lg text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors" title="Resume">
                                  <Target className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => deleteGoal(goal.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Learning Goal">
        <div className="space-y-4">
          <Input label="Goal Title" placeholder="e.g. Master React by June" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Target Date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          <Input label="Weekly Hours" type="number" min="1" max="40" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} hint="How many hours per week will you dedicate?" />
          <Button className="w-full" onClick={addGoal} disabled={!title.trim()}>Create Goal</Button>
        </div>
      </Modal>
    </div>
  );
}
