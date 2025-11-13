import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);

  function handleSend() {
    const q = query.trim();
    if (!q) return;
    const ticketId = `#${Math.floor(100000 + Math.random() * 900000)}`;
    const confirmation = `Your query has been sent to the admin. Ticket ${ticketId}.`;

    setStatus(confirmation);
    setHistory((h) => [{ id: Date.now(), q, ticketId }, ...h]);
    setQuery("");
  }

  return (
    <div className="dashboard-wrap">
      <header className="dash-header">
        <button
          className="brand"
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", cursor: "pointer" }}
          aria-label="Go to Home"
          type="button"
        >
          <img src="/clarifyai_logo_bg.png" alt="ClarifyAI Logo" className="logo-dot" />
          ClarifyAI User
        </button>
        <div className="header-actions">
          <button className="btn ghost" type="button" onClick={() => navigate("/")}>
            Help
          </button>
          <button
            className="btn outline"
            type="button"
            onClick={() => navigate("/user-login")}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard user-grid">
        <section className="card">
          <h3 className="card-title">User Query</h3>
          <p className="card-subtitle">
            Ask your question. An admin will review and respond.
          </p>

          <div className="chat-form">
            <input
              className="input"
              placeholder="Type your query…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn" onClick={handleSend} type="button">
              Send
            </button>
          </div>

          <textarea
            className="textarea"
            placeholder="Status and responses will appear here…"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            rows={6}
          />

          <h4 className="section-title">Your Recent Queries</h4>
          <div className="history">
            {history.length === 0 ? (
              <div className="empty">No queries yet.</div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="qa">
                    <span className="badge q">Q</span>
                    <p>{item.q}</p>
                  </div>
                  <div className="qa">
                    <span className="badge a">ID</span>
                    <p>{item.ticketId}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="dash-footer">
        © {new Date().getFullYear()} ClarifyAI · User Dashboard
      </footer>
    </div>
  );
}
