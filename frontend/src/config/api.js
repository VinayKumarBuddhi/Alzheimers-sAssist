// API Base URL Configuration
const API_BASE_URL = process.env.NODE_ENV=='development'?'http://localhost:5000':'';

export default API_BASE_URL; 