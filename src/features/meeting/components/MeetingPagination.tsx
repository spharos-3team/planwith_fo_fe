interface MeetingPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function MeetingPagination({
  page,
  totalPages,
  onPageChange,
}: MeetingPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visibleCount = Math.min(totalPages, 5);
  const start = Math.min(
    Math.max(page - Math.floor(visibleCount / 2), 0),
    Math.max(totalPages - visibleCount, 0)
  );
  const pages = Array.from(
    { length: visibleCount },
    (_, index) => start + index
  );

  return (
    <nav
      aria-label="페이지"
      className="flex items-center justify-center gap-0 py-6"
    >
      {pages.map((pageNumber) => {
        const current = pageNumber === page;

        return (
          <button
            aria-current={current ? "page" : undefined}
            className={`grid size-[30px] place-items-center text-body-sm transition ${
              current
                ? "font-semibold text-brand-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            type="button"
          >
            {pageNumber + 1}
          </button>
        );
      })}
    </nav>
  );
}
