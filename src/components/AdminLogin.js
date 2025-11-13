import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // DEV DEFAULT CREDENTIALS - safe for local development only
  // Use these to quickly sign in while developing. Remove or secure for production.
  const DEFAULT_ADMIN = {
    email: "admin@example.com",
    password: "admin123",
  };

  function login(e) {
    e.preventDefault();
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    // simple dev-only credential check
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      navigate("/admin-dashboard");
    } else {
      alert("Invalid admin credentials. Use admin@example.com / admin123 for dev login.");
    }
  }

  function signup() {
    alert("Sign up page coming soon!");
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>
        <p className="login-subtitle">Access the admin dashboard securely</p>

        <form onSubmit={login}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@example.com"
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
            Create Admin Account
          </button>
        </form>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} ClarifyAI · Admin Portal
      </footer>
    </div>
  );
}
