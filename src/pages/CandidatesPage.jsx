// src/pages/CandidatesPage.jsx - Using Collapsible Rows

import React, { useState } from 'react';
// Using FiChevronRight (for closed) and FiChevronDown (for open)
import { FiChevronRight, FiChevronDown } from 'react-icons/fi'; 
import './candidates.css';


// --- Dummy Data  ---
const CANDIDATE_DATA = [
    {
        candidate_id: "TIS-4903",
        candidateName: "Shashwat Goel",
        employer: "Bajaj Capital",
        phoneNumber: "9876543290",
        email: "shash@bajajicapital.com",
        city: "San Francisco",
        document_summary: [
            { 
                doc_key: "tenthMarksheet", doc_label: "10th Marksheet",
                is_mandatory: true, is_present: true, is_multi_file: false,
                files: [{ file_name: "Tenth_Marksheet_Shashwat.pdf", file_api_url: "/api/doc/4903/tenthMarksheet" }]
            },
            { 
                doc_key: "relievingLetter", doc_label: "Relieving Letters",
                is_mandatory: true, is_present: true, is_multi_file: true,
                files: [
                    { file_name: "TCS_Relieving_2020.pdf", file_api_url: "/api/doc/4903/relievingLetter/A" },
                    { file_name: "Wipro_Exp_Cert.pdf", file_api_url: "/api/doc/4903/relievingLetter/B" }
                ]
            },
            { 
                doc_key: "otherCertificates", doc_label: "Other Certificates (Opt)",
                is_mandatory: false, is_present: false, is_multi_file: true,
                files: [] 
            },
            { 
                doc_key: "policeVerification", doc_label: "Police Verification/PCC",
                is_mandatory: true, is_present: false, is_multi_file: false,
                files: [] 
            },
            { 
                doc_key: "resume", doc_label: "Resume/CV",
                is_mandatory: true, is_present: true, is_multi_file: false,
                files: [{ file_name: "Shashwat_Resume.pdf", file_api_url: "/api/doc/4903/resume" }]
            }
        ]
    },
    {
        candidate_id: "TIS-9112",
        candidateName: "Rushabh Nagori",
        employer: "Reliance Retail",
        phoneNumber: "9963074323",
        email: "nagon@relianceretail.com",
        city: "Los Angeles",
        document_summary: [
            { 
                doc_key: "twelfthMarksheet", doc_label: "12th Marksheet",
                is_mandatory: true, is_present: true, is_multi_file: false,
                files: [{ file_name: "12th_Result_Rushabh.pdf", file_api_url: "/api/doc/9112/twelfthMarksheet" }]
            },
            { 
                doc_key: "salarySlips", doc_label: "Salary Slips",
                is_mandatory: true, is_present: true, is_multi_file: true,
                files: [
                    { file_name: "Salary_Jan_2025.pdf", file_api_url: "/api/doc/9112/salarySlips/1" },
                    { file_name: "Salary_Feb_2025.pdf", file_api_url: "/api/doc/9112/salarySlips/2" }
                ]
            }
        ]
    }
];
 

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
    const [candidates] = useState(CANDIDATE_DATA);
    // 1. State to manage the currently expanded row ID
    const [expandedRowId, setExpandedRowId] = useState(null); 

    // 2. Function to toggle the expanded row
    const toggleRow = (candidateId) => {
        setExpandedRowId(expandedRowId === candidateId ? null : candidateId);
    };

    // Calculate the number of columns to correctly set the colspan attribute
    const NUM_COLUMNS = 7; // CandidateName, Employer, Phone, Email, City, Documents (Summary), Toggle Button

    return (
        <main className="candidates-page-main">
            <header className="page-header">
                <h1>All Candidates</h1>
            </header>

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
                            {/*  Documents column can now show a simple summary/status */}
                            <th>Doc Status</th> 
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map((candidate) => (
                            <React.Fragment key={candidate.candidate_id}>
                                {/* --- 3. The Main Table Row --- */}
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

                                {/* --- 4. The Collapsible Detail Row (Conditionally Rendered) --- */}
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
        </main>
    );
};

export default CandidatesPage;