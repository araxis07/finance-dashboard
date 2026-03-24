import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-stroke/70 bg-surface/84 px-6 text-center",
        className
      )}
    >
      <div className="mb-4 rounded-2xl bg-panel p-4 text-accent shadow-sm">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="break-words text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm break-words text-sm leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
