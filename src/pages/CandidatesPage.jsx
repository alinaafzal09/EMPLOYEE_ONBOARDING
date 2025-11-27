/*import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import './candidates.css';

const API_URL = "http://192.168.1.32:8001/candidates";

const buildDocumentSummary = (documents) => {
    const pendingFiles = documents?.pendingFiles || {};

    const entries = Object.keys(pendingFiles).map((key) => ({
        doc_key: key,
        doc_label: key.replace(/([A-Z])/g, " $1").trim(),
        is_present: pendingFiles[key] ? true : false,
        is_mandatory: true,
        is_multi_file: false,
        files: pendingFiles[key]
            ? [
                  {
                      file_name: pendingFiles[key].split("_").pop(),
                      file_api_url: `http://192.168.1.32:8001/${pendingFiles[key].replace("\\", "/")}`,
                  },
              ]
            : [],
    }));

    return entries;
};


const DocumentDetail = ({ documents }) => {
    return (
        <div className="document-detail-panel">
            <h3>Document Status</h3>
            <ul className="document-detail-list">
                {documents.map((doc) => (
                    <li key={doc.doc_key} className="document-detail-item">
                        <span className="doc-label">{doc.doc_label}</span>

                        {doc.is_present ? (
                            <span className="status-present">
                                Present ({doc.files.length} file)
                            </span>
                        ) : (
                            <span className="status-missing">
                                Missing (Mandatory)
                            </span>
                        )}

                        {doc.is_present && doc.files.length > 0 && (
                            <a
                                href={doc.files[0].file_api_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="doc-link-button"
                            >
                                View File
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};


const CandidatesPage = () => {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(API_URL);

                if (!res.ok) throw new Error("HTTP Error " + res.status);

                const data = await res.json();

                //  Corrected mapping — now employer, phone, city will render.
                const normalized = (data.candidates || []).map((c) => ({
                    id: c._id,
                    candidateName: c.metadata?.candidateName || "—",
                    email: c.metadata?.email || "—",

                    employer: c.metadata?.employer || "—",
                    phonenumber: c.metadata?.phonenumber || "—",
                    city: c.metadata?.city || "—",

                    status: c.status || "Unknown",
                    document_summary: buildDocumentSummary(c.documents || {}),
                }));

                setCandidates(normalized);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const NUM_COLUMNS = 7;

    return (
        <main className="candidates-page-main">
            <header className="page-header">
                <h1>All Candidates</h1>
            </header>

            {isLoading && (
                <div className="status-message loading-message">
                    Loading candidate data...
                </div>
            )}

            {error && (
                <div className="status-message error-message">
                     Error: {error}
                </div>
            )}

            {!isLoading && !error && candidates.length === 0 && (
                <div className="status-message info-message">
                    No candidates found.
                </div>
            )}

            {!isLoading && !error && candidates.length > 0 && (
                <div className="candidates-table-container">
                    <table className="candidates-datatable">
                        <thead>
                            <tr>
                                <th className="toggle-col">Details</th>
                                <th>Candidate Name</th>
                                <th>Employer</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>City</th>
                                <th>Doc Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((c) => (
                                <React.Fragment key={c.id}>
                                    <tr
                                        className={
                                            expandedRowId === c.id
                                                ? "is-expanded"
                                                : ""
                                        }
                                    >
                                        <td className="toggle-col">
                                            <button
                                                onClick={() => toggleRow(c.id)}
                                                className="toggle-button"
                                            >
                                                {expandedRowId === c.id ? (
                                                    <FiChevronDown />
                                                ) : (
                                                    <FiChevronRight />
                                                )}
                                            </button>
                                        </td>

                                        <td>{c.candidateName}</td>
                                        <td>{c.employer}</td>
                                        <td>{c.phonenumber}</td>
                                        <td>{c.email}</td>
                                        <td>{c.city}</td>

                                        <td>
                                            {
                                                c.document_summary.filter(
                                                    (d) =>
                                                        !d.is_present &&
                                                        d.is_mandatory
                                                ).length
                                            }{" "}
                                            Missing
                                        </td>
                                    </tr>

                                    {expandedRowId === c.id && (
                                        <tr className="detail-row">
                                            <td colSpan={NUM_COLUMNS}>
                                                <DocumentDetail
                                                    documents={
                                                        c.document_summary
                                                    }
                                                />
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
*/ 

