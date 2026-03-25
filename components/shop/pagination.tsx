export function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex gap-2 mt-6">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className="px-3 py-1 border rounded"
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}