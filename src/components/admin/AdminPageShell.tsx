import type { ReactNode } from "react";

import { DotPattern } from "@/components/ui/magicui/dot-pattern";
import { cn } from "@/lib/utils";

import { AdminTopbar } from "@/components/admin/AdminTopbar";

type AdminPageShellProps = {
  children: ReactNode;
  contentClassName?: string;
};

export function AdminPageShell({
  children,
  contentClassName,
}: AdminPageShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f7f2ea_38%,#f9fafb_100%)] text-stone-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-6rem] size-[30rem] rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute right-[-10%] top-[4rem] size-[26rem] rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,255,255,0)_70%)]" />
        <DotPattern
          width={24}
          height={24}
          glow
          className="text-stone-300/80 [mask-image:radial-gradient(ellipse_at_top,black_18%,transparent_75%)]"
        />
      </div>

      <div className="relative z-10">
        <AdminTopbar />
        <main className={cn("luxury-shell py-8 sm:py-10 lg:py-12", contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}
