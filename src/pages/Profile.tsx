import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, BookOpen, Trophy, Edit2, Save, X, Camera,
  Twitter, Linkedin, Globe, Palette, Crown, GraduationCap, Settings,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { Card } from "../components/ui/Card";
import { EnrollmentStorage, BadgeStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { formatDate } from "../lib/utils";

const BRAND_COLORS = [
  { name: "Violet", value: "#6366f1" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
];

export function Profile() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [brandName, setBrandName] = useState(user?.brandName || "");
  const [brandTagline, setBrandTagline] = useState(user?.brandTagline || "");
  const [brandBio, setBrandBio] = useState(user?.brandBio || "");
  const [brandColor, setBrandColor] = useState(user?.brandColor || "#6366f1");
  const [brandTwitter, setBrandTwitter] = useState(user?.brandTwitter || "");
  const [brandLinkedIn, setBrandLinkedIn] = useState(user?.brandLinkedIn || "");
  const [brandWebsite, setBrandWebsite] = useState(user?.brandWebsite || "");

  const enrollments = user ? EnrollmentStorage.getByStudent(user.id) : [];
  const badges = user ? BadgeStorage.getByUser(user.id) : [];
  const completedCount = enrollments.filter((e) => e.status === "completed").length;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <User className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Sign in to view your profile</h2>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      updateUser({
        fullName,
        bio,
        brandName,
        brandTagline,
        brandBio,
        brandColor,
        brandTwitter,
        brandLinkedIn,
        brandWebsite,
      });
      success("Profile updated", "Your changes have been saved.");
      setEditing(false);
    } catch {
      error("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(user.fullName);
    setBio(user.bio || "");
    setBrandName(user.brandName || "");
    setBrandTagline(user.brandTagline || "");
    setBrandBio(user.brandBio || "");
    setBrandColor(user.brandColor || "#6366f1");
    setBrandTwitter(user.brandTwitter || "");
    setBrandLinkedIn(user.brandLinkedIn || "");
    setBrandWebsite(user.brandWebsite || "");
    setEditing(false);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header banner */}
      <div className="h-32 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 100% at 50% 100%, ${brandColor}20, transparent)` }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Avatar + info */}
        <div className="relative -mt-12 mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div className="relative">
            <Avatar name={fullName || user.fullName} size="xl" color={brandColor} className="ring-4 ring-background shadow-2xl" />
          </div>
          <div className="pb-2">
            {editing ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} loading={saving} leftIcon={<Save className="w-4 h-4" />}>Save</Button>
                <Button size="sm" variant="outline" onClick={handleCancel} leftIcon={<X className="w-4 h-4" />}>Cancel</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} leftIcon={<Edit2 className="w-4 h-4" />}>Edit Profile</Button>
            )}
          </div>
        </div>

        {editing ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 mb-8">
            <Card className="p-5 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><User className="w-4 h-4" /> Basic Info</h3>
              <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself..." />
            </Card>

            {(user.role === "creator" || user.role === "admin") && (
              <Card className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" /> Creator Branding</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Brand Name" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Your brand or creator name" />
                  <Input label="Tagline" value={brandTagline} onChange={(e) => setBrandTagline(e.target.value)} placeholder="Short catchy tagline" />
                </div>
                <Textarea label="Brand Bio" value={brandBio} onChange={(e) => setBrandBio(e.target.value)} placeholder="Your story, expertise, what you teach..." />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Brand Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {BRAND_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setBrandColor(c.value)}
                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{ background: c.value, borderColor: brandColor === c.value ? "white" : "transparent" }}
                        title={c.name}
                      />
                    ))}
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent" title="Custom color" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <Input label="Twitter" value={brandTwitter} onChange={(e) => setBrandTwitter(e.target.value)} placeholder="@handle" leftIcon={<Twitter className="w-4 h-4" />} />
                  <Input label="LinkedIn" value={brandLinkedIn} onChange={(e) => setBrandLinkedIn(e.target.value)} placeholder="Profile URL" leftIcon={<Linkedin className="w-4 h-4" />} />
                  <Input label="Website" value={brandWebsite} onChange={(e) => setBrandWebsite(e.target.value)} placeholder="https://..." leftIcon={<Globe className="w-4 h-4" />} />
                </div>
              </Card>
            )}
          </motion.div>
        ) : (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{user.brandName || user.fullName}</h1>
            {user.brandTagline && <p className="text-muted-foreground mt-1">{user.brandTagline}</p>}
            {(user.bio || user.brandBio) && (
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-2xl">{user.brandBio || user.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /> {user.email}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" /> Joined {formatDate(user.createdAt)}
              </div>
              <Badge variant="default" className="capitalize">{user.role}</Badge>
            </div>
            <div className="flex gap-3 mt-3">
              {user.brandTwitter && <a href={`https://twitter.com/${user.brandTwitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>}
              {user.brandLinkedIn && <a href={user.brandLinkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" /></a>}
              {user.brandWebsite && <a href={user.brandWebsite} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Globe className="w-4 h-4" /></a>}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Enrolled", value: enrollments.length, icon: BookOpen },
            { label: "Completed", value: completedCount, icon: GraduationCap },
            { label: "Badges", value: badges.length, icon: Trophy },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 text-center">
              <stat.icon className="w-5 h-5 text-violet-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <Card className="p-5 mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Achievements
            </h3>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border" title={badge.description}>
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm font-medium text-foreground">{badge.name}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
