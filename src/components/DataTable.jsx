import React, { useState, useMemo, useEffect } from "react";
import "./DataTable.css";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const API_URL = "http://localhost:8088/employees";

// 🔍 Highlight matching search text
const HighlightMatch = ({ text, highlight }) => {
  if (!highlight || !text) return text;
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  const lowerHighlight = highlight.toLowerCase();

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerHighlight ? (
          <span key={i} className="search-highlight">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const DataTable = ({ pagination: initialPagination, globalSearch = "" }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState(initialPagination || {});

  // ✅ Fetch data with pagination
  const fetchCandidates = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}?page=${page}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("✅ API response:", data);

      const list = data.candidates || [];
      const pageInfo = data.pagination || {};

      setCandidates(list);
      setPagination(pageInfo);
    } catch (err) {
      console.error("Failed to fetch candidate data:", err);
      setError(err.message || "Could not fetch data from the server.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Initial load
  useEffect(() => {
    fetchCandidates();
  }, []);

  // 🔍 Sync global search (from Home.jsx)
  useEffect(() => {
    if (globalSearch !== undefined) setSearchTerm(globalSearch);
  }, [globalSearch]);

  // 🧮 Status badge colors
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "status-clear";
      case "QUEUED":
      case "PENDING":
        return "status-pending";
      case "FAILED":
      case "DISCREPANCY":
        return "status-discrepancy";
      default:
        return "bg-gray-500/30 text-gray-300";
    }
  };

  const readableStatus = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "Clear";
      case "QUEUED":
      case "PENDING":
        return "Pending";
      case "FAILED":
      case "DISCREPANCY":
        return "Discrepancy";
      default:
        return "Unknown";
    }
  };

  // 🔍 Filter candidates by search
  const filteredCandidates = useMemo(() => {
    if (!candidates.length) return [];
    const term = (globalSearch || searchTerm).toLowerCase();

    return candidates.filter((c) =>
      ["candidateName", "employer", "email", "city"].some((key) =>
        c[key]?.toLowerCase().includes(term)
      )
    );
  }, [candidates, globalSearch, searchTerm]);

  // 🔄 Handle pagination change
  const handlePageChange = async (newPage) => {
    if (
      newPage < 1 ||
      newPage > (pagination?.totalPages || 1) ||
      newPage === pagination?.currentPage
    )
      return;
    await fetchCandidates(newPage);
  };

  return (
    <div className="datatable-container">
      <div className="table-header-bar">
        <h3 className="header-title">All Candidates</h3>

        {/* Internal search bar */}
        <div className="controls-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
            <MagnifyingGlassIcon className="search-icon" />
          </div>

          <select className="sort-dropdown" disabled={isLoading}>
            <option>Sort by: Newest</option>
            <option>Sort by: Oldest</option>
          </select>
        </div>
      </div>

      {/* Loading / Error / Empty states */}
      {isLoading && <p className="loading-message">Loading candidate data...</p>}
      {error && <p className="error-message">Error: {error}</p>}
      {!isLoading && !error && candidates.length === 0 && (
        <p className="no-results-message">No candidates found.</p>
      )}

      {/* Table display */}
      {!isLoading && !error && candidates.length > 0 && (
        <>
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Employer</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>City</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c) => (
                  <tr key={c.id}>
                    <td className="candidate-name">
                      <HighlightMatch text={c.candidateName} highlight={searchTerm} />
                    </td>
                    <td>
                      <HighlightMatch text={c.employer} highlight={searchTerm} />
                    </td>
                    <td>{c.phoneNumber || "—"}</td>
                    <td>
                      <HighlightMatch text={c.email} highlight={searchTerm} />
                    </td>
                    <td>
                      <HighlightMatch text={c.city} highlight={searchTerm} />
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(c.status)}`}
                      >
                        {readableStatus(c.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results-message">
                    No results found for “{searchTerm}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar">
            <p className="pagination-text">
              Showing {filteredCandidates.length} of{" "}
              {pagination?.totalEntries || candidates.length} entries
            </p>

            <div className="pagination-controls">
              <button
                className="pagination-nav-button"
                disabled={pagination?.currentPage <= 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <ChevronLeftIcon className="nav-icon" />
              </button>

              {Array.from(
                { length: pagination?.totalPages || 1 },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-button ${
                    pagination?.currentPage === page ? "active" : ""
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-nav-button"
                disabled={
                  pagination?.currentPage >= (pagination?.totalPages || 1)
                }
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <ChevronRightIcon className="nav-icon" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DataTable;



