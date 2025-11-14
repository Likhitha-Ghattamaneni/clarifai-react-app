import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './App.css';

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <Router>
          <div className="App">
            <header className="App-header">
              <h1>ClarifyAI</h1>
              <button onClick={signOut}>Sign Out</button>
            </header>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={
                <RoleBasedDashboard user={user} />
              } />
            </Routes>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

// Component to check user role and render appropriate dashboard
function RoleBasedDashboard({ user }) {
  const groups = user?.signInUserSession?.accessToken?.payload['cognito:groups'] || [];
  
  if (groups.includes('Admins')) {
    return <AdminDashboard />;
  } else if (groups.includes('Users')) {
    return <UserDashboard />;
  } else {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You don't have the required permissions. Please contact your administrator.</p>
      </div>
    );
  }
}

export default App;