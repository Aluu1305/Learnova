import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Mail, Lock, User, Sparkles, GraduationCap, Crown } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { cn } from "../lib/utils";

export function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      success("Welcome back!", "You've been signed in successfully.");
      navigate("/");
    } catch (err: unknown) {
      error("Sign in failed", err instanceof Error ? err.message : "Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">Learn<span className="gradient-text">ova</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to continue your journey</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-black/20">
          {/* Demo accounts */}
          <div className="mb-5 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
            <p className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Demo Accounts
            </p>
            <div className="space-y-1">
              {[
                { label: "Admin", email: "admin@learnova.io", pass: "admin123" },
              ].map((demo) => (
                <button
                  key={demo.label}
                  onClick={() => { setEmail(demo.email); setPassword(demo.pass); }}
                  className="w-full text-left text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{demo.label}:</span> {demo.email} / {demo.pass}
                </button>
              ))}
              <p className="text-xs text-muted-foreground px-2 pt-1">Or register a new account below ↓</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
            <Button type="submit" className="w-full" loading={loading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as "creator" | "student") || "student";

  const [role, setRole] = useState<"creator" | "student">(defaultRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error("Passwords don't match", "Please make sure both passwords are the same.");
      return;
    }
    if (password.length < 6) {
      error("Password too short", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, fullName, role);
      success("Account created!", "Welcome to Learnova. Let's get started!");
      navigate(role === "creator" ? "/creator" : "/explore");
    } catch (err: unknown) {
      error("Registration failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">Learn<span className="gradient-text">ova</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground mt-1">Join 50,000+ learners and creators</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl shadow-black/20">
          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { value: "student" as const, label: "Student", icon: GraduationCap, desc: "I want to learn" },
              { value: "creator" as const, label: "Creator", icon: Crown, desc: "I want to teach" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                  role === r.value
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-border hover:border-violet-500/50 hover:bg-accent"
                )}
              >
                <r.icon className={cn("w-5 h-5", role === r.value ? "text-violet-400" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-semibold", role === r.value ? "text-violet-400" : "text-foreground")}>{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
            <Input
              label="Confirm Password"
              type={showPass ? "text" : "password"}
              placeholder="Same as above"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <Button type="submit" className="w-full" loading={loading} size="lg" variant="gradient">
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By creating an account you agree to our{" "}
            <Link to="/terms" className="text-violet-400 hover:underline">Terms</Link> &{" "}
            <Link to="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-muted-foreground mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
