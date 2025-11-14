import React, { useState } from 'react';
import { API } from 'aws-amplify';
import { apiConfig } from '../aws-config';
import './Dashboard.css';

export default function UserDashboard() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [querying, setQuerying] = useState(false);

  async function handleQuery() {
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }

    setQuerying(true);
    setResponse('Processing your question...');

    try {
      const result = await API.post('ClarifyAIAPI', '', {
        body: {
          question: query.trim()
        },
        endpoint: apiConfig.queryUrl
      });

      const answer = result.answer || result.text || JSON.stringify(result);
      const citations = result.citations || [];
      
      let formattedResponse = answer;
      if (citations.length > 0) {
        formattedResponse += '\n\nSources:\n' + citations.map((cite, idx) => 
          `${idx + 1}. ${cite.title || cite.uri || cite}`
        ).join('\n');
      }
      
      setResponse(formattedResponse);
    } catch (error) {
      console.error('Query error:', error);
      setResponse('Error: ' + error.message);
    } finally {
      setQuerying(false);
    }
  }

  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>
      
      <div className="query-section">
        <h3>Ask Questions</h3>
        <textarea
          placeholder="Enter your question about the documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows="3"
        />
        <button onClick={handleQuery} disabled={querying || !query.trim()}>
          {querying ? 'Processing...' : 'Ask Question'}
        </button>
        
        {response && (
          <div className="response-box">
            <h4>Response:</h4>
            <pre>{response}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./UserDashboard.css";

// export default function UserDashboard() {
//   const navigate = useNavigate();

//   const [query, setQuery] = useState("");
//   const [status, setStatus] = useState("");
//   const [history, setHistory] = useState([]);

//   function handleSend() {
//     const q = query.trim();
//     if (!q) return;
//     const ticketId = `#${Math.floor(100000 + Math.random() * 900000)}`;
//     const confirmation = `Your query has been sent to the admin. Ticket ${ticketId}.`;

//     setStatus(confirmation);
//     setHistory((h) => [{ id: Date.now(), q, ticketId }, ...h]);
//     setQuery("");
//   }

//   return (
//     <div className="dashboard-wrap">
//       <header className="dash-header">
//         <button
//           className="brand"
//           onClick={() => navigate("/")}
//           style={{ background: "none", border: "none", cursor: "pointer" }}
//           aria-label="Go to Home"
//           type="button"
//         >
//           <img src="/clarifyai_logo_bg.png" alt="ClarifyAI Logo" className="logo-dot" />
//           ClarifyAI User
//         </button>
//         <div className="header-actions">
//           <button className="btn ghost" type="button" onClick={() => navigate("/")}>
//             Help
//           </button>
//           <button
//             className="btn outline"
//             type="button"
//             onClick={() => navigate("/user-login")}
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <main className="dashboard user-grid">
//         <section className="card">
//           <h3 className="card-title">User Query</h3>
//           <p className="card-subtitle">
//             Ask your question. An admin will review and respond.
//           </p>

//           <div className="chat-form">
//             <input
//               className="input"
//               placeholder="Type your query…"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//             />
//             <button className="btn" onClick={handleSend} type="button">
//               Send
//             </button>
//           </div>

//           <textarea
//             className="textarea"
//             placeholder="Status and responses will appear here…"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//             rows={6}
//           />

//           <h4 className="section-title">Your Recent Queries</h4>
//           <div className="history">
//             {history.length === 0 ? (
//               <div className="empty">No queries yet.</div>
//             ) : (
//               history.map((item) => (
//                 <div key={item.id} className="history-item">
//                   <div className="qa">
//                     <span className="badge q">Q</span>
//                     <p>{item.q}</p>
//                   </div>
//                   <div className="qa">
//                     <span className="badge a">ID</span>
//                     <p>{item.ticketId}</p>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </section>
//       </main>

//       <footer className="dash-footer">
//         © {new Date().getFullYear()} ClarifyAI · User Dashboard
//       </footer>
//     </div>
//   );
// }
