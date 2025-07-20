import React from 'react';

const LandingPage = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Welcome to Alzheimer's Assist</h1>
      <p className="mb-6 text-lg text-gray-700">
        Alzheimer's Assist is a project designed to help Alzheimer's patients recognize and remember their loved ones. Patients can take pictures of their relatives, and when those relatives visit again, the patient can scan their face. The system will then display the relative's details, helping the patient recall important information and maintain connections.
      </p>
      <ul className="list-disc pl-6 text-gray-600 mb-4">
        <li>Take and save pictures of relatives with details</li>
        <li>Scan a face to retrieve and display their information</li>
        <li>Easy-to-use dashboard for managing faces and details</li>
      </ul>
      <p className="text-gray-500">Empowering memory, one face at a time.</p>
    </div>
  </div>
);

export default LandingPage; 