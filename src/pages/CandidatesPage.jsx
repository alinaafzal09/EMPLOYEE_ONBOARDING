// src/pages/CandidatesPage.jsx - Using Collapsible Rows

import React, { useState, useEffect } from 'react';
// Using FiChevronRight (for closed) and FiChevronDown (for open)
import { FiChevronRight, FiChevronDown } from 'react-icons/fi'; 
import './candidates.css';

// --- API Endpoint Configuration ---
const API_URL = "http://localhost:8088/employees";

// --- Dummy Data (Kept for reference, but not used in final component) ---
/*
const CANDIDATE_DATA = [...];
*/
 

// --- Sub-Component 1: Renders the Document List inside the Collapsed Row ---
const DocumentDetail = ({ documents }) => {
    return (
        <div className="document-detail-panel">
            <h3>Document Status Summary</h3>
            <ul className="document-detail-list">
                {documents.map((doc) => (
                    <li 
                        key={doc.doc_key} 
                        className={`document-detail-item ${!doc.is_present ? 'missing-document-detail' : ''}`}
                    >
                        <span className="doc-label">{doc.doc_label}</span>
                        <span className="doc-status">
                            {doc.is_present ? (
                                <span className="status-present">Present ({doc.files.length} file{doc.files.length !== 1 ? 's' : ''})</span>
                            ) : (
                                <span className="status-missing">Missing {doc.is_mandatory && '(Mandatory)'}</span>
                            )}
                        </span>
                        
                        {/* Render links only if present and single file */}
                        {doc.is_present && !doc.is_multi_file && doc.files.length > 0 && (
                            <a 
                                href={doc.files[0].file_api_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="doc-link-button"
                            >
                                View File
                            </a>
                        )}

                        {/* For multi-file, we show the list of files */}
                        {doc.is_present && doc.is_multi_file && doc.files.length > 0 && (
                            <div className="multi-file-links">
                                {doc.files.map((file, index) => (
                                    <a 
                                        key={index}
                                        href={file.file_api_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="doc-file-link"
                                    >
                                        {file.file_name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};


// --- Main Page Component: CandidatesPage ---
const CandidatesPage = () => {
    // 1. State for candidates data, loading status, and error
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // 2. State to manage the currently expanded row ID
    const [expandedRowId, setExpandedRowId] = useState(null); 

    // 3. useEffect hook to fetch data on component mount
    useEffect(() => {
        const fetchCandidates = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL);
                
                // Check for HTTP errors (e.g., 404, 500)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Assuming the API returns an array of candidates directly
                setCandidates(data);
                
            } catch (err) {
                console.error("Failed to fetch candidate data:", err);
                setError(err.message || "Could not fetch data from the server.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []); // Empty dependency array means this runs once on mount

    // 4. Function to toggle the expanded row
    const toggleRow = (candidateId) => {
        setExpandedRowId(expandedRowId === candidateId ? null : candidateId);
    };

    // Calculate the number of columns to correctly set the colspan attribute
    const NUM_COLUMNS = 7; // Toggle Button, CandidateName, Employer, Phone, Email, City, Documents (Summary)

    return (
        <main className="candidates-page-main">
            <header className="page-header">
                <h1>All Candidates</h1>
            </header>

            {/* --- Loading and Error States --- */}
            {isLoading && (
                <div className="status-message loading-message">
                    <p>Loading candidate data...</p>
                </div>
            )}

            {error && (
                <div className="status-message error-message">
                    ❌ Error: {error}
                </div>
            )}
            
            {/* Display table only when not loading and no error, and data is present */}
            {!isLoading && !error && candidates.length === 0 && (
                 <div className="status-message info-message">
                    <p>No candidates found.</p>
                </div>
            )}
            
            {!isLoading && !error && candidates.length > 0 && (
            <div className="candidates-table-container">
                <table className="candidates-datatable">
                    <thead>
                        <tr>
                            {/* Column for the toggle button */}
                            <th className="toggle-col">Details</th>
                            <th>Candidate Name</th>
                            <th>Employer</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>City</th>
                            {/*  Documents column can now show a simple summary/status */}
                            <th>Doc Status</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map((candidate) => (
                            <React.Fragment key={candidate.candidate_id}>
                                {/* --- The Main Table Row --- */}
                                <tr className={expandedRowId === candidate.candidate_id ? 'is-expanded' : ''}>
                                    <td className="toggle-col">
                                        <button 
                                            onClick={() => toggleRow(candidate.candidate_id)}
                                            className="toggle-button"
                                            aria-expanded={expandedRowId === candidate.candidate_id}
                                        >
                                            {expandedRowId === candidate.candidate_id ? <FiChevronDown /> : <FiChevronRight />}
                                        </button>
                                    </td>
                                    <td>{candidate.candidateName}</td>
                                    <td>{candidate.employer}</td>
                                    <td>{candidate.phoneNumber}</td>
                                    <td>{candidate.email}</td>
                                    <td>{candidate.city}</td>
                                    {/* Simplified Doc Status (e.g., number of missing docs) */}
                                    <td>
                                        {candidate.document_summary.filter(d => !d.is_present && d.is_mandatory).length} Missing
                                    </td>
                                </tr>

                                {/* --- The Collapsible Detail Row (Conditionally Rendered) --- */}
                                {expandedRowId === candidate.candidate_id && (
                                    <tr className="detail-row">
                                        {/* Use colSpan to span across all 7 columns */}
                                        <td colSpan={NUM_COLUMNS}>
                                            <DocumentDetail documents={candidate.document_summary} />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </main>
    );
};

export default CandidatesPage;