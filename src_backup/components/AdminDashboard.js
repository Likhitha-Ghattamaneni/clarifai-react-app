import React, { useState, useRef } from "react";
import { fetchAuthSession } from 'aws-amplify/auth';
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import "./AdminDashboard.css";
import { apiConfig } from '../aws-config';

export default function AdminDashboard({ signOut }) {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const [query, setQuery] = useState("");
  const [querying, setQuerying] = useState(false);
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setUploadStatus('');
    setProgress(0);
  }

  async function uploadFile() {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadStatus('Reading file...');
    
    try {
      // Get the JWT token from Cognito
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Convert file to base64
      const base64File = await toBase64(file);
      setUploadStatus('Uploading to server...');
      setProgress(50);
      
      // Call upload Lambda through API Gateway
      const result = await fetch(apiConfig.uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileContent: base64File,
          contentType: file.type
        })
      });
      
      if (!result.ok) {
        throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
      }
      
      alert('Document uploaded successfully! Remember to sync your Knowledge Base in AWS Console.');
      setProgress(100);
      setUploadStatus('✅ Upload successful!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus(`❌ Error: ${error.message || 'Upload failed'}`);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }

    const currentQuery = query.trim();
    setQuerying(true);
    setQuery("");
    setResponse("Thinking...");

    try {
      // Get the JWT token from Cognito
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Call query Lambda through API Gateway
      const result = await fetch(apiConfig.queryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: currentQuery
        })
      });

      if (!result.ok) {
        throw new Error(`API Error: ${result.status} ${result.statusText}`);
      }

      const data = await result.json();
      const answer = data.response || data.answer || data.text || JSON.stringify(data);
      const citations = data.citations || [];
      
      let formattedResponse = answer;
      if (citations.length > 0) {
        formattedResponse += '\n\nSources:\n' + citations.map((cite, idx) => 
          `${idx + 1}. ${cite.title || cite.uri || cite}`
        ).join('\n');
      }
      setResponse(formattedResponse);
      setHistory((h) => [{ id: Date.now(), q: currentQuery, a: formattedResponse }, ...h]);
    } catch (error) {
      console.error("Error querying API:", error);
      const errorMessage = `Error: ${error.message || 'Could not get a response.'}`;
      setResponse(errorMessage);
      setHistory((h) => [{ id: Date.now(), q: currentQuery, a: errorMessage }, ...h]);
    } finally {
      setQuerying(false);
    }
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
          <button className="btn outline" type="button" onClick={signOut}>
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
              <div className="dz-hint">Max 25MB · PDF, TXT, DOC, DOCX</div>
            </div>
            <input className="displayNone"
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={onFileChange}
            />            
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
                <button className="btn" onClick={uploadFile} disabled={uploading || !file} type="button">
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                <p className="info-text">
                  After uploading, remember to sync your Knowledge Base in AWS Bedrock Console.
                </p>
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

          {uploadStatus && (
            <div className="helper" style={{ marginTop: '10px' }}>{uploadStatus}</div>
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
            <button onClick={handleSend} disabled={querying || !query.trim()}>
              {querying ? 'Processing...' : 'Ask Question'}
            </button>
          </div>

          {/* <textarea
            className="textarea"
            placeholder="Response will appear here…"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={6}
          /> */}
          {response ? (
            <div className="markdown-content textarea">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          ) : (
            <div className="markdown-content textarea placeholder-text">
              Responses will appear here…
            </div>
          )}

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
                    <div className="markdown-content">
                      <ReactMarkdown>{item.a}</ReactMarkdown>
                    </div>
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

// Helper function to convert a file to a base64 string
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = error => reject(error);
});
