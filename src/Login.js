import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Redirect to dashboard if session cookie exists
  useEffect(() => {
    if (Cookies.get('session')) {
      navigate('/portal/dashboard');
    }
  }, [navigate]);

  const handleLogin = (event) => {
    event.preventDefault();

    // Hardcoded credentials for demonstration
    const validEmail = 'dabadacademy@gmail.com';
    const validPassword = 'dabad@123';

    if (email === validEmail && password === validPassword) {
      // Set cookie for session management
      Cookies.set('session', 'user-session-token', { expires: 1 }); // expires in 1 day
      navigate('/portal/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#333' }}>Login</h1>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '5px',
                border: '1px solid #ddd',
              }}
              placeholder="Enter Email Address..."
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '5px',
                border: '1px solid #ddd',
              }}
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            style={{
              display: 'inline-block',
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              backgroundColor: '#4e73df',
              color: 'white',
              textAlign: 'center',
              textDecoration: 'none',
              marginTop: '1rem',
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
