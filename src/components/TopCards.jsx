// src/components/TopCards.jsx
import React from "react";
// Import the new CSS file
import './TopCards.css'; 

import { UsersIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const TopCards = ({ data }) => {
  const cards = [
    { 
      title: "Total Candidates", 
      value: data.totalCandidates, 
      icon: UsersIcon,
      cssIconColor: "icon-green",
      cssBorderColor: "border-green"
    },
    { 
      title: "Clear this month", 
      value: data.clear, 
      subtitle: "this month",
      icon: CheckCircleIcon,
      cssIconColor: "icon-blue",
      cssBorderColor: "border-blue"
    },
    { 
      title: "Pending", 
      value: data.pending, 
      icon: ClockIcon,
      cssIconColor: "icon-yellow",
      cssBorderColor: "border-yellow"
    },
  ];

  return (
    // Use the single top-level CSS class
    <div className="cards-container">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            // Use the base card class and the specific border color class
            className={`card ${card.cssBorderColor}`}
          >
            <div className="card-content">
              <div>
                <p className="card-value">{card.value.toLocaleString()}</p>
                <h3 className="card-title">{card.title}</h3>
                {/* {card.subtitle && <p className="card-subtitle">{card.subtitle}</p>} */}
              </div>
              {/* Use the specific icon/ring color class */}
              <div className={`card-icon-wrapper ${card.cssIconColor}`}>
                 <Icon className="card-icon" /> {/* Icon size controlled by CSS */}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopCards;
