// backend/routes/chatbot.js
import express from 'express';
import { getSimpleChatbotResponse } from '../services/chatbotService.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/query', async (req, res) => { // C'est bien un POST et le chemin est '/query'
    const { patientId, queryText } = req.body;

    if (!patientId || !queryText) {
        return res.status(400).json({ message: 'patientId et queryText sont requis.' });
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'patientId invalide.' });
    }

    try {
        const responseText = await getSimpleChatbotResponse(patientId, queryText);
        res.json({ response: responseText });
    } catch (error) {
        console.error("[Chatbot Route] Erreur:", error);
        res.status(500).json({ message: "Erreur du serveur chatbot." });
    }
});

export default router;