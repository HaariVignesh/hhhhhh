import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

function buildUrl(
  baseUrl: string,
  page: number,
  searchParams?: Record<string, string>
): string {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", page.toString());
  } else {
    params.delete("page");
  }
  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, "...", totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    );
  } else {
    pages.push(
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages
    );
  }

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(baseUrl, currentPage - 1, searchParams)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-sm border border-border text-sm text-muted-foreground hover:border-nue-charcoal hover:text-nue-charcoal transition-colors"
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm border border-border text-sm text-muted-foreground/40 cursor-not-allowed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex items-center justify-center w-9 h-9 text-sm text-muted-foreground"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(baseUrl, page, searchParams)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-sm border text-sm transition-colors",
              currentPage === page
                ? "border-nue-charcoal bg-nue-charcoal text-white"
                : "border-border text-muted-foreground hover:border-nue-charcoal hover:text-nue-charcoal"
            )}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(baseUrl, currentPage + 1, searchParams)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-sm border border-border text-sm text-muted-foreground hover:border-nue-charcoal hover:text-nue-charcoal transition-colors"
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm border border-border text-sm text-muted-foreground/40 cursor-not-allowed">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </span>
      )}
    </nav>
  );
}
