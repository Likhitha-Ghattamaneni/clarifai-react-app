import React, { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { apiConfig } from '../aws-config';
import './Dashboard.css';

export default function AdminDashboard() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [uploading, setUploading] = useState(false);
  const [querying, setQuerying] = useState(false);

  async function handleUpload() {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      // Get the JWT token from Cognito
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64File = e.target.result.split(',')[1];
        
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
        setFile(null);
        document.getElementById('file-input').value = '';
        setUploading(false);
      };
      
      reader.onerror = () => {
        alert('Failed to read file');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setUploading(false);
    }
  }

  async function handleQuery() {
    if (!query.trim()) {
      alert('Please enter a question');
      return;
    }

    setQuerying(true);
    setResponse('Processing your question...');

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
          question: query.trim()
        })
      });

      if (!result.ok) {
        throw new Error(`API Error: ${result.status} ${result.statusText}`);
      }

      const data = await result.json();
      const answer = data.answer || data.text || JSON.stringify(data);
      const citations = data.citations || [];
      
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
      <h2>Admin Dashboard</h2>
      
      <div className="dashboard-content">
        <div className="upload-section">
          <h3>Upload Documents</h3>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && <p>Selected: {file.name}</p>}
          <button onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
          <p className="info-text">
            After uploading, remember to sync your Knowledge Base in AWS Bedrock Console.
          </p>
        </div>

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
    </div>
  );
}


// import React, { useState } from 'react';
// import { API } from 'aws-amplify';
// import { apiConfig } from '../aws-config';
// import './Dashboard.css';

// export default function AdminDashboard() {
//   const [file, setFile] = useState(null);
//   const [query, setQuery] = useState('');
//   const [response, setResponse] = useState('');
//   const [uploading, setUploading] = useState(false);
//   const [querying, setQuerying] = useState(false);

//   async function handleUpload() {
//     if (!file) {
//       alert('Please select a file first');
//       return;
//     }

//     setUploading(true);
//     try {
//       // Convert file to base64
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const base64File = e.target.result.split(',')[1];
        
//         // Call upload Lambda through API Gateway
//         const result = await API.post('ClarifyAIAPI', '', {
//           body: {
//             fileName: file.name,
//             fileContent: base64File,
//             contentType: file.type
//           },
//           endpoint: apiConfig.uploadUrl
//         });

//         alert('Document uploaded successfully! Remember to sync your Knowledge Base in AWS Console.');
//         setFile(null);
//         // Clear the file input
//         document.getElementById('file-input').value = '';
//       };
//       reader.onerror = () => {
//         alert('Failed to read file');
//         setUploading(false);
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error('Upload error:', error);
//       alert('Upload failed: ' + error.message);
//     } finally {
//       setUploading(false);
//     }
//   }

//   async function handleQuery() {
//     if (!query.trim()) {
//       alert('Please enter a question');
//       return;
//     }

//     setQuerying(true);
//     setResponse('Processing your question...');

//     try {
//       // Call query Lambda through API Gateway
//       const result = await API.post('ClarifyAIAPI', '', {
//         body: {
//           question: query.trim()
//         },
//         endpoint: apiConfig.queryUrl
//       });

//       // Extract response based on your Lambda's return format
//       const answer = result.answer || result.text || JSON.stringify(result);
//       const citations = result.citations || [];
      
//       // Format response with citations
//       let formattedResponse = answer;
//       if (citations.length > 0) {
//         formattedResponse += '\n\nSources:\n' + citations.map((cite, idx) => 
//           `${idx + 1}. ${cite.title || cite.uri || cite}`
//         ).join('\n');
//       }
      
//       setResponse(formattedResponse);
//     } catch (error) {
//       console.error('Query error:', error);
//       setResponse('Error: ' + error.message);
//     } finally {
//       setQuerying(false);
//     }
//   }

//   return (
//     <div className="dashboard">
//       <h2>Admin Dashboard</h2>
      
//       <div className="dashboard-content">
//         <div className="upload-section">
//           <h3>Upload Documents</h3>
//           <input
//             id="file-input"
//             type="file"
//             accept=".pdf,.txt,.doc,.docx"
//             onChange={(e) => setFile(e.target.files[0])}
//           />
//           {file && <p>Selected: {file.name}</p>}
//           <button onClick={handleUpload} disabled={uploading || !file}>
//             {uploading ? 'Uploading...' : 'Upload Document'}
//           </button>
//           <p className="info-text">
//             After uploading, remember to sync your Knowledge Base in AWS Bedrock Console.
//           </p>
//         </div>

//         <div className="query-section">
//           <h3>Ask Questions</h3>
//           <textarea
//             placeholder="Enter your question about the documents..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             rows="3"
//           />
//           <button onClick={handleQuery} disabled={querying || !query.trim()}>
//             {querying ? 'Processing...' : 'Ask Question'}
//           </button>
          
//           {response && (
//             <div className="response-box">
//               <h4>Response:</h4>
//               <pre>{response}</pre>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import "./AdminDashboard.css";
// // import { getByDisplayValue } from "@testing-library/dom";

// // export default function AdminDashboard() {
// //   const navigate = useNavigate();

// //   const [file, setFile] = useState(null);
// //   const [uploading, setUploading] = useState(false);
// //   const [progress, setProgress] = useState(0);

