// src/pages/Home.jsx 

import React, { useEffect, useState } from "react";
// import Sidebar from "../components/Sidebar"; 
import TopCards from "../components/TopCards";
import DataTable from "../components/DataTable";
import './Home.css'; 

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Mock Data Source - Define this outside the component to keep it clean
const mockApiData = {
  summary: {
    totalCandidates: 5423,
    clearThisMonth: 1893,
    pending: 189,
  },
  candidates: [
    { id: 1, candidateName: "Shashwat Goel", employer: "Bajaj Capital", phoneNumber: "9876543290", email: "shash@bajajcapital.com", city: "San Francisco", status: "Clear" },
    { id: 2, candidateName: "Rushabh Nagori", employer: "Reliance Retail", phoneNumber: "9963074323", email: "nagon@relianceretail.com", city: "Los Angeles", status: "Discrepancy" },
    { id: 3, candidateName: "Shriya Patel", employer: "Yatra", phoneNumber: "9988776655", email: "s.patel@yatra.com", city: "London", status: "Discrepancy" },
    { id: 4, candidateName: "Prateek Mahajan", employer: "Hero Cycles", phoneNumber: "9876542340", email: "prateek.m@herocycles.com", city: "Manchester", status: "Clear" },
    { id: 5, candidateName: "Manan Mehta", employer: "Quess", phoneNumber: "9988772334", email: "mmehta@quesscorp.com", city: "Cleveland", status: "Clear" },
    { id: 6, candidateName: "Raghuv Gupta", employer: "Quess", phoneNumber: "9876540097", email: "rkhale@quesscorp.com", city: "Boston", status: "Clear" },
    { id: 7, candidateName: "Renuka Singh", employer: "Quess", phoneNumber: "9988774321", email: "rsingh@quesscorp.com", city: "Birmingham", status: "Clear" },
    { id: 8, candidateName: "Harsh Nagar", employer: "Reliance Retail", phoneNumber: "9988772245", email: "harsh@relianceretail.com", city: "New York City", status: "Pending" },
    // NOTE :  can add an 'apiKey' property here if needed
    // { id: 9, candidateName: "Example", ..., apiKey: "ABC-123" } 
  ],
  pagination: { currentPage: 1, totalPages: 256, totalEntries: 256000 }
};

// Mock API Call Function (Simulates fetching from a backend)
const mockFetchCandidatesData = () => {
    return new Promise(resolve => setTimeout(() => resolve(mockApiData), 500));
};

const Home = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({ totalCandidates: 0, clear: 0, pending: 0 });
  const [paginationData, setPaginationData] = useState({});

  useEffect(() => {
    mockFetchCandidatesData()
      .then((data) => {
        setCandidates(data.candidates);
        setSummaryData({ 
            totalCandidates: data.summary.totalCandidates, 
            clear: data.summary.clearThisMonth, 
            pending: data.summary.pending 
        });
        setPaginationData(data.pagination);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching mock data:", error);
        setLoading(false);
      });
  }, []);

  return (
    // FIX: Only render the main dashboard content area, 
    // as App.js provides the Sidebar and the overall layout container.
    <main className="main-content">
        
      {/* Header Section */}
      <header className="main-header">
        <h1 className="header-title">Hello HR 👋</h1>
        
        {/* Top Right Search Bar */}
        <div className="search-bar-wrapper">
          <input 
            type="text" 
            placeholder="Search" 
            className="search-input"
          />
          <MagnifyingGlassIcon className="search-icon-small" />
        </div>
      </header>

      {/* TopCards section */}
      <TopCards data={summaryData} />

      {/* Employee Data Table */}
      {loading ? (
        <p className="loading-text">Loading candidates data...</p>
      ) : (
        <DataTable candidates={candidates} pagination={paginationData} />
      )}
    </main>
  );
};

export default Home;

