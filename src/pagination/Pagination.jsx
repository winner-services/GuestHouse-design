import React, { useState, useEffect, useCallback } from 'react';
import './Pagination-style.css';

const Pagination = ({ data, showDisabled = true, limit = 5, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(null);
  const [pageRange, setPageRange] = useState([]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setCurrentPage(data.current_page);
  }, [data]);

  const getPageRange = useCallback(() => {
    if (limit === -1) {
      return 0;
    }

    if (limit === 0) {
      return data.last_page || 0;
    }

    const current = currentPage;
    const last = data.last_page;
    const delta = limit;
    const left = Math.max(1, current - delta);
    const right = Math.min(last, current + delta + 1);
    const range = [];
    const pages = [];

    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || (i >= left && i < right)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (pages.length > 0 && i - pages[pages.length - 1] === 2) {
        pages.push(i - 1);
      } else if (pages.length > 0 && i - pages[pages.length - 1] !== 1) {
        pages.push('...');
      }
      pages.push(i);
    });

    setPageRange(pages);
  }, [currentPage, data.last_page, limit]);

  useEffect(() => {
    getPageRange();
  }, [getPageRange]); // Ensure getPageRange is called on changes

  const handlePreviousPage = () => {
    if (!data.prev_page_url) {
      return;
    }

    setCurrentPage(currentPage - 1);
    onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (!data.next_page_url) {
      return;
    }

    setCurrentPage(currentPage + 1);
    onPageChange(currentPage + 1);
  };

  const handleSelectPage = (page) => {
    if (page === '...') {
      return;
    }
    setCurrentPage(page);
    onPageChange(page);
  };

  return (
    <div>
      {data && (
        <ul className="pagination justify-content-center pagination-sm">
          <li
            className={`page-item ${!data.prev_page_url ? 'disabled' : ''}`}
          >
            <a
              href="#"
              className="page-link"
              aria-label="Previous"
              tabIndex={!data.prev_page_url && -1}
              onClick={handlePreviousPage}
            >
              <span aria-hidden="true">«</span>
            </a>
          </li>
          {pageRange.map((page, key) => (
            <li key={key} className={`page-item ${page === currentPage ? 'active' : ''}`}>
              <a href="#" className="page-link" onClick={() => handleSelectPage(page)}>
                {page}
                {page === currentPage && <span className="sr-only"></span>}
              </a>
            </li>
          ))}
          <li
            className={`page-item ${!data.next_page_url ? 'disabled' : ''}`}
          >
            <a
              href="#"
              className="page-link"
              aria-label="Next"
              tabIndex={!data.next_page_url && -1}
              onClick={handleNextPage}
            >
              <span aria-hidden="true">»</span>
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default Pagination;