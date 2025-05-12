
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie'; // Pour récupérer le token si nécessaire, ou dépendre de withCredentials

const NotificationContext = createContext(null);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]); // Historique des notifications
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // Pour l'état de chargement

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get('token'); // Ou utiliser une autre méthode d'auth
            const response = await axios.get('http://localhost:8089/api/notifications', {
                withCredentials: true, // Important si vous utilisez les cookies pour l'auth
                // headers: { Authorization: `Bearer ${token}` } // Si vous utilisez un header Bearer
            });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error("Failed to fetch notifications history:", error);
            // Gérer l'erreur, peut-être avec un toast
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Charger les notifications initiales
    useEffect(() => {
        const token = Cookies.get('token'); // Ou session User
        if (token) { // Charger seulement si l'utilisateur est connecté
             fetchNotifications();
        }
    }, [fetchNotifications]);


    // Fonction pour ajouter une nouvelle notification (toast + mise à jour de la liste)
    // Cette fonction est appelée par le listener Socket.IO
    const addRealtimeNotification = useCallback((notificationData) => {
        // Pour le toast/sonner
        // (vous avez déjà cette logique, peut-être la garder séparée ou l'intégrer ici)

        // Pour l'historique (soit on ajoute directement, soit on re-fetch)
        // Option 1: Ajouter directement (plus réactif, mais peut désynchroniser si l'enregistrement DB échoue)
        // setNotifications(prev => [notificationData, ...prev.slice(0, 49)]);
        // setUnreadCount(prev => prev + 1);

        // Option 2: Re-fetch (plus sûr, mais léger délai)
        fetchNotifications(); // Recharge tout l'historique et le compteur

    }, [fetchNotifications]);

    const markOneAsRead = useCallback(async (notificationId) => {
        try {
            await axios.patch(`http://localhost:8089/api/notifications/${notificationId}/read`, {}, { withCredentials: true });
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1)); // Décrémenter le compteur
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }, []);

    const markAllAsReadContext = useCallback(async () => { // Renommé pour éviter conflit avec la prop
        try {
            await axios.patch('http://localhost:8089/api/notifications/read-all', {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
        }
    }, []);

    const clearAllNotificationsContext = useCallback(async () => {
         // Optionnel : si vous implémentez la suppression côté backend
        try {
            // Exemple: await axios.delete('http://localhost:8089/api/notifications/all', { withCredentials: true });
            setNotifications([]);
            setUnreadCount(0);
            console.warn("ClearAllNotifications est simulé côté client. Implémentez la suppression backend si nécessaire.")
        } catch (error) {
             console.error("Failed to clear all notifications:", error);
        }
    }, []);


    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isLoading,
            fetchNotifications, // Exposer pour re-fetch manuel si besoin
            addRealtimeNotification, // Renommer l'ancienne `addNotification` si elle faisait autre chose
            markOneAsRead,
            markAllAsRead: markAllAsReadContext,
            clearAllNotifications: clearAllNotificationsContext,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};