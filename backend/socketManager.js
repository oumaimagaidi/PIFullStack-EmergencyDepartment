import { Server } from 'socket.io';
import Ambulance from './models/Ambulance.js';
import AmbulanceRequest from './models/AmbulanceRequest.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle patient location updates
    socket.on('updatePatientLocation', async (data) => {
      try {
        const { requestId, latitude, longitude } = data;
        const request = await AmbulanceRequest.findById(requestId);
        
        if (request) {
          request.patient.location = { latitude, longitude };
          await request.save();

          // Update ambulance destination
          const ambulance = await Ambulance.findById(request.ambulance);
          if (ambulance) {
            ambulance.destination = `${latitude},${longitude}`;
            await ambulance.save();
            
            // Notify ambulance about new location
            io.emit(`ambulance_${ambulance._id}`, {
              type: 'LOCATION_UPDATE',
              data: { latitude, longitude }
            });
          }
        }
      } catch (error) {
        console.error('Error updating patient location:', error);
      }
    });

    // Handle new ambulance requests
    socket.on('newAmbulanceRequest', async (data) => {
      try {
        const request = await AmbulanceRequest.create(data);
        
        // Find available ambulance
        const ambulance = await Ambulance.findOne({ status: 'AVAILABLE' });
        
        if (ambulance) {
          request.ambulance = ambulance._id;
          request.status = 'ACCEPTED';
          await request.save();

          ambulance.status = 'ON_MISSION';
          ambulance.destination = `${request.patient.location.latitude},${request.patient.location.longitude}`;
          await ambulance.save();

          // Notify relevant parties
          io.emit('ambulanceRequestUpdate', {
            type: 'NEW_REQUEST',
            data: request
          });

          io.emit(`ambulance_${ambulance._id}`, {
            type: 'NEW_MISSION',
            data: request
          });
        }
      } catch (error) {
        console.error('Error creating ambulance request:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
