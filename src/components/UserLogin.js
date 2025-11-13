import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLogin.css";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // DEV DEFAULT CREDENTIALS - safe for local development only
  // Use these to quickly sign in while developing. Remove or secure for production.
  const DEFAULT_USER = {
    email: "user@example.com",
    password: "user123",
  };

  function login(e) {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    // simple dev-only credential check
    if (email === DEFAULT_USER.email && password === DEFAULT_USER.password) {
      navigate("/user-dashboard");
    } else {
      alert("Invalid user credentials. Use user@example.com / user123 for dev login.");
    }
  }

  function signup() {
    alert("Sign up page coming soon!");
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">User Login</h2>
        <p className="login-subtitle">Welcome back! Please log in to continue.</p>

        <form onSubmit={login}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a href="/" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="btn login-btn">
            Login
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button type="button" onClick={signup} className="btn signup-btn">
            Create User Account
          </button>
        </form>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} ClarifyAI · User Portal
      </footer>
    </div>
  );
}
