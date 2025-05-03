// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Function to add a new notification
    const addNotification = useCallback((notificationData) => {
        // Add a unique ID and timestamp if not already present
        const newNotification = {
            id: Date.now() + Math.random(), // Simple unique ID
            receivedAt: new Date(),
            read: false, // Mark as unread initially
            ...notificationData
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep latest 50
        setUnreadCount(prev => prev + 1);
    }, []);

    // Function to mark all as read (clears the count)
    const markAllAsRead = useCallback(() => {
        setUnreadCount(0);
        // Optionally mark individual notifications as read if needed later
        // setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    // Function to clear all notifications
    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);


    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, clearAllNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};