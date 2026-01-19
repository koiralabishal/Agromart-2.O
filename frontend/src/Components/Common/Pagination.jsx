import React from "react";
import "./Styles/Pagination.css";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage = 10, 
  onPageChange,
  showInfo = true
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1 && totalItems > 0) return null;
  if (totalItems === 0) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (startPage === 1) {
        endPage = 5;
      } else if (endPage === totalPages) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="ag-pagination-wrapper">
      <div className="ag-pagination-container">
        {/* First Page */}
        <button 
          className="ag-pagination-btn"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          title="First Page"
        >
          <FaAngleDoubleLeft />
        </button>

        {/* Previous Page */}
        <button 
          className="ag-pagination-btn"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <FaChevronLeft />
        </button>

        {/* Numeric Buttons */}
        {pageNumbers[0] > 1 && (
          <>
            <button className="ag-pagination-btn" onClick={() => handlePageClick(1)}>1</button>
            {pageNumbers[0] > 2 && <span className="ag-pagination-ellipsis">...</span>}
          </>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            className={`ag-pagination-btn ${currentPage === number ? 'active' : ''}`}
            onClick={() => handlePageClick(number)}
          >
            {number}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="ag-pagination-ellipsis">...</span>}
            <button className="ag-pagination-btn" onClick={() => handlePageClick(totalPages)}>{totalPages}</button>
          </>
        )}

        {/* Next Page */}
        <button 
          className="ag-pagination-btn"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <FaChevronRight />
        </button>

        {/* Last Page */}
        <button 
          className="ag-pagination-btn"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
        >
          <FaAngleDoubleRight />
        </button>

        {showInfo && (
          <div className="ag-pagination-info">
            Results {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </div>
        )}
      </div>

      {currentPage > totalPages && totalItems > 0 && (
        <div className="ag-pagination-jump-info">
          You are on Page {currentPage}, but search results only have {totalPages} page(s). 
           <span 
            onClick={() => handlePageClick(1)} 
            style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px', fontWeight: 'bold' }}
          >
            Jump to Page 1
          </span>
        </div>
      )}
    </div>
  );
};

export default Pagination;
