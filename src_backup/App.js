import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Home from './Home';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Login from './components/Login'; 
import './App.css';

function App() {
  return (
    <Routes>
      {/* 1. Landing page is now the public Home component */}
      <Route path="/" element={<Home />} />

      {/* 2. Cognito login page (Custom Login UI) */}
      <Route path="/login" element={<Login />} />

      {/* 3. Protected dashboards */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
    </Routes>
  );
}

function AuthenticatedApp() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          {/* The header is now inside the dashboard components, so we can remove the generic one */}
          <Routes>
            {/* Redirect root to the appropriate dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <RoleBasedDashboard user={user} signOut={signOut} />
            } />
            {/* Add other routes here if needed, e.g., a profile page */}
          </Routes>
        </div>
      )}
    </Authenticator>
  );
}

// Component to check user role and render appropriatefunction RoleBasedDashboard({ user }) {
function RoleBasedDashboard({ user, signOut }) {  
  const groups = user?.signInUserSession?.accessToken?.payload['cognito:groups'] || [];
  
  if (groups.includes('Admin')) {
    return <AdminDashboard user={user} signOut={signOut} />;
  } else if (groups.includes('User')) {
    return <UserDashboard user={user} signOut={signOut} />;
  } else {
    return (
      <div className="access-denied">
      <h2>Access Denied</h2>
      <p>You don't have the required permissions. Please contact your administrator.</p>
      <button type="button" onClick={signOut}>Sign out</button>
    </div>
    );
  }
}

export default App;