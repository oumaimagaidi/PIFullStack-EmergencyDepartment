// routes/notifications.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/notifications - Récupérer les notifications pour l'utilisateur connecté
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user.id })
            .sort({ createdAt: -1 }) // Les plus récentes en premier
            .limit(50); // Limiter à 50 pour la performance
        const unreadCount = await Notification.countDocuments({ recipientId: req.user.id, isRead: false });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des notifications." });
    }
});

// PATCH /api/notifications/:id/read - Marquer une notification comme lue
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user.id }, // S'assurer que la notif appartient à l'utilisateur
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification non trouvée ou accès non autorisé." });
        }
        res.json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// PATCH /api/notifications/read-all - Marquer toutes les notifications comme lues
router.patch('/read-all', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: "Toutes les notifications ont été marquées comme lues." });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// DELETE /api/notifications/:id - Supprimer une notification (optionnel)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await Notification.findOneAndDelete({ _id: req.params.id, recipientId: req.user.id });
        if (!result) {
            return res.status(404).json({ message: "Notification non trouvée ou accès non autorisé." });
        }
        res.json({ message: "Notification supprimée." });
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

export default router;