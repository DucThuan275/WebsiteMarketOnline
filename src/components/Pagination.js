import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalElements,
}) => {
  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 0; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(0);

      // Calculate start and end of page range
      let start = Math.max(currentPage - 1, 1);
      let end = Math.min(currentPage + 1, totalPages - 2);

      // Adjust range if at edges
      if (start === 1) end = 3;
      if (end === totalPages - 2) start = totalPages - 4;

      // Add ellipsis after first page if needed
      if (start > 1) pageNumbers.push("...");

      // Add page range
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 2) pageNumbers.push("...");

      // Always include last page
      if (totalPages > 1) pageNumbers.push(totalPages - 1);
    }

    return pageNumbers;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600">
        Showing {currentPage * pageSize + 1} to{" "}
        {Math.min((currentPage + 1) * pageSize, totalElements)} of{" "}
        {totalElements} items
      </div>

      <div className="flex items-center">
        <select
          value={pageSize}
          onChange={onPageSizeChange}
          className="mr-4 p-2 border border-gray-300 rounded"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <div className="flex">
          <button
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={`px-3 py-1 border border-gray-300 rounded-l ${
              currentPage === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            Prev
          </button>

          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-1 border-t border-b border-gray-300 flex items-center"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 border-t border-b border-gray-300 ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page + 1}
              </button>
            )
          )}

          <button
            onClick={() =>
              onPageChange(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage >= totalPages - 1}
            className={`px-3 py-1 border border-gray-300 rounded-r ${
              currentPage >= totalPages - 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "hover:bg-gray-100"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
