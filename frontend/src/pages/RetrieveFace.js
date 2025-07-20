import React, { useRef, useState } from 'react';
import API_BASE_URL from '../config/api';

const mockResult = {
  found: true,
  faceImage: 'https://randomuser.me/api/portraits/men/1.jpg',
  name: 'John Doe',
  relation: 'Son',
  address: '123 Main St',
  isClose: true,
  mobile: '1234567890',
  additionalInfo: 'Likes cricket',
  importantNotes: 'Visits every Sunday',
};

const RetrieveFace = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStreaming(true);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/family/retrieve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ faceImage: capturedImage })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResult({
          found: true,
          ...data.familyMember
        });
      } else {
        setResult({
          found: false,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Error retrieving face:', error);
      setResult({
        found: false,
        message: 'Network error. Please try again.'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Retrieve Face Details</h2>
      <div className="bg-white p-6 rounded shadow flex flex-col items-center w-full max-w-md">
        {!streaming && (
          <button onClick={startCamera} className="mb-4 bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition">Start Camera</button>
        )}
        <video ref={videoRef} autoPlay className={`mb-4 rounded ${streaming ? '' : 'hidden'}`} style={{ width: 320, height: 240 }} />
        <canvas ref={canvasRef} className="hidden" />
        {streaming && !capturedImage && (
          <button onClick={captureImage} className="mb-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">Capture Photo</button>
        )}
        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="mb-4 w-48 h-48 object-cover rounded-full border-4 border-blue-200" />
        )}
        {capturedImage && (
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition" disabled={loading}>
              {loading ? 'Scanning...' : 'Scan Face'}
            </button>
          </form>
        )}
      </div>
      {result && (
        <div className="mt-8 bg-white p-6 rounded shadow w-full max-w-md flex flex-col items-center">
          {result.found ? (
            <>
              <img src={result.faceImage} alt={result.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200" />
              <div className="text-lg font-semibold text-blue-800 mb-1">{result.name}</div>
              <div className="text-gray-600 mb-1">Relation: {result.relation}</div>
              <div className="text-gray-600 mb-1">Address: {result.address}</div>
              <div className="text-gray-600 mb-1">Mobile: {result.mobile}</div>
              <div className="text-gray-600 mb-1">{result.isClose ? 'Close One' : 'Not Close'}</div>
              {result.additionalInfo && <div className="text-gray-500 text-sm mt-2">Info: {result.additionalInfo}</div>}
              {result.importantNotes && <div className="text-red-500 text-sm mt-1">Notes: {result.importantNotes}</div>}
            </>
          ) : (
            <div className="text-red-600 font-semibold">No matching face found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RetrieveFace; 