// //   const [query, setQuery] = useState("");
// //   const [response, setResponse] = useState("");
// //   const [history, setHistory] = useState([]);

// //   function onFileChange(e) {
// //     const f = e.target.files?.[0];
// //     setFile(f || null);
// //     setProgress(0);
// //   }

// //   function uploadFile() {
// //     if (!file || uploading) return;
// //     setUploading(true);
// //     setProgress(0);
// //     // Simulated progress just for UI feel
// //     const timer = setInterval(() => {
// //       setProgress((p) => {
// //         if (p >= 100) {
// //           clearInterval(timer);
// //           setUploading(false);
// //           return 100;
// //         }
// //         return p + 8;
// //       });
// //     }, 120);
// //   }

// //   function handleSend() {
// //     if (!query.trim()) return;
// //     // Simulated “bot” response
// //     const botReply =
// //       "Thanks for your query. An admin will review and respond shortly.";
// //     setResponse(botReply);
// //     setHistory((h) => [
// //       { id: Date.now(), q: query.trim(), a: botReply },
// //       ...h,
// //     ]);
// //     setQuery("");
// //   }

// //   return (
// //     <div className="dashboard-wrap">
// //       <header className="dash-header">
// //         <button
// //           className="brand"
// //           onClick={() => navigate("/")}
// //           style={{ background: "none", border: "none", cursor: "pointer" }}
// //           aria-label="Go to Home"
// //           type="button"
// //         >
// //           <img src="/clarifyai_logo_bg.png" alt="ClarifyAI Logo" className="logo-dot" />
// //           ClarifyAI Admin
// //         </button>
// //         <div className="header-actions">
// //           <button className="btn ghost" type="button" onClick={() => navigate("/")}>
// //             Docs
// //           </button>
// //           <button
// //             className="btn outline"
// //             type="button"
// //             onClick={() => navigate("/admin-login")}
// //           >
// //             Logout
// //           </button>
// //         </div>
// //       </header>

// //       <main className="dashboard">
// //         {/* Left: Upload */}
// //         <section className="card">
// //           <h3 className="card-title">Upload Documents</h3>
// //           <p className="card-subtitle">
// //             Securely upload PDFs, images, or spreadsheets for review.
// //           </p>

// //           <label htmlFor="fileInput" className="dropzone">
// //             <div className="dz-icon">📄</div>
// //             <div className="dz-text">
// //               <strong>Click to choose</strong> or drag & drop
// //               <div className="dz-hint">Max 25MB · PDF, PNG, JPG, XLSX</div>
// //             </div>
// //             <input className="displayNone" id="fileInput" type="file" onChange={onFileChange} hidden />
            
// //           </label>

// //           {file && (
// //             <>
// //               <div className="file-row">
// //                 <div className="file-meta">
// //                   <div className="file-name" title={file.name}>
// //                     {file.name}
// //                   </div>
// //                   <div className="file-size">
// //                     {(file.size / (1024 * 1024)).toFixed(2)} MB
// //                   </div>
// //                 </div>
// //                 <button className="btn" onClick={uploadFile} disabled={uploading} type="button">
// //                   {uploading ? "Uploading…" : "Upload"}
// //                 </button>
// //               </div>

// //               <div className="progress" role="progressbar" aria-label="Upload progress">
// //                 <div
// //                   className="progress-bar"
// //                   style={{ width: `${progress}%` }}
// //                   aria-valuemin={0}
// //                   aria-valuemax={100}
// //                   aria-valuenow={progress}
// //                 />
// //               </div>
// //             </>
// //           )}

// //           <div className="helper">
// //             Tip: Keep filenames clear (e.g., <em>Policy_Q4_2025.pdf</em>).
// //           </div>
// //         </section>

// //         {/* Right: Chatbot */}
// //         <section className="card">
// //           <h3 className="card-title">Chatbot</h3>
// //           <p className="card-subtitle">
// //             Ask a question and draft a response. History is saved below.
// //           </p>

// //           <div className="chat-form">
// //             <input
// //               className="input"
// //               placeholder="Type a query…"
// //               value={query}
// //               onChange={(e) => setQuery(e.target.value)}
// //             />
// //             <button className="btn" onClick={handleSend} type="button">
// //               Send
// //             </button>
// //           </div>

// //           <textarea
// //             className="textarea"
// //             placeholder="Response will appear here…"
// //             value={response}
// //             onChange={(e) => setResponse(e.target.value)}
// //             rows={6}
// //           />

// //           <h4 className="section-title">Recent Queries</h4>
// //           <div className="history">
// //             {history.length === 0 ? (
// //               <div className="empty">No queries yet.</div>
// //             ) : (
// //               history.map((item) => (
// //                 <div key={item.id} className="history-item">
// //                   <div className="qa">
// //                     <span className="badge q">Q</span>
// //                     <p>{item.q}</p>
// //                   </div>
// //                   <div className="qa">
// //                     <span className="badge a">A</span>
// //                     <p>{item.a}</p>
// //                   </div>
// //                 </div>
// //               ))
// //             )}
// //           </div>
// //         </section>
// //       </main>

// //       <footer className="dash-footer">
// //         © {new Date().getFullYear()} ClarifyAI · Admin Dashboard
// //       </footer>
// //     </div>
// //   );
// // }
