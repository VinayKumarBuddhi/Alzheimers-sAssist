import React, { useRef, useState } from 'react';
import API_BASE_URL from '../config/api';

const AddFace = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    relation: '',
    isClose: false,
    mobile: '',
    additionalInfo: '',
    importantNotes: '',
    faceImage: null,
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

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
    setForm({ ...form, faceImage: dataUrl });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/family/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setForm({
          name: '', address: '', relation: '', isClose: false, mobile: '', additionalInfo: '', importantNotes: '', faceImage: null
        });
        setCapturedImage(null);
        setStreaming(false);
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
      } else {
        alert(data.message || 'Failed to add family member');
      }
    } catch (error) {
      console.error('Error adding family member:', error);
      alert('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Add New Face</h2>
      {success && <div className="mb-4 text-green-600 font-semibold">Face added successfully!</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
        <input name="relation" value={form.relation} onChange={handleChange} placeholder="Relation" className="border p-2 rounded" required />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" required />
        <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" className="border p-2 rounded" required />
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isClose" checked={form.isClose} onChange={handleChange} id="isClose" />
          <label htmlFor="isClose" className="text-gray-700">Close One</label>
        </div>
        <input name="additionalInfo" value={form.additionalInfo} onChange={handleChange} placeholder="Additional Info" className="border p-2 rounded" />
        <input name="importantNotes" value={form.importantNotes} onChange={handleChange} placeholder="Important Notes" className="border p-2 rounded" />
        {/* Camera section */}
        <div className="flex flex-col items-center">
          {!streaming && !capturedImage && (
            <button type="button" onClick={startCamera} className="mb-4 bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition">Start Camera</button>
          )}
          <video ref={videoRef} autoPlay className={`mb-4 rounded ${streaming ? '' : 'hidden'}`} style={{ width: 320, height: 240 }} />
          <canvas ref={canvasRef} className="hidden" />
          {streaming && !capturedImage && (
            <button type="button" onClick={captureImage} className="mb-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">Capture Photo</button>
          )}
          {capturedImage && (
            <img src={capturedImage} alt="Captured" className="mb-4 w-48 h-48 object-cover rounded-full border-4 border-blue-200" />
          )}
        </div>
        <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition" disabled={loading || !capturedImage}>{loading ? 'Saving...' : 'Save Face'}</button>
      </form>
    </div>
  );
};

export default AddFace; 