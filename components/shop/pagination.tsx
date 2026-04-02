type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="mt-10 flex items-center justify-center gap-2">

      {/* PREVIOUS */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-full border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Prev
      </button>

      {/* PAGE NUMBERS */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              page === p
                ? "bg-black text-white shadow"
                : "border hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* NEXT */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-full border text-sm disabled:opacity-40 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}