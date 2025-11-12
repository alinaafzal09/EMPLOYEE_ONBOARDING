import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./reg.css";

// --- DocumentInput Component  ---
const DocumentInput = ({
  id,
  label,
  name,
  file,
  handler,
  isSubmitting,
  required,
  helpText = "Accepted formats: PDF, DOCX. Max file size: 5MB.",
}) => (
  <div className="form-input-group">
    <label htmlFor={id} className="form-label">
      {label}
      {required ? " *" : " (Optional)"}
    </label>
    <input
      id={id}
      name={name}
      type="file"
      className="form-file-input"
      onChange={handler}
      // Ensure all file inputs consistently accept both PDF and DOCX
      accept=".pdf,.docx"
      required={required}
      disabled={isSubmitting}
    />
    {file && (
      <p className="file-selected-text">**Selected File:** {file.name}</p>
    )}
    <p className="file-input-help-text">{helpText}</p>
  </div>
);

const RegisterNewCheck = () => {
  //  INITIALIZE HOOK: Get the navigation function
  const navigate = useNavigate();

  const initialState = {
    candidateName: "",
    city: "",
    localAddress: "",
    permanentAddress: "",
    phoneNumber: "",
    email: "",
    employer: "",
    previousHrEmail: "",

    // Single Document Fields
    tenthMarksheet: null,
    twelfthMarksheet: null,
    bachelorsDegree: null,
    bachelorsResult: null,
    mastersDegree: null,
    mastersResult: null,
    bankDetails: null,
    resume: null,
    identityProof: null,
    policeVerification: null,
    aadhaarOrDomicile: null,

    // Multi-Document Fields
    relievingLetter: [],
    salarySlips: [],
    otherCertificates: [],
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(0); // 0: idle, 1: loading, 2: success, 3: error
  // Added state to hold specific error message
  const [errorMessage, setErrorMessage] = useState("");

  // Standard change handler for text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handler for single-file inputs
  const handleSingleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  // Special change handler for multi-file inputs
  const handleMultiFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Array.from(files) })); // keep array
  };

  // Helper function to display file names for multi-file fields
  const displayFileNames = (files) => {
    return files.length > 0
      ? files.map((f) => f.name).join(", ")
      : "No files selected.";
  };

  // 6. SUBMIT HANDLER FOR JSON METADATA + FILE UPLOAD (UPDATED TO 2-API FLOW)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  setIsSubmitting(true);
  setSubmissionStatus(1);
  setErrorMessage("");

  if (!formData.previousHrEmail || !formData.candidateName || !formData.email) {
    alert("Validation Error: Missing mandatory fields.");
    setIsSubmitting(false);
    setSubmissionStatus(3);
    setErrorMessage("Mandatory text fields are missing.");
    return;
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const isPdfOrDocx = (f) => {
    if (!f) return false;
    const name = f.name.toLowerCase();
    const validExt = name.endsWith(".pdf") || name.endsWith(".docx");
    return validExt && f.size <= MAX_FILE_SIZE;
  };

  try {
    // ✅ 1. Send form data to backend
    const metadata = {
      candidateName: formData.candidateName,
      city: formData.city,
      localAddress: formData.localAddress,
      permanentAddress: formData.permanentAddress,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      employer: formData.employer,
      previousHrEmail: formData.previousHrEmail,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("http://localhost:8000/api/register-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) throw new Error("Failed to send form data");
    console.log("✅ Form data sent successfully");

    // ✅ 2. Upload all PDF/DOCX files
    const SINGLE_KEYS = [
      "tenthMarksheet", "twelfthMarksheet", "bachelorsDegree",
      "bachelorsResult", "mastersDegree", "mastersResult",
      "bankDetails", "resume", "identityProof",
      "policeVerification", "aadhaarOrDomicile",
    ];

    const MULTI_KEYS = ["relievingLetter", "salarySlips", "otherCertificates"];

    // --- Single-file uploads ---
    for (const key of SINGLE_KEYS) {
      const file = formData[key];
      if (file && isPdfOrDocx(file)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("fieldName", key);

        const uploadRes = await fetch("http://localhost:8000/api/upload-file", {
          method: "POST",
          body: fd,
        });

        if (!uploadRes.ok) throw new Error(`Failed to upload ${key}`);
        const result = await uploadRes.json();

        console.log(`📂 Uploaded Successfully: ${file.name}`, result);
      }
    }

    // --- Multi-file uploads ---
    for (const key of MULTI_KEYS) {
      const files = formData[key] || [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (isPdfOrDocx(file)) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("fieldName", key);
          fd.append("index", i);

          const uploadRes = await fetch("http://localhost:8000/api/upload-file", {
            method: "POST",
            body: fd,
          });

          if (!uploadRes.ok) throw new Error(`Failed to upload ${key}[${i}]`);
          const result = await uploadRes.json();

          console.log(`📂 Uploaded Successfully: ${file.name}`, result);
        }
      }
    }

    // ✅ Done
    console.log("✅ All uploads completed successfully.");
    setSubmissionStatus(2);
    setTimeout(() => navigate("/dashboard/check-status", { replace: true }), 1500);
    setFormData(initialState);

  } catch (err) {
    console.error("❌ Upload error:", err);
    setErrorMessage(err.message);
    setSubmissionStatus(3);
  } finally {
    setIsSubmitting(false);
  }
};


  // --- JSX RENDER ---

  const isFormActive = submissionStatus === 0 || submissionStatus === 3;
  const isSubmittingState = isSubmitting && submissionStatus === 1;

  const getSubmitButtonText = () => {
    if (submissionStatus === 1) return "Processing Files... Please Wait";
    if (submissionStatus === 3) return "Retry Submission";
    return "Submit Check Request";
  };

  return (
    <main className="main-content">
      <header className="main-header">
        <h1 className="header-title">Request New Background Check</h1>
        <p style={{ color: "#9ca3af", fontSize: "1rem", marginTop: "5px" }}>
          *Please fill out the candidate's details. Document uploads are now
          **optional** but recommended.
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
            ❌ **Error!**{" "}
            {errorMessage ||
              "Submission failed. Please check the required fields and network connection."}
          </div>
        )}

        {/* === FORM CONTAINER - Form is rendered if active or loading (1) === */}
        {(isFormActive || submissionStatus === 1) && (
          // Removed e.target.reset() from the end of handleSubmit
          <form onSubmit={handleSubmit}>
            {/* === CANDIDATE INFORMATION SECTION (Text fields remain MANDATORY) === */}
            <h2 className="form-section-header">Candidate Details</h2>

            <div className="form-grid-2col">
              <div className="form-input-group">
                <label htmlFor="candidateName" className="form-label">
                  Candidate Full Name *
                </label>
                <input
                  id="candidateName"
                  name="candidateName"
                  type="text"
                  className="form-input"
                  value={formData.candidateName}
                  onChange={handleChange}
                  placeholder="e.g., Jane Doe"
                  required
                  disabled={isSubmittingState}
                />
              </div>
              <div className="form-input-group">
                <label htmlFor="employer" className="form-label">
                  Employer / Company *
                </label>
                <input
                  id="employer"
                  name="employer"
                  type="text"
                  className="form-input"
                  value={formData.employer}
                  onChange={handleChange}
                  placeholder="e.g., Trident Info Systems"
                  required
                  disabled={isSubmittingState}
                />
              </div>
            </div>
            <div className="form-grid-2col">
              <div className="form-input-group">
                <label htmlFor="phoneNumber" className="form-label">
                  Phone Number *
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className="form-input"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g., 9988776655"
                  required
                  disabled={isSubmittingState}
                />
              </div>
              <div className="form-input-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., jane.doe@example.com"
                  required
                  disabled={isSubmittingState}
                />
              </div>
            </div>
            <div className="form-input-group">
              <label htmlFor="city" className="form-label">
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., New Delhi"
                required
                disabled={isSubmittingState}
              />
            </div>

            <div className="form-input-group">
              <label htmlFor="localAddress" className="form-label">
                Local Address *
              </label>
              <textarea
                id="localAddress"
                name="localAddress"
                className="form-textarea"
                value={formData.localAddress}
                onChange={handleChange}
                placeholder="Street Address, Area, Pin Code for current/local residence"
                required
                disabled={isSubmittingState}
              />
            </div>
            <div className="form-input-group" style={{ marginBottom: "40px" }}>
              <label htmlFor="permanentAddress" className="form-label">
                Permanent Address *
              </label>
              <textarea
                id="permanentAddress"
                name="permanentAddress"
                className="form-textarea"
                value={formData.permanentAddress}
                onChange={handleChange}
                placeholder="Street Address, Area, Pin Code for permanent residence"
                required
                disabled={isSubmittingState}
              />
            </div>

            {/* === EDUCATION DOCUMENTS SECTION ( OPTIONAL) === */}
            <h2 className="form-section-header">Education Documents</h2>
            <div className="form-grid-2col">
              <DocumentInput
                id="tenthMarksheet"
                label="10th Marksheet"
                name="tenthMarksheet"
                file={formData.tenthMarksheet}
                handler={handleSingleFileChange}
                isSubmitting={isSubmittingState}
                required={false}
              />
              <DocumentInput
                id="twelfthMarksheet"
                label="12th Marksheet"
                name="twelfthMarksheet"
                file={formData.twelfthMarksheet}
                handler={handleSingleFileChange}
                isSubmitting={isSubmittingState}
                required={false}
              />
            </div>
            <div className="form-grid-2col">
              <DocumentInput
                id="bachelorsDegree"
                label="Bachelor's Degree Certificate"
                name="bachelorsDegree"
                file={formData.bachelorsDegree}
                handler={handleSingleFileChange}
                isSubmitting={isSubmittingState}
                required={false}
              />
              <DocumentInput
                id="bachelorsResult"
                label="Bachelor's Transcript/Result"
                name="bachelorsResult"
                file={formData.bachelorsResult}
                handler={handleSingleFileChange}
                isSubmitting={isSubmittingState}
                required={false}
              />
            </div>

            <h2 className="form-section-header" style={{ marginTop: "30px" }}>
              Master's Documents (Optional)
            </h2>
            <div className="form-grid-2col">
              <DocumentInput
                id="mastersDegree"
                label="Master's Degree Certificate (Optional)"
                name="mastersDegree"
                file={formData.mastersDegree}
                handler={handleSingleFileChange}
                isSubmitting={isSubmittingState}
                required={false}
              />
              <DocumentInput
                id="mastersResult"
                label="Master's Transcript/Result "
                name="mastersResult"
                file={formData.mastersResult}
                handler={handleSingleFileChange}
                isSubmitting={isSubmittingState}
                required={false}
              />
            </div>

            {/* === VERIFICATION & OTHER DOCUMENTS SECTION ( OPTIONAL) === */}
            <h2 className="form-section-header" style={{ marginTop: "30px" }}>
              Verification & Other Documents
            </h2>
            <DocumentInput
              id="identityProof"
              label="Identity Proof (PAN Card / Voter ID)"
              name="identityProof"
              file={formData.identityProof}
              handler={handleSingleFileChange}
              isSubmitting={isSubmittingState}
              required={false}
              helpText="Upload a copy of your PAN Card or Voter ID (Optional). Accepted formats: PDF, DOCX. Max file size: 5MB."
            />
            <DocumentInput
              id="policeVerification"
              label="Police Verification (Passport/PCC)"
              name="policeVerification"
              file={formData.policeVerification}
              handler={handleSingleFileChange}
              isSubmitting={isSubmittingState}
              required={false}
              helpText="Upload a copy of your Passport or Police Clearance Certificate (PCC) (Optional). Accepted formats: PDF, DOCX. Max file size: 5MB."
            />
            <DocumentInput
              id="aadhaarOrDomicile"
              label="Aadhaar Card or Domicile Certificate"
              name="aadhaarOrDomicile"
              file={formData.aadhaarOrDomicile}
              handler={handleSingleFileChange}
              isSubmitting={isSubmittingState}
              required={false}
              helpText="Proof of identity/residency (Optional). Accepted formats: PDF, DOCX. Max file size: 5MB."
            />

            {/* Relieving Letter (Multi-file - OPTIONAL) */}
            <div className="form-input-group">
              <label htmlFor="relievingLetter" className="form-label">
                Relieving Letter from last Employer (Multiple files accepted,
                Optional)
              </label>
              <input
                id="relievingLetter"
                name="relievingLetter"
                type="file"
                multiple
                className="form-file-input"
                onChange={handleMultiFileChange}
                accept=".pdf,.docx"
                disabled={isSubmittingState}
                required={false}
              />
              {formData.relievingLetter.length > 0 && (
                <p className="file-selected-text">
                  **Selected Letters:**{" "}
                  {displayFileNames(formData.relievingLetter)}
                </p>
              )}
              <p className="file-input-help-text">
                Optional: Upload all Relieving Letters/Experience Certificates.
                Accepted formats: PDF, DOCX. Max file size: 5MB per file.
              </p>
            </div>

            <div className="form-grid-2col">
              {/* Multi-file input: Salary Slips (OPTIONAL) */}
              <div className="form-input-group">
                <label htmlFor="salarySlips" className="form-label">
                  Salary Slips (Last 3 Months) (Optional)
                </label>
                <input
                  id="salarySlips"
                  name="salarySlips"
                  type="file"
                  multiple
                  className="form-file-input"
                  onChange={handleMultiFileChange}
                  accept=".pdf,.docx"
                  disabled={isSubmittingState}
                  required={false}
                />
                {formData.salarySlips.length > 0 && (
                  <p className="file-selected-text">
                    **Selected Slips:** {displayFileNames(formData.salarySlips)}
                  </p>
                )}
                <p className="file-input-help-text">
                  Optional: Upload at least one salary slip. Accepted formats:
                  PDF, DOCX. Max file size: 5MB per file.
                </p>
              </div>

              {/* MANDATORY: Previous HR Email (Text field remains MANDATORY) */}
              <div className="form-input-group">
                <label htmlFor="previousHrEmail" className="form-label">
                  Previous HR Email *
                </label>
                <input
                  id="previousHrEmail"
                  name="previousHrEmail"
                  type="email"
                  className="form-input"
                  value={formData.previousHrEmail}
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
              id="bankDetails"
              label="Bank Details Proof (e.g., Cancelled Cheque/Statement) "
              name="bankDetails"
              file={formData.bankDetails}
              handler={handleSingleFileChange}
              isSubmitting={isSubmittingState}
              required={false}
            />

            {/* Optional: Resume/CV */}
            <DocumentInput
              id="resume"
              label="Resume/CV (Optional)"
              name="resume"
              file={formData.resume}
              handler={handleSingleFileChange}
              isSubmitting={isSubmittingState}
              required={false}
            />

            {/* Optional: Other Certificates */}
            <div className="form-input-group">
              <label htmlFor="otherCertificates" className="form-label">
                Other Certificates/Awards (Optional)
              </label>
              <input
                id="otherCertificates"
                name="otherCertificates"
                type="file"
                multiple
                className="form-file-input"
                onChange={handleMultiFileChange}
                accept=".pdf,.docx"
                disabled={isSubmittingState}
                required={false}
              />
              {formData.otherCertificates.length > 0 && (
                <p className="file-selected-text">
                  **Selected Certificates:**{" "}
                  {displayFileNames(formData.otherCertificates)}
                </p>
              )}
              <p className="file-input-help-text">
                Upload multiple files. Accepted formats: PDF, DOCX. Max file
                size: 5MB per file.
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
