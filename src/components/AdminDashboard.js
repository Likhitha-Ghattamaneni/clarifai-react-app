import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import { getByDisplayValue } from "@testing-library/dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setProgress(0);
  }

  function uploadFile() {
    if (!file || uploading) return;
    setUploading(true);
    setProgress(0);
    // Simulated progress just for UI feel
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setUploading(false);
          return 100;
        }
        return p + 8;
      });
    }, 120);
  }

  function handleSend() {
    if (!query.trim()) return;
    // Simulated “bot” response
    const botReply =
      "Thanks for your query. An admin will review and respond shortly.";
    setResponse(botReply);
    setHistory((h) => [
      { id: Date.now(), q: query.trim(), a: botReply },
      ...h,
    ]);
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
          ClarifyAI Admin
        </button>
        <div className="header-actions">
          <button className="btn ghost" type="button" onClick={() => navigate("/")}>
            Docs
          </button>
          <button
            className="btn outline"
            type="button"
            onClick={() => navigate("/admin-login")}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard">
        {/* Left: Upload */}
        <section className="card">
          <h3 className="card-title">Upload Documents</h3>
          <p className="card-subtitle">
            Securely upload PDFs, images, or spreadsheets for review.
          </p>

          <label htmlFor="fileInput" className="dropzone">
            <div className="dz-icon">📄</div>
            <div className="dz-text">
              <strong>Click to choose</strong> or drag & drop
              <div className="dz-hint">Max 25MB · PDF, PNG, JPG, XLSX</div>
            </div>
            <input className="displayNone" id="fileInput" type="file" onChange={onFileChange} hidden />
            
          </label>

          {file && (
            <>
              <div className="file-row">
                <div className="file-meta">
                  <div className="file-name" title={file.name}>
                    {file.name}
                  </div>
                  <div className="file-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
                <button className="btn" onClick={uploadFile} disabled={uploading} type="button">
                  {uploading ? "Uploading…" : "Upload"}
                </button>
              </div>

              <div className="progress" role="progressbar" aria-label="Upload progress">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                />
              </div>
            </>
          )}

          <div className="helper">
            Tip: Keep filenames clear (e.g., <em>Policy_Q4_2025.pdf</em>).
          </div>
        </section>

        {/* Right: Chatbot */}
        <section className="card">
          <h3 className="card-title">Chatbot</h3>
          <p className="card-subtitle">
            Ask a question and draft a response. History is saved below.
          </p>

          <div className="chat-form">
            <input
              className="input"
              placeholder="Type a query…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn" onClick={handleSend} type="button">
              Send
            </button>
          </div>

          <textarea
            className="textarea"
            placeholder="Response will appear here…"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={6}
          />

          <h4 className="section-title">Recent Queries</h4>
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
                    <span className="badge a">A</span>
                    <p>{item.a}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="dash-footer">
        © {new Date().getFullYear()} ClarifyAI · Admin Dashboard
      </footer>
    </div>
  );
}
