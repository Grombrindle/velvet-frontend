"use client";

const Pagination = ({ currentPage, lastPage, onPageChange }) => {
  if (lastPage <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          currentPage === 1
            ? "text-gray-300 cursor-not-allowed bg-gray-50"
            : "text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-600 shadow-sm hover:shadow cursor-pointer"
        }`}
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center">
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-gray-400"
            >
              ⋯
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === page
                  ? "bg-black text-white shadow-md scale-105"
                  : "text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-200 shadow-sm hover:shadow"
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
          currentPage === lastPage
            ? "text-gray-300 cursor-not-allowed bg-gray-50"
            : "text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 border border-gray-600 shadow-sm hover:shadow cursor-pointer"
        }`}
      >
        Next
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;