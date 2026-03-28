export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-6 sm:px-6 md:py-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
        <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-[#f1ebe4]" />
        <div className="space-y-5">
          <div className="h-4 w-32 animate-pulse rounded bg-[#ebe2d7]" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-[#f1ebe4]" />
          <div className="h-6 w-40 animate-pulse rounded bg-[#ebe2d7]" />
          <div className="h-20 w-full animate-pulse rounded bg-[#f1ebe4]" />
          <div className="flex gap-4">
            <div className="h-14 flex-1 animate-pulse rounded-full bg-[#832729]/15" />
            <div className="h-14 w-40 animate-pulse rounded-full bg-[#ebe2d7]" />
          </div>
          <div className="grid grid-cols-2 gap-4 border-y border-gray-200 py-8">
            <div className="h-20 animate-pulse rounded-2xl bg-[#f1ebe4]" />
            <div className="h-20 animate-pulse rounded-2xl bg-[#f1ebe4]" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="h-16 animate-pulse rounded bg-[#f1ebe4]" />
            <div className="h-16 animate-pulse rounded bg-[#f1ebe4]" />
            <div className="h-16 animate-pulse rounded bg-[#f1ebe4]" />
          </div>
        </div>
      </div>
    </main>
  );
}
