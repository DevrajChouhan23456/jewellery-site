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
  return (
    <div className="mt-6 flex gap-2">
      {Array.from({ length: totalPages }).map((_, index) => {
        const nextPage = index + 1;

        return (
          <button
            key={nextPage}
            type="button"
            onClick={() => onPageChange(nextPage)}
            className={`rounded border px-3 py-1 ${page === nextPage ? "bg-black text-white" : ""}`}
          >
            {nextPage}
          </button>
        );
      })}
    </div>
  );
}
