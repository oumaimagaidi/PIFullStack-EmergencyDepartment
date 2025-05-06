// backend/routes/ai.js
import express from 'express';
// --- CORRECTION ICI ---
// Assurez-vous que cet import pointe vers le bon fichier et la bonne fonction
import { analyzeSymptomsSimple } from '../services/simpleSymptomHelper.js'; // <= Changer ceci !

const router = express.Router();

// POST /api/ai/analyze-symptoms
router.post('/analyze-symptoms', (req, res) => { // Pas besoin d'async
  const { symptomText } = req.body;

  if (!symptomText || typeof symptomText !== 'string' || symptomText.trim().length < 5) {
    console.log("[Simple Analysis] Texte trop court, retour vide.");
    return res.json({ keywords: [], suggestedQuestions: [] });
  }

  try {
    // --- CORRECTION ICI ---
    // Utiliser la fonction importée correctement
    const analysisResult = analyzeSymptomsSimple(symptomText); // <= Changer ceci !
    console.log("[Route AI Simple] Résultat envoyé:", analysisResult);
    res.json(analysisResult);
  } catch (error) {
    console.error("Erreur inattendue dans l'analyse simple:", error);
    res.status(500).json({ message: "Erreur interne lors de l'analyse des symptômes." });
  }
});

export default router;