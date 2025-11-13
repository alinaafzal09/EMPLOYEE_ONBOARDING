import React, { useState, useMemo, useEffect } from "react";
import "./DataTable.css";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const API_URL = "http://localhost:8088/employees";

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

const DataTable = ({ pagination, globalSearch = "" }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        console.log("Raw API response:", data);

        const list = Array.isArray(data)
          ? data
          : data.data || data.employees || data.candidates || [];

        setCandidates(list);
      } catch (err) {
        console.error("Failed to fetch candidate data:", err);
        setError(err.message || "Could not fetch data from the server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // 🔄 If global search changes (from Home.jsx), update local searchTerm
  useEffect(() => {
    if (globalSearch !== undefined) setSearchTerm(globalSearch);
  }, [globalSearch]);

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

  const filteredCandidates = useMemo(() => {
    if (!candidates.length) return [];

    const term = (globalSearch || searchTerm).toLowerCase();
    return candidates.filter((c) => {
      const m = c.metadata || {};
      return (
        (m.candidateName || "").toLowerCase().includes(term) ||
        (m.employer || "").toLowerCase().includes(term) ||
        (m.email || "").toLowerCase().includes(term) ||
        (m.city || "").toLowerCase().includes(term)
      );
    });
  }, [candidates, globalSearch, searchTerm]);

  const { total } = pagination || {};

  return (
    <div className="datatable-container">
      <div className="table-header-bar">
        <h3 className="header-title">All Candidates</h3>

        {/* 🔍 Keep internal search bar functional too */}
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

      {isLoading && <p className="loading-message">Loading candidate data...</p>}
      {error && <p className="error-message">Error fetching data: {error}</p>}
      {!isLoading && !error && candidates.length === 0 && (
        <p className="no-results-message">No candidates found.</p>
      )}

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
                filteredCandidates.map((candidate) => {
                  const m = candidate.metadata || {};
                  return (
                    <tr key={candidate._id}>
                      <td className="candidate-name">
                        <HighlightMatch
                          text={m.candidateName}
                          highlight={searchTerm}
                        />
                      </td>
                      <td>
                        <HighlightMatch
                          text={m.employer}
                          highlight={searchTerm}
                        />
                      </td>
                      <td>{m.phoneNumber || "—"}</td>
                      <td>
                        <HighlightMatch text={m.email} highlight={searchTerm} />
                      </td>
                      <td>
                        <HighlightMatch text={m.city} highlight={searchTerm} />
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            candidate.status
                          )}`}
                        >
                          {readableStatus(candidate.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-results-message">
                    No results found for “{searchTerm}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-bar">
            <p className="pagination-text">
              Showing {filteredCandidates.length} of{" "}
              {total || candidates.length} entries
            </p>

            <div className="pagination-controls">
              <button className="pagination-nav-button">
                <ChevronLeftIcon className="nav-icon" />
              </button>
              {[1, 2, 3].map((page) => (
                <button key={page} className="pagination-button">
                  {page}
                </button>
              ))}
              <span className="ellipsis">...</span>
              <button className="pagination-nav-button">
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


