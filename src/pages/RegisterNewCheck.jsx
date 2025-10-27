import React, { useState } from 'react';
// 🎯 NEW IMPORT: Import useNavigate for redirection
import { useNavigate } from 'react-router-dom';
import './reg.css'; 

// --- DocumentInput Component (Standard helper component) ---
const DocumentInput = ({ id, label, name, file, handler, isSubmitting, required, helpText = "Accepted formats: PDF, DOCX. Max file size: 5MB." }) => (
    <div className="form-input-group">
        <label htmlFor={id} className="form-label">{label}</label>
        <input 
            id={id} name={name} type="file"
            className="form-file-input" onChange={handler}
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
    
    // 🎯 INITIALIZE HOOK: Get the navigation function
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
    
    // State to track submission status (0: idle, 1: loading, 2: success, 3: error)
    const [submissionStatus, setSubmissionStatus] = useState(0); 

    // 2. Standard change handler for text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 3. handler for single-file inputs
    const handleSingleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    };

    // 4. Special change handler for multi-file inputs
    const handleMultiFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    };

    // 5. Helper function to display file names for multi-file fields
    const displayFileNames = (files) => {
        return files.length > 0 
            ? files.map(f => f.name).join(', ') 
            : 'No files selected.';
    };

    // 6. SUBMIT HANDLER FOR JSON METADATA + FILE UPLOAD
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Block new submission if one is already active
        if (isSubmitting) return;

        // Reset status for new attempt
        setSubmissionStatus(1); // Set status to Loading (1)
        setIsSubmitting(true);

        try {
            // --- VALIDATION (unchanged) ---
            const mandatoryFiles = ["tenthMarksheet", "twelfthMarksheet", "bachelorsDegree", "bachelorsResult", "resume", "identityProof", "policeVerification", "aadhaarOrDomicile",];
            const missingFile = mandatoryFiles.find((key) => !formData[key]);
            
            if (!formData.previousHrEmail || missingFile || formData.relievingLetter.length === 0 || formData.salarySlips.length === 0) {
                const missingKey = !formData.previousHrEmail ? "Previous HR Email" : missingFile.replace(/([A-Z])/g, " $1").trim();
                throw new Error(`Please provide the mandatory field/document: ${missingKey}.`);
            }


            // 1) Build metadata_json and FormData ( original complex file logic)
            const metadata = { /* ... */ }; // unchanged
            const fd = new FormData();      // unchanged
            
            // Re-use existing FormData building logic here (Single-valued & Multi-valued doc types)
            
            // --- SIMULATE API CALL START ---
            
            // Simulating a successful response structure and delay for the progress bar
            await new Promise(resolve => setTimeout(resolve, 3000)); 
            
            // Placeholder for actual fetch() call (uncomment when ready):
            // const apiEndpoint = "http://192.168.10.56:8088/ingest-files";
            // const res = await fetch(apiEndpoint, { method: "POST", body: fd });
            // if (!res.ok) { /* ... handle server error ... */ }

            
            setSubmissionStatus(2); // Set status to Success (2)
            
            // Reset form and navigate after a brief delay so user can see the success message
            setTimeout(() => {
                setFormData(initialState);
                setSubmissionStatus(0); // Reset to Idle (0)
                if(e.target) e.target.reset();
                
                // 🎯 REDIRECTION: Navigate to the landing page after success
                navigate('/'); 

            }, 3000); 


        } catch (error) {
            console.error("Submission Error:", error);
            // Optionally, set the error message here: 
            // setErrorMsg(error.message); 
            setSubmissionStatus(3); // ⭐ Set status to Error (3)
            
            // Reset to idle after a delay so the user can try again
            setTimeout(() => setSubmissionStatus(0), 4000); 

        } finally {
            setIsSubmitting(false);
        }
    };
    

    // --- JSX RENDER  ---
    
    // ⭐ Conditional Rendering Logic
    // Form is active if Idle (0) or after Error timeout (3)
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
                    *Please fill out the candidate's details and attach **all mandatory documents** to initiate the check.
                </p>
            </header>

            <div className="form-card">
                
                {/* === CONDITIONAL STATUS MESSAGES === */}
                {submissionStatus === 1 && (
                    <div className="submission-message-box loading-box">
                        <p className="loading-text">Validating and uploading files...</p>
                        <div className="progress-bar-style"></div> {/* Add CSS for the visual bar here */}
                    </div>
                )}
                
                {submissionStatus === 2 && (
                    <div className="submission-message-box success-box">
                        ✅ **Success!** Check request submitted. Redirecting in a moment...
                    </div>
                )}
                
                {submissionStatus === 3 && (
                    <div className="submission-message-box error-box">
                        ❌ **Error!** Submission failed. Please check the required fields and network connection.
                    </div>
                )}

                {/* === FORM CONTAINER - Hidden while Success is displayed === */}
                {(isFormActive || submissionStatus === 1) && (
                    <form onSubmit={handleSubmit}>

                        {/* === CANDIDATE INFORMATION SECTION === */}
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
                        
                        {/* === EDUCATION DOCUMENTS SECTION === */}
                        <h2 className="form-section-header">Education Documents (PDFs preferred)</h2>
                        <div className="form-grid-2col">
                            <DocumentInput 
                                id="tenthMarksheet" label="10th Marksheet *" name="tenthMarksheet" 
                                file={formData.tenthMarksheet} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true}
                            />
                            <DocumentInput 
                                id="twelfthMarksheet" label="12th Marksheet *" name="twelfthMarksheet" 
                                file={formData.twelfthMarksheet} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true}
                            />
                        </div>
                        <div className="form-grid-2col">
                            <DocumentInput 
                                id="bachelorsDegree" label="Bachelor's Degree Certificate *" name="bachelorsDegree" 
                                file={formData.bachelorsDegree} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true}
                            />
                            <DocumentInput 
                                id="bachelorsResult" label="Bachelor's Transcript/Result *" name="bachelorsResult" 
                                file={formData.bachelorsResult} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true}
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
                        
                        {/* === VERIFICATION & OTHER DOCUMENTS SECTION === */}
                        <h2 className="form-section-header" style={{marginTop: '30px'}}>Verification & Other Documents</h2>
                        <DocumentInput 
                            id="identityProof" label="Identity Proof (PAN Card / Voter ID) *" name="identityProof" 
                            file={formData.identityProof} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true} 
                            helpText="Mandatory: Upload a copy of your PAN Card or Voter ID."
                        />
                        <DocumentInput 
                            id="policeVerification" label="Police Verification (Passport/PCC) *" name="policeVerification" 
                            file={formData.policeVerification} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true} 
                            helpText="Mandatory: Upload a copy of your Passport or Police Clearance Certificate (PCC)."
                        />
                        <DocumentInput 
                            id="aadhaarOrDomicile" label="Aadhaar Card or Domicile Certificate *" name="aadhaarOrDomicile" 
                            file={formData.aadhaarOrDomicile} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true} 
                            helpText="Mandatory: Proof of identity/residency."
                        />

                        {/* Relieving Letter (Multi-file - Mandatory) */}
                        <div className="form-input-group">
                            <label htmlFor="relievingLetter" className="form-label">Relieving Letter from last Employer * (Multiple files accepted)</label>
                            <input 
                                id="relievingLetter" name="relievingLetter" type="file" multiple
                                className="form-file-input" onChange={handleMultiFileChange}
                                accept=".pdf,.docx " disabled={isSubmittingState} required
                            />
                            {formData.relievingLetter.length > 0 && (
                                <p className="file-selected-text">
                                    **Selected Letters:** {displayFileNames(formData.relievingLetter)}
                                </p>
                            )}
                            <p className="file-input-help-text">
                                Mandatory: Upload all Relieving Letters/Experience Certificates.
                            </p>
                        </div>

                        <div className="form-grid-2col">
                            {/* MANDATORY: Multi-file input: Salary Slips (Min 1 file) */}
                            <div className="form-input-group">
                                <label htmlFor="salarySlips" className="form-label">Salary Slips (Last 3 Months) *</label>
                                <input 
                                    id="salarySlips" name="salarySlips" type="file" multiple
                                    className="form-file-input" onChange={handleMultiFileChange}
                                    accept=".pdf" disabled={isSubmittingState} required
                                />
                                {formData.salarySlips.length > 0 && (
                                    <p className="file-selected-text">
                                        **Selected Slips:** {displayFileNames(formData.salarySlips)}
                                    </p>
                                )}
                                <p className="file-input-help-text">
                                    Mandatory: Upload at least one salary slip.
                                </p>
                            </div>

                            {/* MANDATORY: Previous HR Email */}
                            <div className="form-input-group">
                                <label htmlFor="previousHrEmail" className="form-label">Previous HR Email *</label>
                                <input 
                                    id="previousHrEmail" name="previousHrEmail" type="email"
                                    className="form-input" value={formData.previousHrEmail} 
                                    onChange={handleChange} 
                                    placeholder="e.g., hr@previouscompany.com" 
                                    disabled={isSubmittingState}
                                    required 
                                />
                                <p className="file-input-help-text">
                                    Mandatory: Email of the previous HR for verification.
                                </p>
                            </div>
                        </div>
                        

                        {/* Optional: Bank Details */}
                        <DocumentInput 
                            id="bankDetails" label="Bank Details Proof (e.g., Cancelled Cheque/Statement) (Optional)" name="bankDetails" 
                            file={formData.bankDetails} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={false} 
                        />

                        {/* Mandatory: Resume/CV */}
                        <DocumentInput 
                            id="resume" label="Resume/CV *" name="resume" 
                            file={formData.resume} handler={handleSingleFileChange} isSubmitting={isSubmittingState} required={true}
                        />

                        {/* Optional: Other Certificates */}
                        <div className="form-input-group">
                            <label htmlFor="otherCertificates" className="form-label">Other Certificates/Awards (Optional)</label>
                            <input 
                                id="otherCertificates" name="otherCertificates" type="file" multiple
                                className="form-file-input" onChange={handleMultiFileChange}
                                accept=".pdf" disabled={isSubmittingState}
                            />
                            {formData.otherCertificates.length > 0 && (
                                <p className="file-selected-text">
                                    **Selected Certificates:** {displayFileNames(formData.otherCertificates)}
                                </p>
                            )}
                            <p className="file-input-help-text">
                                Upload multiple files.
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

