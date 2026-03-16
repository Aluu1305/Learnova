import React from "react";
import { Link } from "react-router-dom";
import { Zap, Twitter, Linkedin, Github, Youtube, Heart } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Explore Courses", href: "/explore" },
    { label: "Become a Creator", href: "/register?role=creator" },
    { label: "Creator Dashboard", href: "/creator" },
    { label: "AI Course Builder", href: "/creator/create" },
    { label: "Affiliate Program", href: "/affiliate" },
  ],
  Students: [
    { label: "My Learning", href: "/my-learning" },
    { label: "Achievements", href: "/achievements" },
    { label: "Study Schedule", href: "/schedule" },
    { label: "Goals", href: "/goals" },
    { label: "Wishlist", href: "/wishlist" },
  ],
  Support: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">
                Learn<span className="gradient-text">ova</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The AI-powered learning platform where creators build, students grow, and knowledge flows freely.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" },
                { Icon: Github, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Learnova. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for learners everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
