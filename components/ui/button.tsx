"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variantClasses = {
  primary:
    "bg-accent text-accentForeground shadow-soft hover:-translate-y-0.5 hover:opacity-95",
  secondary:
    "bg-accentSoft text-ink shadow-sm hover:-translate-y-0.5 hover:bg-surfaceAlt",
  ghost:
    "border border-stroke/70 bg-panel/90 text-ink shadow-sm hover:-translate-y-0.5 hover:bg-surface"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
