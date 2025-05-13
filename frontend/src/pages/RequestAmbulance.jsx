import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RequestAmbulance = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyType: 'URGENT',
    description: '',
  });
  const [requestId, setRequestId] = useState(null);
  const [status, setStatus] = useState('idle');
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Initialize Socket.IO and handle cleanup
  useEffect(() => {
    // Socket.IO setup
    socketRef.current = io('http://localhost:8089', { withCredentials: true });

    socketRef.current.on('connect', () => {
      console.log('🔌 Patient socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Listen for request status updates (optional, if backend emits them)
    socketRef.current.on(`request_${requestId}`, (data) => {
      if (data.type === 'STATUS_UPDATE') {
        setStatus(data.data.status.toLowerCase());
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await axios.post(
        'http://localhost:8089/api/ambulance-requests',
        {
          ...formData,
          patient: {
            ...formData,
            location: { latitude: null, longitude: null }, // Location added later
          },
        },
        { withCredentials: true } // Align with NurseDashboard
      );

      setRequestId(response.data._id);
      setStatus('success');

      // Redirect to ambulance selection page
      navigate(`/choose-ambulance/${response.data._id}`);
    } catch (error) {
      console.error('Error requesting ambulance:', error);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Request an Ambulance</h1>

      {status === 'success' ? (
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Request Received!</h2>
          <p>Please select an ambulance on the next page.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Emergency Type</label>
            <select
              name="emergencyType"
              value={formData.emergencyType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="CRITICAL">Critical</option>
              <option value="URGENT">Urgent</option>
              <option value="NON_URGENT">Non-Urgent</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
              rows="4"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {status === 'loading' ? 'Requesting...' : 'Request Ambulance'}
          </button>
        </form>
      )}
    </div>
  );
};

export default RequestAmbulance;