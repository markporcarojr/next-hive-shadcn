"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  basePath: string; // e.g. "/harvest"
}

export function PaginationBar({
  page,
  totalPages,
  basePath,
}: PaginationBarProps) {
  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          {page > 1 ? (
            <PaginationPrevious href={`${basePath}?page=${page - 1}`} />
          ) : (
            <span className="opacity-50 cursor-not-allowed px-3 py-2 text-sm">
              Previous
            </span>
          )}
        </PaginationItem>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href={`${basePath}?page=${p}`}
              isActive={p === page}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {totalPages > 5 && page < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next */}
        <PaginationItem>
          {page < totalPages ? (
            <PaginationNext href={`${basePath}?page=${page + 1}`} />
          ) : (
            <span className="opacity-50 cursor-not-allowed px-3 py-2 text-sm">
              Next
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
