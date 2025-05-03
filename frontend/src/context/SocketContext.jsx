// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Cookies from 'js-cookie';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null); // Use ref to prevent re-renders causing disconnect/reconnect

    useEffect(() => {
        const token = Cookies.get('token'); // Get token from cookies

        // Only connect if token exists (user is logged in) and socket isn't already set up
        if (token && !socketRef.current) {
            console.log("Attempting to connect socket...");
            // Pass token in auth for middleware verification
            const newSocket = io('http://localhost:8089', { // Your backend URL
                withCredentials: true, // Important for cookies if needed by backend's CORS
                auth: { token } // Send token for authentication
            });

            socketRef.current = newSocket; // Store in ref
            setSocket(newSocket); // Store in state for context consumers

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);
                // Optional: Emit an 'authenticate' event if needed after connection
                // newSocket.emit('authenticate', token);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
                // Handle potential cleanup or reconnection logic here if needed
                socketRef.current = null; // Clear ref on disconnect
                setSocket(null);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message, err.data);
                setIsConnected(false);
                socketRef.current = null; // Clear ref on error
                setSocket(null);
            });

            // Clean up on component unmount
            return () => {
                console.log("Disconnecting socket...");
                newSocket.disconnect();
                socketRef.current = null;
                setSocket(null);
            };
        } else if (!token && socketRef.current) {
            // If token removed (logout), disconnect
            console.log("No token found, disconnecting socket...");
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }

    }, []); // Run only once on mount

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};