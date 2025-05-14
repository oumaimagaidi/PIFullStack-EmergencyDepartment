// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; 

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('token');
            if (!token) { // Ne pas fetcher si pas de token
                setNotifications([]);
                setUnreadCount(0);
                return;
            }
            const response = await axios.get('http://localhost:8089/api/notifications', {
                withCredentials: true,
            });
            setNotifications(response.data.notifications || []); // Assurer un array
            setUnreadCount(response.data.unreadCount || 0);   // Assurer un nombre
        } catch (error) {
            console.error("Failed to fetch notifications history:", error);
            setNotifications([]); // Réinitialiser en cas d'erreur
            setUnreadCount(0);
        } finally {
            setIsLoading(false);
        }
    }, []); // Pas de dépendances, fetchNotifications est stable

    useEffect(() => {
        fetchNotifications(); // Fetch initial
    }, [fetchNotifications]); // Dépend de la fonction memoized


    const addRealtimeNotification = useCallback((notificationData) => {
        console.log('[NotificationContext] addRealtimeNotification received:', notificationData);
        // Le backend sauvegarde la notification, donc on re-fetch pour avoir la liste à jour
        // et le bon _id pour la notification (si on veut interagir avec elle plus tard)
        fetchNotifications();

        // Si vous voulez une mise à jour optimiste (plus rapide, mais peut être désynchronisée) :
        // setNotifications(prev => {
        //     // Assurez-vous que notificationData a une structure similaire à celles de la BDD, notamment un _id unique.
        //     // Si le backend n'envoie pas _id dans le payload socket, cette approche est moins fiable.
        //     const newNotification = { ...notificationData, _id: notificationData._id || new Date().toISOString() }; // Fallback pour _id
        //     const updatedNotifications = [newNotification, ...prev.filter(n => n._id !== newNotification._id)];
        //     return updatedNotifications.slice(0, 50);
        // });
        // if (!notificationData.isRead) { // Suppose que isRead est dans le payload socket
        //     setUnreadCount(prev => prev + 1);
        // }

    }, [fetchNotifications]); // Dépend de fetchNotifications

    const markOneAsRead = useCallback(async (notificationId) => {
        try {
            await axios.patch(`http://localhost:8089/api/notifications/${notificationId}/read`, {}, { withCredentials: true });
            // Optimistic update ou re-fetch
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }, []); // Pas de dépendances externes changeantes

    const markAllAsReadContext = useCallback(async () => {
        try {
            await axios.patch('http://localhost:8089/api/notifications/read-all', {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    }, []); // Pas de dépendances externes changeantes

    const clearAllNotificationsContext = useCallback(async () => {
        try {
            // Si vous implémentez la suppression backend :
            // await axios.delete('http://localhost:8089/api/notifications/all', { withCredentials: true });
            setNotifications([]);
            setUnreadCount(0);
            console.warn("ClearAllNotifications est simulé côté client. Implémentez la suppression backend si nécessaire.");
        } catch (error) {
             console.error("Failed to clear all notifications:", error);
        }
    }, []); // Pas de dépendances externes changeantes

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isLoading,
            fetchNotifications,
            addRealtimeNotification,
            markOneAsRead,
            markAllAsRead: markAllAsReadContext,
            clearAllNotifications: clearAllNotificationsContext,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};