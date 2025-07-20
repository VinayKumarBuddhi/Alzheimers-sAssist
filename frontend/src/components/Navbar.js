import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, onLogout, user }) => {
  const navigate = useNavigate();
  return (
    <nav className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center shadow">
      <div className="text-xl font-bold">Alzheimer's Assist</div>
      <div className="flex items-center gap-4">
        {isAuthenticated && user && (
          <span className="font-semibold">{user.fullName || user.username}</span>
        )}
        {isAuthenticated ? (
          <button onClick={onLogout} className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-100 transition">Logout</button>
        ) : (
          <button onClick={() => navigate('/auth')} className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-100 transition">Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 