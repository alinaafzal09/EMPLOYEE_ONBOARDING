// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import TopCards from "../components/TopCards";
import DataTable from "../components/DataTable";
import "./Home.css";

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
  "bankDetails",
];

// Compute status based on documents
const calculateStatus = (pendingFiles) => {
  let submitted = 0;

  REQUIRED_DOCS.forEach((doc) => {
    const val = pendingFiles?.[doc];

    if (Array.isArray(val) && val.length > 0) submitted++;
    else if (typeof val === "string" && val.length > 0) submitted++;
  });

  if (submitted === 0) return "PENDING";
  if (submitted < REQUIRED_DOCS.length) return "QUEUED";
  return "COMPLETED";
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalCandidates: 0,
    clear: 0,
    pending: 0,
  });
  const [paginationData, setPaginationData] = useState({});

  const fetchCandidatesData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://192.168.1.32:8001/candidates");
      if (!response.ok) throw new Error("Failed to fetch employee data");

      const data = await response.json();
      console.log("API Response:", data);

      const candidatesArray = Array.isArray(data)
        ? data
        : data.data || data.employees || data.candidates || [];

      // Process each candidate using document-based status
      const processed = candidatesArray.map((c) => {
        const pendingFiles = c.documents?.pendingFiles || {};
        return {
          ...c,
          computedStatus: calculateStatus(pendingFiles),
        };
      });

      const totalCandidates = processed.length;

      const clear = processed.filter(
        (x) => x.computedStatus === "COMPLETED"
      ).length;

      const pending = processed.filter(
        (x) => x.computedStatus === "PENDING"
      ).length;

      setSummaryData({
        totalCandidates,
        clear,
        pending,
      });

      setPaginationData(data.pagination || {});
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatesData();
  }, []);

  return (
    <main className="main-content">
      {/* Summary Cards */}
      <TopCards data={summaryData} />

      {/* Data Table */}
      {loading ? (
        <p className="loading-text">Loading candidates data...</p>
      ) : (
        <DataTable pagination={paginationData} />
      )}
    </main>
  );
};

export default Home;




