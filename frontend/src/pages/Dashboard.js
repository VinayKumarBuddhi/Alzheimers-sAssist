import React, { useState } from 'react';
import AddFace from './AddFace';
import AllFaces from './AllFaces';
import RetrieveFace from './RetrieveFace';

const Dashboard = ({ user }) => {
  const [view, setView] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto mt-8">
        {user && (
          <div className="mb-6 text-lg font-semibold text-blue-800">Welcome, {user.fullName || user.username}!</div>
        )}
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setView('add')} className={`px-6 py-2 rounded font-semibold ${view === 'add' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border border-blue-700'} transition`}>Add Face</button>
          <button onClick={() => setView('retrieve')} className={`px-6 py-2 rounded font-semibold ${view === 'retrieve' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border border-blue-700'} transition`}>Retrieve Face</button>
          <button onClick={() => setView('all')} className={`px-6 py-2 rounded font-semibold ${view === 'all' ? 'bg-blue-700 text-white' : 'bg-white text-blue-700 border border-blue-700'} transition`}>All Faces</button>
        </div>
        <div>
          {view === 'add' && <AddFace />}
          {view === 'retrieve' && <RetrieveFace />}
          {view === 'all' && <AllFaces />}
          {!view && <div className="text-center text-gray-500">Select an option above to get started.</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 