import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import './candidates.css';

const API_URL = "http://192.168.1.32:8001/candidates";
 
// REQUIRED MANDATORY DOCUMENTS (11 total)
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

            is_present: Array.isArray(raw)
                ? raw.length > 0
                : !!raw,

            files: clean
                ? Array.isArray(clean)
                    ? clean.map(toFileObject)
                    : [toFileObject(clean)]
                : [],
        };
    });
};

const computeStatusFromDocs = (docs) => {
    const total = docs.length;
    const submitted = docs.filter((d) => d.is_present).length;

    if (submitted === 0) return "PENDING";
    if (submitted < total) return "QUEUED";
    return "COMPLETED";
};

const DocumentDetail = ({ documents }) => {
    return (
        <div className="document-detail-panel">
            <h3>Document Status</h3>
            <ul className="document-detail-list">
                {documents.map((doc) => (
                    <li key={doc.doc_key} className="document-detail-item">
                        <span className="doc-label">{doc.doc_label}</span>

                        {doc.is_present ? (
                            <span className="status-present">
                                Present ({doc.files.length} file)
                            </span>
                        ) : (
                            <span className="status-missing">Missing (Mandatory)</span>
                        )}

                        {doc.is_present && doc.files.length > 0 && (
                            <a
                                href={doc.files[0].file_api_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="doc-link-button"
                            >
                                View File
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const CandidatesPage = () => {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(API_URL);

                if (!res.ok) throw new Error("HTTP Error " + res.status);

                const data = await res.json();

                const normalized = (data.candidates || []).map((c) => {
                    const docs = buildDocumentSummary(c.documents || {});

                    //  NEW STATUS PRIORITY LOGIC
                    let finalStatus = c.status; // backend-provided status

                    if (finalStatus !== "DISCREPANCY") {
                        // fallback to old logic ONLY if no discrepancy from backend
                        finalStatus = computeStatusFromDocs(docs);
                    }

                    return {
                        id: c._id,
                        candidateName: c.metadata?.candidateName || "—",
                        email: c.metadata?.email || "—",
                        employer: c.metadata?.employer || "—",
                        phonenumber: c.metadata?.phonenumber || "—",
                        city: c.metadata?.city || "—",

                        //  final status applied here
                        status: finalStatus,

                        document_summary: docs,
                    };
                });

                setCandidates(normalized);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    const toggleRow = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const NUM_COLUMNS = 7;

    return (
        <main className="candidates-page-main">
            <header className="page-header">
                <h1>All Candidates</h1>
            </header>

            {isLoading && (
                <div className="status-message loading-message">
                    Loading candidate data...
                </div>
            )}

            {error && (
                <div className="status-message error-message">
                    Error: {error}
                </div>
            )}

            {!isLoading && !error && candidates.length === 0 && (
                <div className="status-message info-message">
                    No candidates found.
                </div>
            )}

            {!isLoading && !error && candidates.length > 0 && (
                <div className="candidates-table-container">
                    <table className="candidates-datatable">
                        <thead>
                            <tr>
                                <th className="toggle-col">Details</th>
                                <th>Candidate Name</th>
                                <th>Employer</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>City</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {candidates.map((c) => (
                                <React.Fragment key={c.id}>
                                    <tr className={expandedRowId === c.id ? "is-expanded" : ""}>
                                        <td className="toggle-col">
                                            <button
                                                onClick={() => toggleRow(c.id)}
                                                className="toggle-button"
                                            >
                                                {expandedRowId === c.id ? (
                                                    <FiChevronDown />
                                                ) : (
                                                    <FiChevronRight />
                                                )}
                                            </button>
                                        </td>

                                        <td>{c.candidateName}</td>
                                        <td>{c.employer}</td>
                                        <td>{c.phonenumber}</td>
                                        <td>{c.email}</td>
                                        <td>{c.city}</td>

                                        <td>
                                            <span className={`status-badge status-${c.status.toLowerCase()}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>

                                    {expandedRowId === c.id && (
                                        <tr className="detail-row">
                                            <td colSpan={NUM_COLUMNS}>
                                                <DocumentDetail documents={c.document_summary} />
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



