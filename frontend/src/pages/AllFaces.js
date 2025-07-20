import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

const mockFaces = [
  {
    _id: '1',
    name: 'John Doe',
    relation: 'Son',
    address: '123 Main St',
    isClose: true,
    faceImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    mobile: '1234567890',
    additionalInfo: 'Likes cricket',
    importantNotes: 'Visits every Sunday',
  },
  {
    _id: '2',
    name: 'Jane Smith',
    relation: 'Daughter',
    address: '456 Elm St',
    isClose: false,
    faceImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    mobile: '9876543210',
    additionalInfo: 'Brings flowers',
    importantNotes: 'Allergic to peanuts',
  },
];

const AllFaces = () => {
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFaces = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/family/all`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await res.json();
        
        if (data.success) {
          setFaces(data.familyMembers);
        } else {
          setError(data.message || 'Failed to fetch family members');
        }
      } catch (error) {
        console.error('Error fetching family members:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFaces();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-xl text-blue-700">Loading family members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">All Saved Faces</h2>
      {faces.length === 0 ? (
        <div className="text-center text-gray-600 text-lg">No family members found. Add some faces to get started!</div>
      ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faces.map(face => (
            <div key={face._id} className="bg-white rounded shadow p-4 flex flex-col items-center">
              <img src={face.faceImage} alt={face.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200" />
              <div className="text-lg font-semibold text-blue-800 mb-1">{face.name}</div>
              <div className="text-gray-600 mb-1">Relation: {face.relation}</div>
              <div className="text-gray-600 mb-1">Address: {face.address}</div>
              <div className="text-gray-600 mb-1">Mobile: {face.mobile}</div>
              <div className="text-gray-600 mb-1">{face.isClose ? 'Close One' : 'Not Close'}</div>
              {face.additionalInfo && <div className="text-gray-500 text-sm mt-2">Info: {face.additionalInfo}</div>}
              {face.importantNotes && <div className="text-red-500 text-sm mt-1">Notes: {face.importantNotes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllFaces; 