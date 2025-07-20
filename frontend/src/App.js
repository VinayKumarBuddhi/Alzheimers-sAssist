import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // On mount, check for token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // On login/register success
  const handleAuthSuccess = (token, user) => {
    setIsAuthenticated(true);
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} user={user} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/auth" replace />
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
