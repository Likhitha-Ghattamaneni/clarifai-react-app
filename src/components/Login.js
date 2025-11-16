import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserLogin.css'; // Reuse existing styles
import { signIn, resetPassword, signUp, signOut } from 'aws-amplify/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error('error signing out: ', error);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use Cognito signIn
      const { signIn } = await import('aws-amplify/auth');
      const { isSignedIn, nextStep } = await signIn({ 
        username: email, 
        password 
      });

      if (isSignedIn) {
        // Get user session to check groups
        const { fetchAuthSession } = await import('aws-amplify/auth');
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];

        // Role-based redirect
        if (groups.includes('Admin')) {
          navigate('/admin-dashboard');
        } else if (groups.includes('User')) {
          navigate('/user-dashboard');
        } else {
          setError('Access Denied: No group assigned. Contact administrator.');
        }
      } else {
        console.log('Next step:', nextStep);
        setError('Additional authentication required. Check console.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }

//   function handleSignup() {
//     alert('Sign up page coming soon!');
//     // Or navigate to signup: navigate('/signup');
//   }

//   function handleForgotPassword() {
//     alert('Password reset coming soon!');
//     // Or navigate to reset: navigate('/reset-password');
//   }

  async function handleForgotPassword() {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }
    try {
      await resetPassword({ username: email });
      alert(`Password-reset code sent to ${email}. Check your inbox.`);
    } catch (err) {
      alert(err.message || 'Could not send reset code.');
    }
  }

  async function handleSignup() {
    if (!email) {
      alert('Please enter your email first.');
      return;
    }
    try {
      await signUp({
        username: email,
        password: password || 'TempPass123!', // let user type password in next step
        options: { userAttributes: { email } }
      });
      alert(`Verification code sent to ${email}. Check your inbox.`);
    } catch (err) {
      alert(err.message || 'Could not create account.');
    }
  }


  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/clarifyai_bg.png" alt="ClarifyAI Logo" style={{ width: '150px' }} />
        </div>
        <h2 className="login-title">Sign In</h2>
        <p className="login-subtitle">Welcome to ClarifyAI</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div className="login-options">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleForgotPassword(); }} 
              className="forgot-link"
              disabled={!email}
              style={{ background: 'none', border: 'none', cursor: email ? 'pointer' : 'not-allowed' }}
            >
              Forgot Password?
            </a>
          </div>

          <button type="submit" className="btn login-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button type="button" onClick={handleSignup} className="btn signup-btn">
            Create an Account
          </button>
        </form>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} ClarifyAI · User Portal
      </footer>
    </div>
  );
}