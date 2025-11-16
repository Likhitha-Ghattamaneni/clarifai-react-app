import React from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // We'll add styles here

export default function Home() {
  return (
    <div className="home-container">
      <div className="overlay">
        <div className="content-box">
          <img src="/clarifyai_bg.png" alt="ClarifyAI Logo" className="logo" />
          {/* <h1 className="title">ClarifyAI</h1> */}
          {/* <h2 className="subtitle">Company Document Insight Assistant</h2> */}
          <div className="button-group">
            <Link to="/login">
              <button className="btn admin-btn">Admin</button>
            </Link>
            {/* <Link to="/admin">
              <button className="btn admin-btn">Admin Dashboard</button>
            </Link> */}
            <Link to="/login">
              <button className="btn user-btn">User</button>
            </Link>
            {/* <Link to="/user">
              <button className="btn user-btn">User Dashboard</button>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
