import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import './App.css';

// Dummy sign-out for AdminDashboard / UserDashboard props
const dummySignOut = () => {
  console.log('(dev) sign-out clicked');
};

function AppTest() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Direct access for local testing */}
      <Route path="/admin" element={<AdminDashboard signOut={dummySignOut} />} />
      <Route path="/user"  element={<UserDashboard  signOut={dummySignOut} />} />
    </Routes>
  );
}

export default AppTest;
