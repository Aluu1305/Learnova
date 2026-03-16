import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link2, DollarSign, MousePointer, Copy, Check, TrendingUp, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { AffiliateStorage } from "../lib/storage";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { AffiliateLink, AffiliateCommission } from "../lib/types";
import { formatCurrency, formatDate, generateCode } from "../lib/utils";

export function Affiliate() {
  const { user } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<AffiliateLink | null>(null);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [copied, setCopied] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");

  useEffect(() => {
    if (!user) return;
    const aff = AffiliateStorage.getByUser(user.id);
    if (aff) {
      setAffiliate(aff);
      setCommissions(AffiliateStorage.getCommissions(aff.id));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Link2 className="w-12 h-12 text-muted-foreground" />
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const createAffiliateLink = () => {
    const code = generateCode(8);
    const aff = AffiliateStorage.create({
      userId: user.id,
      userName: user.fullName,
      code,
      totalClicks: 0,
      totalEarnings: 0,
      paidAmount: 0,
      commissionRate: 0.2,
      createdAt: new Date().toISOString(),
    });
    setAffiliate(aff);
    success("Affiliate link created!", "Start sharing to earn commissions.");
  };

  const copyLink = () => {
    if (!affiliate) return;
    const link = `${window.location.origin}/register?ref=${affiliate.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    info("Link copied to clipboard!");
  };

  const requestPayout = () => {
    if (!affiliate || !paymentMethod || !payoutAmount) return;
    const amount = parseFloat(payoutAmount);
    const available = affiliate.totalEarnings - affiliate.paidAmount;
    if (amount > available) {
      info("Insufficient balance", `Available: ${formatCurrency(available)}`);
      return;
    }
    AffiliateStorage.createPayout({
      affiliateId: affiliate.id,
      affiliateName: user.fullName,
      amount,
      paymentMethod,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    setShowPayoutModal(false);
    success("Payout requested", "We'll process it within 3-5 business days.");
  };

  const affiliateUrl = affiliate ? `${window.location.origin}/register?ref=${affiliate.code}` : "";
  const available = affiliate ? affiliate.totalEarnings - affiliate.paidAmount : 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-gradient-to-br from-card to-secondary border-b border-border py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Affiliate Program</h1>
          </div>
          <p className="text-muted-foreground">Earn 20% commission on every referral you bring to Learnova</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!affiliate ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
              <Link2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Join the Affiliate Program</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-2">Share Learnova with your network and earn 20% on every paid enrollment through your unique link.</p>
            <p className="text-sm text-muted-foreground mb-8">No cap on earnings. Instant link generation. Monthly payouts.</p>
            <Button size="lg" variant="gradient" onClick={createAffiliateLink} leftIcon={<Link2 className="w-4 h-4" />}>
              Get My Affiliate Link
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Earnings", value: formatCurrency(affiliate.totalEarnings), icon: DollarSign, color: "from-emerald-500 to-teal-600" },
                { label: "Available", value: formatCurrency(available), icon: TrendingUp, color: "from-violet-500 to-purple-600" },
                { label: "Total Clicks", value: affiliate.totalClicks, icon: MousePointer, color: "from-blue-500 to-indigo-600" },
                { label: "Commission Rate", value: `${(affiliate.commissionRate * 100).toFixed(0)}%`, icon: DollarSign, color: "from-amber-500 to-orange-600" },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Referral link */}
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-3">Your Referral Link</h3>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-secondary/50 text-sm text-muted-foreground font-mono truncate">
                  {affiliateUrl}
                </div>
                <Button onClick={copyLink} leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} variant={copied ? "outline" : "default"}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Code: <span className="font-mono text-violet-400">{affiliate.code}</span></p>
            </Card>

            {/* Payout */}
            {available > 0 && (
              <Card className="p-5 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(available)}</p>
                  </div>
                  <Button onClick={() => setShowPayoutModal(true)} leftIcon={<Send className="w-4 h-4" />}>
                    Request Payout
                  </Button>
                </div>
              </Card>
            )}

            {/* Commissions */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Commission History</h3>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No commissions yet. Share your link to start earning!
                </div>
              ) : (
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Course</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {commissions.map((c) => (
                        <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-foreground">{c.courseTitle}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-400">{formatCurrency(c.commissionAmount)}</td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <Badge variant={c.status === "paid" ? "success" : "warning"} className="capitalize">{c.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden md:table-cell">{formatDate(c.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal open={showPayoutModal} onClose={() => setShowPayoutModal(false)} title="Request Payout" description="Payouts are processed within 3-5 business days.">
        <div className="space-y-4">
          <Input label="Payment Method" placeholder="PayPal email, bank details, etc." value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          <Input label="Amount (USD)" type="number" min="10" max={available} value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} hint={`Available: ${formatCurrency(available)}`} />
          <Button className="w-full" onClick={requestPayout} disabled={!paymentMethod || !payoutAmount}>Submit Request</Button>
        </div>
      </Modal>
    </div>
  );
}
