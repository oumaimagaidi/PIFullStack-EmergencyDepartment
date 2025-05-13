import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is included

// Component to set the map instance and fit bounds
const MapController = ({ ambulances, setMapInstance }) => {
  const map = useMap();

  useEffect(() => {
    setMapInstance(map);

    // Filter ambulances with valid coordinates
    const validAmbulances = ambulances.filter(
      (amb) => amb.latitude != null && amb.longitude != null
    );

    if (validAmbulances.length > 0) {
      // Calculate average coordinates for center
      const avgLat =
        validAmbulances.reduce((sum, amb) => sum + amb.latitude, 0) /
        validAmbulances.length;
      const avgLng =
        validAmbulances.reduce((sum, amb) => sum + amb.longitude, 0) /
        validAmbulances.length;

      // Set map center and fit bounds
      map.setView([avgLat, avgLng], 13);

      // Optionally, fit bounds to include all ambulances
      const bounds = validAmbulances.map((amb) => [amb.latitude, amb.longitude]);
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, ambulances, setMapInstance]);

  return null;
};

const ChooseAmbulance = () => {
  const { id : requestId } = useParams();
  console.log('Request ID:', requestId);
  const navigate = useNavigate();
  const [ambulances, setAmbulances] = useState([]);
  const [location, setLocation] = useState(null);
  const socketRef = useRef(null);
  const mapRef = useRef(null); // Store map instance

  useEffect(() => {
    // Initialize Socket.IO with credentials
    socketRef.current = io('http://localhost:8089', {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 ChooseAmbulance socket connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Fetch available ambulances
    const fetchAmbulances = async () => {
      try {
        const response = await axios.get('http://localhost:8089/api/ambulance', {
          params: { status: 'AVAILABLE' },
          withCredentials: true,
        });
        setAmbulances(response.data);
      } catch (error) {
        console.error('Error fetching ambulances:', error);
      }
    };
    fetchAmbulances();

    // Listen for ambulance location updates
    socketRef.current.on('locationUpdate', (data) => {
      setAmbulances((prev) =>
        prev.map((amb) =>
          amb._id === data.id
            ? { ...amb, latitude: data.latitude, longitude: data.longitude }
            : amb
        )
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Function to focus map on a specific ambulance
  const viewOnMap = (ambulance) => {
    if (mapRef.current && ambulance.latitude != null && ambulance.longitude != null) {
      mapRef.current.setView([ambulance.latitude, ambulance.longitude], 15);
    }
  };

  // Handle ambulance selection
  const handleSelectAmbulance = async (ambulanceId) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const patientLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(patientLocation);

        try {
          const response = await axios.patch(
            `http://localhost:8089/api/ambulance-requests/${requestId}/assign`,
            {
              ambulanceId,
              patientLocation,
            },
            { withCredentials: true }
          );
          
          socketRef.current.emit('updatePatientLocation', {
            requestId,
            ...patientLocation,
          });

            navigate(`/track-ambulance/${requestId}`);
        } catch (error) {
            
          console.error('Error assigning ambulance:', error);
          alert('Failed to assign ambulance');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Please enable location services to select an ambulance');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Choose an Ambulance</h1>
      {ambulances.length > 0 ? (
        <>
          <div className="mb-4">
            <ul className="space-y-2">
              {ambulances.map((ambulance) => (
                <li
                  key={ambulance._id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>Ambulance ID: {ambulance._id}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => viewOnMap(ambulance)}
                      className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600"
                      disabled={!ambulance.latitude || !ambulance.longitude}
                    >
                      View on Map
                    </button>
                    <button
                      onClick={() => handleSelectAmbulance(ambulance._id)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                    >
                      Select
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <MapContainer
            center={[51.505, -0.09]} // Fallback center
            zoom={13}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapController ambulances={ambulances} setMapInstance={(map) => (mapRef.current = map)} />
            {ambulances
              .filter((amb) => amb.latitude != null && amb.longitude != null)
              .map((ambulance) => (
                <Marker
                  key={ambulance._id}
                  position={[ambulance.latitude, ambulance.longitude]}
                >
                  <Popup>
                    Ambulance {ambulance._id}
                    <br />
                    <button
                      onClick={() => handleSelectAmbulance(ambulance._id)}
                      className="mt-2 bg-blue-500 text-white py-1 px-2 rounded"
                    >
                      Select
                    </button>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </>
      ) : (
        <p>No available ambulances found.</p>
      )}
    </div>
  );
};

export default ChooseAmbulance;