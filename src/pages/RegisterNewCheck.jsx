import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './reg.css'; 

// --- DocumentInput Component  ---
const DocumentInput = ({ id, label, name, file, handler, isSubmitting, required, helpText = "Accepted formats: PDF, DOCX. Max file size: 5MB." }) => (
    <div className="form-input-group">
        <label htmlFor={id} className="form-label">{label}{required ? ' *' : ' (Optional)'}</label>
        <input 
            id={id} name={name} type="file"
            className="form-file-input" onChange={handler}
            // Ensure all file inputs consistently accept both PDF and DOCX
            accept=".pdf,.docx" 
            required={required}
            disabled={isSubmitting}
        />
        {file && (
            <p className="file-selected-text">
                **Selected File:** {file.name}
            </p>
        )}
        <p className="file-input-help-text">
            {helpText}
        </p>
    </div>
);


const RegisterNewCheck = () => {
    
    //  INITIALIZE HOOK: Get the navigation function
    const navigate = useNavigate(); 
    
    const initialState = {
        candidateName: '', city: '', localAddress: '', permanentAddress: '', 
        phoneNumber: '', email: '', employer: '', 
        previousHrEmail: '', 

        // Single Document Fields
        tenthMarksheet: null, twelfthMarksheet: null, bachelorsDegree: null,
        bachelorsResult: null, mastersDegree: null, mastersResult: null, 
        bankDetails: null, resume: null, identityProof: null, 
        policeVerification: null, aadhaarOrDomicile: null,

        // Multi-Document Fields
        relievingLetter: [], 
        salarySlips: [], 
        otherCertificates: [], 
    };

    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [submissionStatus, setSubmissionStatus] = useState(0); // 0: idle, 1: loading, 2: success, 3: error
    // Added state to hold specific error message
    const [errorMessage, setErrorMessage] = useState('');

    // Standard change handler for text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // handler for single-file inputs
    const handleSingleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    };

    // Special change handler for multi-file inputs
    const handleMultiFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    };

    // Helper function to display file names for multi-file fields
    const displayFileNames = (files) => {
        return files.length > 0 
            ? files.map(f => f.name).join(', ') 
            : 'No files selected.';
    };

    // 6. SUBMIT HANDLER FOR JSON METADATA + FILE UPLOAD 
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmissionStatus(1); // Set status to loading
        setErrorMessage(''); // Clear previous errors

        // --- CLIENT-SIDE VALIDATION ---
        if (!formData.previousHrEmail || !formData.candidateName || !formData.email) {
            alert("Validation Error: Please provide all mandatory candidate details (Name, Email, Previous HR Email, etc.) before submitting.");
            setIsSubmitting(false);
            setSubmissionStatus(3); // Set error status
            setErrorMessage('Mandatory text fields are missing.');
            return;
        }
        
        try {
            // 1) Build metadata_json
            const metadata = {
                candidateName: formData.candidateName || null, city: formData.city || null,
                localAddress: formData.localAddress || null, permanentAddress: formData.permanentAddress || null,
                phoneNumber: formData.phoneNumber || null, email: formData.email || null,
                employer: formData.employer || null, previousHrEmail: formData.previousHrEmail || null,
            };

            // 2) Build FormData for multi-part file upload
            const fd = new FormData();
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

            const validateAndAppendFiles = (key, fileOrArray) => {
                const files = Array.isArray(fileOrArray) ? fileOrArray : (fileOrArray ? [fileOrArray] : []);
                
                files.forEach((f) => {
                    const fileName = f.name.toLowerCase();
                    
                    // FIX 1: Correct validation for both PDF and DOCX
                    const isPdfOrDocx = 
                        f.type === "application/pdf" || fileName.endsWith(".pdf") ||
                        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx");
                    
                    if (!isPdfOrDocx) {
                        throw new Error(`${key}: File '${f.name}' is not a valid PDF or DOCX format.`);
                    }
                    if (f.size > MAX_FILE_SIZE) {
                        throw new Error(`${key}: File '${f.name}' exceeds the 5MB limit.`);
                    }
                    
                    fd.append("doc_types", key); 
                    fd.append("files", f, f.name);
                });
            };

            // Single-valued doc types
            const SINGLE_KEYS = [
                "tenthMarksheet", "twelfthMarksheet", "bachelorsDegree",
                "bachelorsResult", "resume", "identityProof",
                "policeVerification", "aadhaarOrDomicile", "bankDetails",
                "mastersDegree", "mastersResult"
            ];
            SINGLE_KEYS.forEach(key => validateAndAppendFiles(key, formData[key]));

            // Multi-valued doc types
            const MULTI_KEYS = ["relievingLetter", "salarySlips", "otherCertificates"];
            MULTI_KEYS.forEach(key => validateAndAppendFiles(key, formData[key]));

            // Attach metadata_json
            fd.append("metadata_json", JSON.stringify(metadata));

            if (!fd.has("files")) {
                console.warn("Submitting form with metadata only. No files were uploaded.");
            }

            const apiEndpoint = "http://192.168.10.56:8088/ingest-files";
            const res = await fetch(apiEndpoint, { method: "POST", body: fd });
            const text = await res.text();

            if (!res.ok) {
                let detail = text;
                try {
                    const j = JSON.parse(text);
                    detail = j?.detail ? JSON.stringify(j.detail) : text;
                } catch {}
                throw new Error(`Server error ${res.status}: ${detail}`);
            }

            // Success Handling
            console.log("Submission successful.");
            setSubmissionStatus(2); 

            // ** Implement Redirection **
            setTimeout(() => {
                navigate('/dashboard/check-status', { replace: true }); 
            }, 2000); 

            // Clear state and reset form visually (more robust than e.target.reset())
            setFormData(initialState);
            
        } catch (error) {
            console.error("Submission Error:", error);
            // alert(`Error: Submission failed: ${error.message}`);
            setErrorMessage(`Submission failed: ${error.message}`);
            setSubmissionStatus(3);
        } finally {
            setIsSubmitting(false); 
        }
    };
    
    // --- JSX RENDER ---
    
    const isFormActive = submissionStatus === 0 || submissionStatus === 3; 
    const isSubmittingState = isSubmitting && submissionStatus === 1; 

    const getSubmitButtonText = () => {
        if (submissionStatus === 1) return 'Processing Files... Please Wait';
        if (submissionStatus === 3) return 'Retry Submission';
        return 'Submit Check Request';
    };

    return (
        <main className="main-content"> 
            
            <header className="main-header">
                <h1 className="header-title">Request New Background Check</h1>
                <p style={{ color: '#9ca3af', fontSize: '1rem', marginTop: '5px' }}>
                    *Please fill out the candidate's details. Document uploads are now **optional** but recommended.
                </p>
            </header>

            <div className="form-card">
                
                {/* === CONDITIONAL STATUS MESSAGES === */}
                {submissionStatus === 1 && (
                    <div className="submission-message-box loading-box">
                        <p className="loading-text">Validating and uploading files...</p>
                        <div className="progress-bar-style"></div> 
                    </div>
                )}
                
                {submissionStatus === 2 && (
                    <div className="submission-message-box success-box">
                        ✅ **Success!** Check request submitted. Redirecting in a moment...
                    </div>
                )}
                
                {submissionStatus === 3 && (
                    <div className="submission-message-box error-box">
                        ❌ **Error!** {errorMessage || 'Submission failed. Please check the required fields and network connection.'}
                    </div>
                )}

                {/* === FORM CONTAINER - Form is rendered if active or loading (1) === */}
                {(isFormActive || submissionStatus === 1) && (
                    // Removed e.target.reset() from the end of handleSubmit
                    <form onSubmit={handleSubmit}> 

                        {/* === CANDIDATE INFORMATION SECTION (Text fields remain MANDATORY) === */}
                        <h2 className="form-section-header">Candidate Details</h2>
                        
                        <div className="form-grid-2col">
                            <div className="form-input-group"><label htmlFor="candidateName" className="form-label">Candidate Full Name *</label><input id="candidateName" name="candidateName" type="text" className="form-input" value={formData.candidateName} onChange={handleChange} placeholder="e.g., Jane Doe" required disabled={isSubmittingState}/></div>
                            <div className="form-input-group"><label htmlFor="employer" className="form-label">Employer / Company *</label><input id="employer" name="employer" type="text" className="form-input" value={formData.employer} onChange={handleChange} placeholder="e.g., Trident Info Systems" required disabled={isSubmittingState}/></div>
                        </div>
                        <div className="form-grid-2col">
                            <div className="form-input-group"><label htmlFor="phoneNumber" className="form-label">Phone Number *</label><input id="phoneNumber" name="phoneNumber" type="tel" className="form-input" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g., 9988776655" required disabled={isSubmittingState}/></div>
                            <div className="form-input-group"><label htmlFor="email" className="form-label">Email Address *</label><input id="email" name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} placeholder="e.g., jane.doe@example.com" required disabled={isSubmittingState}/></div>
                        </div>
                        <div className="form-input-group"><label htmlFor="city" className="form-label">City *</label><input id="city" name="city" type="text" className="form-input" value={formData.city} onChange={handleChange} placeholder="e.g., New Delhi" required disabled={isSubmittingState}/></div>
                        
                        <div className="form-input-group">
                            <label htmlFor="localAddress" className="form-label">Local Address *</label>
                            <textarea id="localAddress" name="localAddress" className="form-textarea" value={formData.localAddress} onChange={handleChange} placeholder="Street Address, Area, Pin Code for current/local residence" required disabled={isSubmittingState}/>
                        </div>
                        <div className="form-input-group" style={{ marginBottom: '40px' }}>
                            <label htmlFor="permanentAddress" className="form-label">Permanent Address *</label>
                            <textarea id="permanentAddress" name="permanentAddress" className="form-textarea" value={formData.permanentAddress} onChange={handleChange} placeholder="Street Address, Area, Pin Code for permanent residence" required disabled={isSubmittingState}/>
                        </div>
                        
                        {/* === EDUCATION DOCUMENTS SECTION ( OPTIONAL) === */}
                        <h2 className="form-section-header">Education Documents</h2>
                        <div className="form-grid-2col">
                            <DocumentInput 
                                id="tenthMarksheet" label="10th Marksheet" name="tenthMarksheet" 
                                file={formData.tenthMarksheet} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false}
                            />
                            <DocumentInput 
                                id="twelfthMarksheet" label="12th Marksheet" name="twelfthMarksheet" 
                                file={formData.twelfthMarksheet} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false}
                            />
                        </div>
                        <div className="form-grid-2col">
                            <DocumentInput 
                                id="bachelorsDegree" label="Bachelor's Degree Certificate" name="bachelorsDegree" 
                                file={formData.bachelorsDegree} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false}
                            />
                            <DocumentInput 
                                id="bachelorsResult" label="Bachelor's Transcript/Result" name="bachelorsResult" 
                                file={formData.bachelorsResult} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false}
                            />
                        </div>

                        <h2 className="form-section-header" style={{marginTop: '30px'}}>Master's Documents (Optional)</h2>
                        <div className="form-grid-2col">
                            <DocumentInput 
                                id="mastersDegree" label="Master's Degree Certificate (Optional)" name="mastersDegree" 
                                file={formData.mastersDegree} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false}
                            />
                            <DocumentInput 
                                id="mastersResult" label="Master's Transcript/Result (Optional)" name="mastersResult" 
                                file={formData.mastersResult} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false}
                            />
                        </div>
                        
                        {/* === VERIFICATION & OTHER DOCUMENTS SECTION ( OPTIONAL) === */}
                        <h2 className="form-section-header" style={{marginTop: '30px'}}>Verification & Other Documents</h2>
                        <DocumentInput 
                            id="identityProof" label="Identity Proof (PAN Card / Voter ID)" name="identityProof" 
                            file={formData.identityProof} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false} helpText="Upload a copy of your PAN Card or Voter ID (Optional). Accepted formats: PDF, DOCX. Max file size: 5MB."
                        />
                        <DocumentInput 
                            id="policeVerification" label="Police Verification (Passport/PCC)" name="policeVerification" 
                            file={formData.policeVerification} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false} helpText="Upload a copy of your Passport or Police Clearance Certificate (PCC) (Optional). Accepted formats: PDF, DOCX. Max file size: 5MB."
                        />
                        <DocumentInput 
                            id="aadhaarOrDomicile" label="Aadhaar Card or Domicile Certificate" name="aadhaarOrDomicile" 
                            file={formData.aadhaarOrDomicile} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false} helpText="Proof of identity/residency (Optional). Accepted formats: PDF, DOCX. Max file size: 5MB."
                        />

                        {/* Relieving Letter (Multi-file - OPTIONAL) */}
                        <div className="form-input-group">
                            <label htmlFor="relievingLetter" className="form-label">Relieving Letter from last Employer (Multiple files accepted, Optional)</label>
                            <input 
                                id="relievingLetter" name="relievingLetter" type="file" multiple
                                className="form-file-input" onChange={handleMultiFileChange}
                                accept=".pdf,.docx" disabled={isSubmittingState} required={false}
                            />
                            {formData.relievingLetter.length > 0 && (
                                <p className="file-selected-text">
                                    **Selected Letters:** {displayFileNames(formData.relievingLetter)}
                                </p>
                            )}
                            <p className="file-input-help-text">
                                Optional: Upload all Relieving Letters/Experience Certificates. Accepted formats: PDF, DOCX. Max file size: 5MB per file.
                            </p>
                        </div>

                        <div className="form-grid-2col">
                            {/* Multi-file input: Salary Slips (OPTIONAL) */}
                            <div className="form-input-group">
                                <label htmlFor="salarySlips" className="form-label">Salary Slips (Last 3 Months) (Optional)</label>
                                <input 
                                    id="salarySlips" name="salarySlips" type="file" multiple
                                    className="form-file-input" onChange={handleMultiFileChange}
                                    accept=".pdf,.docx" disabled={isSubmittingState} required={false}
                                />
                                {formData.salarySlips.length > 0 && (
                                    <p className="file-selected-text">
                                        **Selected Slips:** {displayFileNames(formData.salarySlips)}
                                    </p>
                                )}
                                <p className="file-input-help-text">
                                    Optional: Upload at least one salary slip. Accepted formats: PDF, DOCX. Max file size: 5MB per file.
                                </p>
                            </div>

                            {/* MANDATORY: Previous HR Email (Text field remains MANDATORY) */}
                            <div className="form-input-group">
                                <label htmlFor="previousHrEmail" className="form-label">Previous HR Email *</label>
                                <input 
                                    id="previousHrEmail" name="previousHrEmail" type="email"
                                    className="form-input" value={formData.previousHrEmail} 
                                    onChange={handleChange} 
                                    placeholder="e.g., hr@previouscompany.com" 
                                    disabled={isSubmittingState}
                                    required // This remains MANDATORY
                                />
                                <p className="file-input-help-text">
                                    Mandatory: Email of the previous HR for verification.
                                </p>
                            </div>
                        </div>
                        
                        {/* Optional: Bank Details */}
                        <DocumentInput 
                            id="bankDetails" label="Bank Details Proof (e.g., Cancelled Cheque/Statement) (Optional)" name="bankDetails" 
                            file={formData.bankDetails} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false} />

                        {/* Optional: Resume/CV */}
                        <DocumentInput 
                            id="resume" label="Resume/CV (Optional)" name="resume" 
                            file={formData.resume} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false}
                        />

                        {/* Optional: Other Certificates */}
                        <div className="form-input-group">
                            <label htmlFor="otherCertificates" className="form-label">Other Certificates/Awards (Optional)</label>
                            <input 
                                id="otherCertificates" name="otherCertificates" type="file" multiple
                                className="form-file-input" onChange={handleMultiFileChange}
                                accept=".pdf,.docx" disabled={isSubmittingState} required={false}
                            />
                            {formData.otherCertificates.length > 0 && (
                                <p className="file-selected-text">
                                    **Selected Certificates:** {displayFileNames(formData.otherCertificates)}
                                </p>
                            )}
                            <p className="file-input-help-text">
                                Upload multiple files. Accepted formats: PDF, DOCX. Max file size: 5MB per file.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={isSubmittingState}
                        >
                            {getSubmitButtonText()}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
};

export default RegisterNewCheck;

