/*import React, { useState, useMemo, useEffect } from "react";
import "./DataTable.css";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const API_URL = "http://192.168.1.32:8001/candidates";

//  Highlight matching text
const HighlightMatch = ({ text, highlight }) => {
  if (!highlight || !text) return text;
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  const lowerHighlight = highlight.toLowerCase();

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerHighlight ? (
          <span key={`highlight-${i}`} className="search-highlight">
            {part}
          </span>
        ) : (
          <span key={`text-${i}`}>{part}</span>
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

  const fetchCandidates = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}?page=${page}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("API Response:", data);

      //  Correct mapping — this fixes your empty fields
      const normalized = (data.candidates || []).map((c) => ({
        id: c._id,
        candidateName: c.metadata?.candidateName || "—",
        employer: c.metadata?.employer || "—",
        phonenumber: c.metadata?.phonenumber || "—",
        email: c.metadata?.email || "—",
        city: c.metadata?.city || "—",
        status: c.status || "Unknown",
      }));

      setCandidates(normalized);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (globalSearch !== undefined) setSearchTerm(globalSearch);
  }, [globalSearch]);

  const filteredCandidates = useMemo(() => {
    const term = (globalSearch || searchTerm).toLowerCase();

    return candidates.filter((c) =>
      [c.candidateName, c.email, c.status, c.employer, c.city]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [candidates, globalSearch, searchTerm]);

  const handlePageChange = async (newPage) => {
    if (
      newPage < 1 ||
      newPage > (pagination?.totalPages || 1) ||
      newPage === pagination?.currentPage
    )
      return;

    await fetchCandidates(newPage);
  };

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

  return (
    <div className="datatable-container">
      <div className="table-header-bar">
        <h3 className="header-title">All Candidates</h3>

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

      {isLoading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!isLoading && !error && (
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
                    <td>
                      <HighlightMatch
                        text={c.candidateName}
                        highlight={searchTerm}
                      />
                    </td>
                    <td>
                      <HighlightMatch
                        text={c.employer}
                        highlight={searchTerm}
                      />
                    </td>
                    <td>{c.phonenumber}</td>
                    <td>
                      <HighlightMatch text={c.email} highlight={searchTerm} />
                    </td>
                    <td>
                      <HighlightMatch text={c.city} highlight={searchTerm} />
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results-message">
                    No results found for "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
                  key={`page-${page}`}
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
*/




import React, { useState, useMemo, useEffect } from "react";
import "./DataTable.css";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const API_URL = "http://192.168.1.32:8001/candidates";

const REQUIRED_DOCS = [
  "tenthMarksheet",
  "twelfthMarksheet",
  "bachelorsDegree",
  "bachelorsResult",
  "identityProof",
  "policeVerification",
  "aadhaarOrDomicile",
  "salarySlips",
  "relievingLetter",
  "resume",
  "bankDetails"
];

// Build docs exactly same way as CandidatesPage
const buildDocumentSummary = (documents) => {
  const pendingFiles = documents?.pendingFiles || {};

  return REQUIRED_DOCS.map((key) => {
    const raw = pendingFiles[key];

    const clean = raw
      ? Array.isArray(raw)
        ? raw.map((p) => p.replace(/\\/g, "/"))
        : raw.replace(/\\/g, "/")
      : null;

    const toFileObject = (path) => ({
      file_name: path.split("_").pop(),
      file_api_url: `http://192.168.1.32:8001/${path}`,
    });

    return {
      doc_key: key,
      doc_label: key.replace(/([A-Z])/g, " $1").trim(),
      is_present: Array.isArray(raw) ? raw.length > 0 : !!raw,
      files: clean
        ? Array.isArray(clean)
          ? clean.map(toFileObject)
          : [toFileObject(clean)]
        : [],
    };
  });
};

// SAME compute function as CandidatesPage
const computeStatusFromDocs = (docs) => {
  const total = docs.length;
  const submitted = docs.filter((d) => d.is_present).length;

  if (submitted === 0) return "PENDING";
  if (submitted < total) return "QUEUED";
  return "COMPLETED";
};

const HighlightMatch = ({ text, highlight }) => {
  if (!highlight || !text) return text;

  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  const lower = highlight.toLowerCase();

  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === lower ? (
          <span key={i} className="search-highlight">{p}</span>
        ) : (
          <span key={i}>{p}</span>
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

  const fetchCandidates = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}?page=${page}`);
      if (!res.ok) throw new Error(`HTTP error! status ${res.status}`);

      const data = await res.json();

      const normalized = (data.candidates || []).map((c) => {
        const docs = buildDocumentSummary(c.documents || {});

        
        let finalStatus = c.status; // backend provided

        if (finalStatus !== "DISCREPANCY") {
          finalStatus = computeStatusFromDocs(docs); 
        }

        return {
          id: c._id,
          candidateName: c.metadata?.candidateName || "—",
          employer: c.metadata?.employer || "—",
          phoneNumber: c.metadata?.phonenumber || "—",
          email: c.metadata?.email || "—",
          city: c.metadata?.city || "—",

          //  unified status
          status: finalStatus,

          document_summary: docs,
        };
      });

      setCandidates(normalized);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
     } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    if (globalSearch !== undefined) setSearchTerm(globalSearch);
  }, [globalSearch]);

  const filteredCandidates = useMemo(() => {
    const term = (globalSearch || searchTerm).toLowerCase();

    return candidates.filter((c) =>
      [c.candidateName, c.email, c.status, c.employer, c.city]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [candidates, globalSearch, searchTerm]);

  const getStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "status-clear";
      case "QUEUED":
        return "status-pending";
      case "PENDING":
        return "status-discrepancy";
      case "DISCREPANCY":
        return "status-discrepancy"; 
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

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
        </div>
      </div>

      {isLoading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!isLoading && !error && (
        <>
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Employer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((c) => (
                  <tr key={c.id}>
                    <td><HighlightMatch text={c.candidateName} highlight={searchTerm} /></td>
                    <td><HighlightMatch text={c.employer} highlight={searchTerm} /></td>
                    <td>{c.phoneNumber}</td>
                    <td><HighlightMatch text={c.email} highlight={searchTerm} /></td>
                    <td><HighlightMatch text={c.city} highlight={searchTerm} /></td>

                    <td>
                      <span className={`status-badge ${getStatusClass(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-results-message">
                    No results found for "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar">
            <p className="pagination-text">
              Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
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
