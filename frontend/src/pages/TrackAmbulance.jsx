import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// Hook to fit map to marker positions
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

export default function TrackAmbulance() {
  const { id: requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [ambPos, setAmbPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [etaMin, setEtaMin] = useState(null);
  const socketRef = useRef();

  // Helper: fetch driving route and ETA
  const computeRoute = async (origin, dest) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.routes?.length) {
        const coords = json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRouteCoords(coords);
        setEtaMin(Math.round(json.routes[0].duration / 60));
      }
    } catch (err) {
      console.error('Route fetch error:', err);
    }
  };

  // 1) Load request and initial positions
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`http://localhost:8089/api/ambulance-requests/${requestId}`, { withCredentials: true });
        setRequest(data);
        const patientLoc = data.patient?.location;
        const amb = data.ambulance;
        if (amb?.latitude != null && amb?.longitude != null) {
          const origin = { lat: amb.latitude, lng: amb.longitude };
          setAmbPos(origin);
          if (patientLoc?.latitude != null && patientLoc?.longitude != null) {
            await computeRoute(origin, { lat: patientLoc.latitude, lng: patientLoc.longitude });
          }
        }
      } catch (error) {
        console.error('Failed to load request:', error);
      }
    })();
  }, [requestId]);

  // 2) Subscribe to real-time ambulance location
  useEffect(() => {
    if (!request?.ambulance?._id) return;
    const socket = io('http://localhost:8089', { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => console.log('Socket connected'));

    const channel = `ambulance_${request.ambulance._id}`;
    socket.on(channel, ({ type, data }) => {
      if (type === 'LOCATION_UPDATE') {
        const newPos = { lat: data.latitude, lng: data.longitude };
        console.log('New ambulance position:', newPos);
        setAmbPos(newPos);
        const patientLoc = request.patient.location;
        if (patientLoc) {
          computeRoute(newPos, { lat: patientLoc.latitude, lng: patientLoc.longitude });
        }
      }
    });

    return () => {
      socket.off(channel);
      socket.disconnect();
    };
  }, [request]);

  if (!request) {
    return <div className="p-6">Loading request...</div>;
  }
  const patientLoc = request.patient?.location;
  if (!patientLoc) {
    return <div className="p-6">Patient location unavailable</div>;
  }

  const patientPos = [patientLoc.latitude, patientLoc.longitude];
  const center = ambPos ? [ambPos.lat, ambPos.lng] : patientPos;
  const bounds = ambPos ? [patientPos, [ambPos.lat, ambPos.lng]] : [patientPos];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Track Your Ambulance</h1>
      <p>Status: <span className="font-semibold">{request.status}</span></p>

      <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-md">
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Patient marker */}
          <Marker position={patientPos}><Popup>Your Location</Popup></Marker>

          {/* Ambulance marker */}
          {ambPos && <Marker position={[ambPos.lat, ambPos.lng]}><Popup>Ambulance</Popup></Marker>}

          {/* Route line */}
          {routeCoords.length > 0 && <Polyline positions={routeCoords} />}

          {/* Fit map bounds */}
          {bounds.length > 1 && <FitBounds positions={bounds} />}
        </MapContainer>
      </div>

      {etaMin != null && (
        <p className="text-lg">ETA: <span className="font-semibold">{etaMin} minutes</span></p>
      )}
    </div>
  );
}