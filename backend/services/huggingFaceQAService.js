// backend/services/huggingFaceQAService.js

import { InferenceClient } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config();

// 1. On lit le token AVANT toute utilisation
const HF_TOKEN = process.env.HF_ACCESS_TOKEN;
if (!HF_TOKEN) {
  console.warn("⚠️ HF_ACCESS_TOKEN n’est pas défini dans .env");
}

// 2. Instanciation correcte du client avec la string du token
const hf = new InferenceClient(HF_TOKEN);

// 3. Choix du modèle QA (public ou privé)
const QA_MODEL = process.env.HF_QA_MODEL || 'deepset/roberta-base-squad2';

export const getAnswerFromContext = async (question, context) => {
  // 4. Vérifications
  if (!HF_TOKEN) {
    throw new Error("Token Hugging Face manquant.");
  }
  if (!question || !context) {
    throw new Error("Question et contexte sont requis.");
  }

  // 5. Convertir en string si besoin
  const q = String(question);
  const c = String(context);
  console.log(`[HF QA] Question: "${q}"`);

  try {
    // 6. Appel au pipeline QA
    const raw = await hf.questionAnswering({
      model: QA_MODEL,
      inputs: { question: q, context: c },
    });

    // 7. Normalisation de la sortie
    const { answer, score } = Array.isArray(raw) ? raw[0] : raw;
    console.log("[HF QA] Réponse:", answer, "(score:", score, ")");
    return { answer, score };

  } catch (err) {
    const errMsg = err.response?.data?.error || err.message;
    console.error("[HF QA] Erreur :", errMsg);
    throw new Error(`QA pipeline failed: ${errMsg}`);
  }
};
