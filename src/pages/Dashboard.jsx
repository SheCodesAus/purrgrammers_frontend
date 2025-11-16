import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-header">
          Welcome! This is your user dashboard
        </h1>
        <p className="dashboard-content-text">
          This will have your a link to your active boards
        </p>
        <p className="dashboard-content-text">
          as well as a link to create a new board
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
