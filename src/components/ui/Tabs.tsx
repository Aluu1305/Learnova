import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface TabsContextType {
  active: string;
  setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({ active: "", setActive: () => {} });

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue = "", value, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "underline" | "pills";
}

export function TabsList({ children, className, variant = "default" }: TabsListProps) {
  return (
    <div
      className={cn(
        "flex",
        variant === "default" && "bg-secondary rounded-xl p-1 gap-1",
        variant === "underline" && "border-b border-border gap-0",
        variant === "pills" && "gap-2",
        className
      )}
      data-variant={variant}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function TabsTrigger({ value, children, className, icon }: TabsTriggerProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;
  const variant = "default";

  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        "relative flex items-center gap-2 text-sm font-medium transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
        variant === "default" && [
          "px-3 py-1.5 rounded-lg",
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        ],
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 rounded-lg bg-card shadow-sm"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
}
