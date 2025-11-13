import React, { useState, useMemo, useEffect } from "react";
import './DataTable.css'; 
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// --- API Endpoint Configuration  ---
const API_URL = "http://localhost:8088/employees";

// Helper component to highlight search matches in table cells
const HighlightMatch = ({ text, highlight }) => {
    // Return original text if highlight is missing or text is empty
    if (!highlight || !text) return text;

    // Use a regular expression to split the text by the search term (case-insensitive, global)
    // The capture group () ensures the delimiter (the match) is included in the resulting array
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    const lowerHighlight = highlight.toLowerCase();

    return (
        <>
            {parts.map((part, index) => 
                // Check if the current part matches the search term (case-insensitive)
                part.toLowerCase() === lowerHighlight ? (
                    <span key={index} className="search-highlight">
                        {part}
                    </span>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </>
    );
};


// Note: The 'candidates' prop has been removed from the signature.
const DataTable = ({ pagination }) => {
    // --- STATE HOOKS for Data, Loading, and Errors ---
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- EFFECT HOOK for API Data Fetching ---
    useEffect(() => {
        const fetchCandidates = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Assuming API returns an array of candidates
                setCandidates(data);
                
            } catch (err) {
                console.error("Failed to fetch candidate data:", err);
                setError(err.message || "Could not fetch data from the server.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []); // Runs once on component mount
    
    // --- MEMOIZED FILTERING AND SORTING LOGIC
    // This hook ensures data processing only runs when candidates or searchTerm changes
    const sortedAndFilteredCandidates = useMemo(() => {
        if (!candidates || candidates.length === 0) {
            return [];
        }
        
        const lowerCaseSearch = searchTerm.toLowerCase();

        // 1. FILTER: Creates a NEW array instance (immutability maintained)
        let currentData = candidates.filter(candidate => {
            if (!lowerCaseSearch) return true;
            
            // Check against searchable fields
            return (
                candidate.candidateName.toLowerCase().includes(lowerCaseSearch) ||
                candidate.employer.toLowerCase().includes(lowerCaseSearch) ||
                candidate.email.toLowerCase().includes(lowerCaseSearch) ||
                candidate.city.toLowerCase().includes(lowerCaseSearch)
            );
        });

        // 2. SORT: If a search term is active, sort matches to the top
        if (lowerCaseSearch) {
            currentData = [...currentData].sort((a, b) => { 
                const aMatches = 
                    a.candidateName.toLowerCase().includes(lowerCaseSearch) ||
                    a.employer.toLowerCase().includes(lowerCaseSearch) ||
                    a.email.toLowerCase().includes(lowerCaseSearch) ||
                    a.city.toLowerCase().includes(lowerCaseSearch);
                
                const bMatches = 
                    b.candidateName.toLowerCase().includes(lowerCaseSearch) ||
                    b.employer.toLowerCase().includes(lowerCaseSearch) ||
                    b.email.toLowerCase().includes(lowerCaseSearch) ||
                    b.city.toLowerCase().includes(lowerCaseSearch);
                
                // Sort logic: matching items come first (-1)
                if (aMatches && !bMatches) return -1;
                // Non-matching items come after (1)
                if (!aMatches && bMatches) return 1;
                
                return 0; // Maintain original order for ties
            });
        }

        return currentData;
    }, [candidates, searchTerm]); // Dependencies: Recalculate only when these change
    
    // --- HANDLERS 
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // Helper function for status badge styling
    const getStatusClass = (status) => {
        switch (status) {
            case 'Clear': return 'status-clear';
            case 'Discrepancy': return 'status-discrepancy';
            case 'Pending': return 'status-pending';
            default: return 'bg-gray-500/30 text-gray-300';
        }
    };
 
    // Destructure pagination data safely
    const { totalEntries } = pagination || {};
    const dataToDisplay = sortedAndFilteredCandidates;

    // --- RENDER 
    return (
        <div className="datatable-container">
            
            <div className="table-header-bar">
                <h3 className="header-title">All Candidates</h3>
                
                <div className="controls-group">
                    {/* Search Input  */}
                    <div className="search-input-wrapper">
                        <input 
                            type="text" 
                            placeholder="Search" 
                            className="search-input"
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                            disabled={isLoading}
                        />
                        <MagnifyingGlassIcon className="search-icon" />
                    </div>
                    
                    {/* Sort Dropdown */}
                    <select className="sort-dropdown" disabled={isLoading}>
                        <option>Sort by: Newest</option>
                        <option>Sort by: Oldest</option>
                    </select>
                </div>
            </div>

            {/* Display Loading/Error/No Results messages */}
            {isLoading && <p className="loading-message">Loading candidate data...</p>}
            {error && <p className="error-message">Error fetching data: {error}</p>}
            {!isLoading && !error && candidates.length === 0 && <p className="no-results-message">No candidates found.</p>}

            {/* Candidates Table (Only rendered if data is loaded and not erroneous) */}
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
                        {dataToDisplay.length > 0 ? (
                            dataToDisplay.map((candidate) => (
                                <tr key={candidate.id}>
                                    {/* Use HighlightMatch for all searchable columns */}
                                    <td className="candidate-name">
                                        <HighlightMatch text={candidate.candidateName} highlight={searchTerm} />
                                    </td>
                                    <td>
                                        <HighlightMatch text={candidate.employer} highlight={searchTerm} />
                                    </td>
                                    <td>{candidate.phoneNumber}</td> 
                                    <td>
                                        <HighlightMatch text={candidate.email} highlight={searchTerm} />
                                    </td>
                                    <td>
                                        <HighlightMatch text={candidate.city} highlight={searchTerm} />
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(candidate.status)}`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results-message">
                                    No results found for **"{searchTerm}"**.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* Pagination Bar - */}
                <div className="pagination-bar">
                    <p className="pagination-text">
                        Showing data 1 to {dataToDisplay.length} of {totalEntries ? totalEntries.toLocaleString() : '0'} entries (Filtered)
                    </p>
                    
                    <div className="pagination-controls">
                        <button className="pagination-nav-button">
                            <ChevronLeftIcon className="nav-icon" />
                        </button>
                        
                        {[1, 2, 3].map(page => (
                            <button 
                                key={page} 
                                className={`pagination-button`} 
                            >
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