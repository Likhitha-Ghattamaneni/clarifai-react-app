import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";
import ReactMarkdown from 'react-markdown';
import { fetchAuthSession } from 'aws-amplify/auth';
import { apiConfig } from '../aws-config';

export default function UserDashboard({ signOut }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  // const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);
  const [querying, setQuerying] = useState(false);

  async function handleSend() {
    const q = query.trim();
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }
    // const ticketId = `#${Math.floor(100000 + Math.random() * 900000)}`;
    // const confirmation = `Your query has been sent to the admin. Ticket ${ticketId}.`;

    setQuerying(true);
    // setStatus(confirmation);
    setQuery("");
    setResponse("Searching for an answer...");

    try {
      // Get the JWT token from Cognito
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error('No authentication token available');
      }
     
      // Call API Gateway with JWT token 
      const result = await fetch(apiConfig.queryUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: q
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
      setHistory((h) => [{ id: Date.now(), q: q, a: formattedResponse, c: citations }, ...h]);
    } catch (error) {
      console.error("Error querying API:", error);
      const errorMessage = `Error: ${error.message || 'Could not get a response.'}`;
      setResponse(errorMessage);
      setHistory((h) => [{ id: Date.now(), q: q, a: errorMessage, c: [] }, ...h]);
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
          ClarifyAI User
        </button>
        <div className="header-actions">
          <button className="btn ghost" type="button" onClick={() => navigate("/")}>
            Help
          </button>
          <button className="btn outline" type="button" onClick={signOut}>
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
            <button className="btn" onClick={handleSend} disabled={querying || !query.trim()}> 
              {querying ? 'Processing...' : 'Ask Question'}
            </button>
          </div>

          {/* <textarea
            className="textarea"
            placeholder="Status and responses will appear here…"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={6}
            readOnly
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
        © {new Date().getFullYear()} ClarifyAI · User Dashboard
      </footer>
    </div>
  );
}
