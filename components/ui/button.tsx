"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variantClasses = {
  primary:
    "bg-[linear-gradient(135deg,#14213d_0%,#2563eb_100%)] text-white shadow-soft hover:-translate-y-0.5 hover:brightness-105",
  secondary:
    "bg-accentSoft text-accent shadow-sm hover:-translate-y-0.5 hover:bg-blue-100",
  ghost:
    "border border-stroke bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:bg-slate-50"
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
