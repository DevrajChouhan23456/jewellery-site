export default function AccountSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6">
      <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
      <div className="h-60 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
