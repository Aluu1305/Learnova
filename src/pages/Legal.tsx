import React from "react";
import { Shield, FileText, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

function LegalPage({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-20">
      <div className="bg-card/50 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />} className="mb-4">
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Icon className="w-7 h-7 text-violet-400" />
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Last updated: March 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 prose-dark space-y-6">
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy" icon={Shield}>
      <Section title="Information We Collect">
        <p>We collect information you provide directly to us, such as when you create an account, enroll in a course, or contact us for support. This includes name, email address, payment information, and course progress data.</p>
      </Section>
      <Section title="How We Use Your Information">
        <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
      </Section>
      <Section title="Information Sharing">
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our platform, provided they agree to keep this information confidential.</p>
      </Section>
      <Section title="Data Security">
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
      </Section>
      <Section title="Your Rights">
        <p>You have the right to access, correct, or delete your personal information. You may also opt out of certain communications. Contact us at privacy@learnova.io to exercise these rights.</p>
      </Section>
      <Section title="Cookies">
        <p>We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
      </Section>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of Service" icon={FileText}>
      <Section title="Acceptance of Terms">
        <p>By accessing and using Learnova, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
      </Section>
      <Section title="User Accounts">
        <p>You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account. Learnova reserves the right to terminate accounts that violate our terms.</p>
      </Section>
      <Section title="Course Content">
        <p>Creators retain ownership of their course content. By publishing content on Learnova, creators grant us a non-exclusive license to host, display, and distribute that content. All content must comply with our community guidelines.</p>
      </Section>
      <Section title="Payments and Refunds">
        <p>All purchases are processed securely. Creators receive 80% (Starter) or 85% (Pro) of course revenue. Refunds are available within 30 days of purchase if you are unsatisfied with the course. See our Refund Policy for details.</p>
      </Section>
      <Section title="Prohibited Activities">
        <p>You agree not to: upload harmful content, spam other users, attempt to hack or reverse-engineer the platform, create multiple accounts, or violate any applicable laws or regulations.</p>
      </Section>
      <Section title="Limitation of Liability">
        <p>Learnova shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.</p>
      </Section>
    </LegalPage>
  );
}

export function Refund() {
  return (
    <LegalPage title="Refund Policy" icon={RefreshCw}>
      <Section title="30-Day Guarantee">
        <p>We offer a 30-day money-back guarantee on all paid courses. If you are not satisfied with a course for any reason, contact us within 30 days of purchase and we will issue a full refund, no questions asked.</p>
      </Section>
      <Section title="Eligibility">
        <p>To be eligible for a refund: the request must be made within 30 days of purchase, the course must have been purchased directly through Learnova, and you must not have completed more than 25% of the course content.</p>
      </Section>
      <Section title="How to Request">
        <p>To request a refund, visit your enrolled courses, click on the course, and select "Request Refund". Alternatively, email refunds@learnova.io with your order details. Refunds are processed within 5-7 business days.</p>
      </Section>
      <Section title="Exceptions">
        <p>Refunds will not be issued for: free courses, subscription fees (except for the first month), or courses where the completion threshold has been exceeded.</p>
      </Section>
      <Section title="Creator Revenue">
        <p>When a refund is issued, the corresponding revenue is deducted from the creator's account balance. Creators are notified of all refund requests.</p>
      </Section>
    </LegalPage>
  );
}
