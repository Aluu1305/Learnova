import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check, Sparkles, BarChart3, Infinity, Users, Zap, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { SubscriptionStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { CreatorSubscription } from "../lib/types";

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: 20,
    period: "month",
    description: "Perfect for getting started as a creator",
    color: "from-violet-500 to-purple-600",
    features: [
      { text: "Up to 3 courses", included: true },
      { text: "Basic analytics", included: true },
      { text: "Student management", included: true },
      { text: "Revenue earning (80% cut)", included: true },
      { text: "Email support", included: true },
      { text: "Unlimited courses", included: false },
      { text: "Deep analytics", included: false },
      { text: "Homepage advertising", included: false },
      { text: "AI course builder", included: false },
      { text: "Revenue breakdown", included: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 50,
    period: "month",
    description: "For serious creators who want to scale",
    color: "from-amber-500 to-orange-600",
    popular: true,
    features: [
      { text: "Unlimited courses", included: true },
      { text: "Deep analytics dashboard", included: true },
      { text: "Student management", included: true },
      { text: "Revenue earning (85% cut)", included: true },
      { text: "Priority support", included: true },
      { text: "Revenue breakdown charts", included: true },
      { text: "Homepage featuring", included: true },
      { text: "AI course builder", included: true },
      { text: "Advanced branding", included: true },
      { text: "Affiliate program access", included: true },
    ],
  },
];

export function Subscription() {
  const { user } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<CreatorSubscription | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user) setSubscription(SubscriptionStorage.getByCreator(user.id) || null);
  }, [user]);

  if (!user || (user.role !== "creator" && user.role !== "admin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Crown className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-bold text-foreground">Creator Access Required</h2>
        <Button onClick={() => navigate("/register?role=creator")}>Become a Creator</Button>
      </div>
    );
  }

  const handleSubscribe = (planId: "starter" | "pro") => {
    setUpgrading(true);
    setTimeout(() => {
      if (subscription) {
        SubscriptionStorage.update(subscription.id, { plan: planId, status: "active" });
        setSubscription((prev) => prev ? { ...prev, plan: planId } : null);
      } else {
        const sub = SubscriptionStorage.create({
          creatorId: user.id,
          plan: planId,
          status: "active",
          startDate: new Date().toISOString(),
        });
        setSubscription(sub);
      }
      success(`${planId === "pro" ? "Pro" : "Starter"} plan activated!`, "You now have access to all features.");
      setUpgrading(false);
    }, 1200);
  };

  const handleCancel = () => {
    if (!subscription) return;
    SubscriptionStorage.update(subscription.id, { status: "cancelled" });
    setSubscription((prev) => prev ? { ...prev, status: "cancelled" } : null);
    info("Subscription cancelled", "Your access continues until the end of the billing period.");
  };

  const currentPlan = subscription?.status === "active" ? subscription.plan : null;

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-br from-card to-secondary border-b border-border py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="gradient" className="mb-4 inline-flex gap-1.5">
            <Crown className="w-3.5 h-3.5" /> Creator Plans
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground">Start free, scale as you grow. Cancel anytime.</p>

          {currentPlan && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                Currently on <span className="capitalize font-bold">{currentPlan}</span> plan
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`p-6 relative ${plan.popular && !isActive ? "border-amber-500/40 shadow-xl shadow-amber-500/10" : ""} ${isActive ? "border-emerald-500/40 shadow-xl shadow-emerald-500/10" : ""}`}>
                  {plan.popular && !isActive && (
                    <Badge variant="gradient" className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                  )}
                  {isActive && (
                    <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">Current Plan</Badge>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mt-1 mb-2">
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground/60"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isActive ? (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <p className="text-sm text-emerald-400 font-medium">Active Subscription</p>
                      </div>
                      {plan.id !== "pro" && (
                        <Button className="w-full" variant="gradient" onClick={() => handleSubscribe("pro")} loading={upgrading} leftIcon={<Zap className="w-4 h-4" />}>
                          Upgrade to Pro
                        </Button>
                      )}
                      <Button className="w-full" variant="outline" onClick={handleCancel}>
                        Cancel Subscription
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "gradient" : "outline"}
                      onClick={() => handleSubscribe(plan.id)}
                      loading={upgrading}
                    >
                      {currentPlan === "pro" && plan.id === "starter" ? "Downgrade" : "Get Started"}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Features comparison */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Why Go Pro?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Infinity, title: "Unlimited Courses", desc: "No cap on how many courses you can create and sell.", color: "from-violet-500 to-purple-600" },
              { icon: Sparkles, title: "AI Course Builder", desc: "Generate complete courses with modules and lessons in minutes.", color: "from-amber-500 to-orange-600" },
              { icon: BarChart3, title: "Deep Analytics", desc: "Revenue breakdown, student engagement, and growth insights.", color: "from-blue-500 to-indigo-600" },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl border border-border bg-card text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
