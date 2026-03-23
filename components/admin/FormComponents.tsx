"use client";

import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  children: ReactNode;
}

export function FormField({
  label,
  description,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-semibold text-stone-950">{label}</span>
        {description && (
          <p className="mt-1 text-xs text-stone-500">{description}</p>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function FormCard({
  title,
  description,
  children,
  action,
}: FormCardProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 luxury-shadow backdrop-blur">
      <div className="border-b border-stone-100 px-6 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-stone-950">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm text-[var(--luxury-muted)]">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
      <div className="px-6 py-6 sm:px-8 space-y-6">{children}</div>
    </div>
  );
}

interface FormGroupProps {
  children: ReactNode;
  columns?: 1 | 2;
}

export function FormGroup({ children, columns = 1 }: FormGroupProps) {
  const colClass = columns === 2 ? "md:grid-cols-2" : "";
  return <div className={`grid gap-4 ${colClass}`}>{children}</div>;
}
