import React, { useState, useMemo } from "react";
import './DataTable.css'; 
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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


const DataTable = ({ candidates, pagination }) => {
    // --- STATE HOOKS 
    const [searchTerm, setSearchTerm] = useState('');
    
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
                    {/* Search Input  */}
                    <div className="search-input-wrapper">
                        <input 
                            type="text" 
                            placeholder="Search" 
                            className="search-input"
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                        />
                        <MagnifyingGlassIcon className="search-icon" />
                    </div>
                    
                    {/* Sort Dropdown */}
                    <select className="sort-dropdown">
                        <option>Sort by: Newest</option>
                        <option>Sort by: Oldest</option>
                    </select>
                </div>
            </div>

            {/* Candidates Table */}
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
            
            {/* Pagination Bar - Uses dummy page numbers/data */}
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
                            // Note: `currentPage` is destructured but not used for functionality here
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
        </div>
    );
};

export default DataTable;