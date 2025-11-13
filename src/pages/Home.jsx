// src/pages/Home.jsx

import React, { useEffect, useState } from "react";
import TopCards from "../components/TopCards";
import DataTable from "../components/DataTable";
import "./Home.css";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalCandidates: 0,
    clear: 0,
    pending: 0,
  });
  const [paginationData, setPaginationData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch data only for summary & pagination
  const fetchCandidatesData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8088/employees");
      if (!response.ok) throw new Error("Failed to fetch employee data");

      const data = await response.json();
      console.log("✅ API Response:", data);

      const candidatesArray = Array.isArray(data)
        ? data
        : data.data || data.employees || data.candidates || [];

      const totalCandidates = candidatesArray.length;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const clearThisMonth = candidatesArray.filter((item) => {
        const updatedAt = new Date(item.updatedAt);
        return (
          item.status === "COMPLETED" &&
          updatedAt.getMonth() === currentMonth &&
          updatedAt.getFullYear() === currentYear
        );
      }).length;

      const pending = candidatesArray.filter(
        (item) => item.status !== "COMPLETED"
      ).length;

      setSummaryData({
        totalCandidates,
        clear: clearThisMonth,
        pending,
      });

      setPaginationData(data.pagination || {});
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatesData();
  }, []);

  return (
    <main className="main-content">
      {/* Header Section */}
      <header className="main-header">
        <h1 className="header-title">Hello HR 👋</h1>

        {/* Top Right Search Bar */}
        <div className="search-bar-wrapper">
          <input
            type="text"
            placeholder="Search candidate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <MagnifyingGlassIcon className="search-icon-small" />
        </div>
      </header>

      {/* TopCards Section */}
      <TopCards data={summaryData} />

      {/* Employee Data Table */}
      {loading ? (
        <p className="loading-text">Loading candidates data...</p>
      ) : (
        <DataTable pagination={paginationData} globalSearch={searchQuery} />
      )}
    </main>
  );
};

export default Home;



