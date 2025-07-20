import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const AuthPage = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '', password: '', email: '', fullName: '', dateOfBirth: '', emergencyContact: '', faceImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Face login state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  // Face register state
  const regVideoRef = useRef(null);
  const regCanvasRef = useRef(null);
  const [regStreaming, setRegStreaming] = useState(false);
  const [regCapturedImage, setRegCapturedImage] = useState(null);

  const handleLoginChange = e => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = e => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  // Login face scan
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

  // Register face scan
  const startRegCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      regVideoRef.current.srcObject = stream;
      setRegStreaming(true);
    }
  };
  const captureRegImage = () => {
    const video = regVideoRef.current;
    const canvas = regCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setRegCapturedImage(dataUrl);
    setRegisterData({ ...registerData, faceImage: dataUrl });
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      let res, data;
      if (capturedImage) {
        // Face login
        res = await fetch(`${API_BASE_URL}/api/auth/login-face`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ faceImage: capturedImage })
        });
      } else {
        // Username/password login
        res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });
      }
      data = await res.json();
      if (data.success) {
        onAuthSuccess(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if (data.success) {
        onAuthSuccess(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded shadow p-8 w-full max-w-md">
        <div className="flex mb-6">
          <button onClick={() => setTab('login')} className={`flex-1 py-2 font-semibold rounded-l ${tab === 'login' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-blue-700'}`}>Login</button>
          <button onClick={() => setTab('register')} className={`flex-1 py-2 font-semibold rounded-r ${tab === 'register' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-blue-700'}`}>Register</button>
        </div>
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input name="username" value={loginData.username} onChange={handleLoginChange} placeholder="Username" className="border p-2 rounded" disabled={!!capturedImage} />
            <input name="password" type="password" value={loginData.password} onChange={handleLoginChange} placeholder="Password" className="border p-2 rounded" disabled={!!capturedImage} />
            <div className="flex flex-col items-center">
              {!streaming && !capturedImage && (
                <button type="button" onClick={startCamera} className="mb-2 bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-800 transition">Use Face Login</button>
              )}
              <video ref={videoRef} autoPlay className={`mb-2 rounded ${streaming ? '' : 'hidden'}`} style={{ width: 220, height: 160 }} />
              <canvas ref={canvasRef} className="hidden" />
              {streaming && !capturedImage && (
                <button type="button" onClick={captureImage} className="mb-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition">Capture Face</button>
              )}
              {capturedImage && (
                <img src={capturedImage} alt="Captured" className="mb-2 w-32 h-32 object-cover rounded-full border-4 border-blue-200" />
              )}
              {capturedImage && (
                <button type="button" onClick={() => { setCapturedImage(null); setStreaming(false); if (videoRef.current && videoRef.current.srcObject) { videoRef.current.srcObject.getTracks().forEach(track => track.stop()); } }} className="mb-2 bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500 transition">Reset Face</button>
              )}
            </div>
            <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input name="username" value={registerData.username} onChange={handleRegisterChange} placeholder="Username" className="border p-2 rounded" required disabled={!!regCapturedImage} />
            <input name="password" type="password" value={registerData.password} onChange={handleRegisterChange} placeholder="Password" className="border p-2 rounded" required disabled={!!regCapturedImage} />
            <input name="email" value={registerData.email} onChange={handleRegisterChange} placeholder="Email" className="border p-2 rounded" disabled={!!regCapturedImage} />
            <input name="fullName" value={registerData.fullName} onChange={handleRegisterChange} placeholder="Full Name" className="border p-2 rounded" disabled={!!regCapturedImage} />
            <input name="dateOfBirth" type="date" value={registerData.dateOfBirth} onChange={handleRegisterChange} placeholder="Date of Birth" className="border p-2 rounded" disabled={!!regCapturedImage} />
            <input name="emergencyContact" value={registerData.emergencyContact} onChange={handleRegisterChange} placeholder="Emergency Contact" className="border p-2 rounded" disabled={!!regCapturedImage} />
            <div className="flex flex-col items-center">
              {!regStreaming && !regCapturedImage && (
                <button type="button" onClick={startRegCamera} className="mb-2 bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-800 transition">Scan Face</button>
              )}
              <video ref={regVideoRef} autoPlay className={`mb-2 rounded ${regStreaming ? '' : 'hidden'}`} style={{ width: 220, height: 160 }} />
              <canvas ref={regCanvasRef} className="hidden" />
              {regStreaming && !regCapturedImage && (
                <button type="button" onClick={captureRegImage} className="mb-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition">Capture Face</button>
              )}
              {regCapturedImage && (
                <img src={regCapturedImage} alt="Captured" className="mb-2 w-32 h-32 object-cover rounded-full border-4 border-blue-200" />
              )}
              {regCapturedImage && (
                <button type="button" onClick={() => { setRegCapturedImage(null); setRegStreaming(false); setRegisterData({ ...registerData, faceImage: '' }); if (regVideoRef.current && regVideoRef.current.srcObject) { regVideoRef.current.srcObject.getTracks().forEach(track => track.stop()); } }} className="mb-2 bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500 transition">Reset Face</button>
              )}
            </div>
            <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition" disabled={loading || !regCapturedImage}>{loading ? 'Registering...' : 'Register'}</button>
          </form>
        )}
        {error && <div className="mt-4 text-red-600 font-semibold text-center">{error}</div>}
      </div>
    </div>
  );
};

export default AuthPage; 