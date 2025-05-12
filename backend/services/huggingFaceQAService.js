// backend/services/huggingFaceQAService.js
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

const HF_TOKEN = process.env.HF_ACCESS_TOKEN; // Assurez-vous que c'est le bon nom de variable d'env
if (!HF_TOKEN) {
    console.warn("HF_ACCESS_TOKEN n'est pas défini dans .env. Les appels à Hugging Face échoueront.");
}
const hf = new HfInference(HF_TOKEN);

// Choisissez un modèle QA. 'deepset/roberta-base-squad2' est un bon point de départ.
// Vous pouvez aussi utiliser 'distilbert-base-cased-distilled-squad' pour plus de légèreté.
const QA_MODEL = process.env.HF_QA_MODEL || 'deepset/roberta-base-squad2';

export const getAnswerFromContext = async (context, question) => {
    if (!HF_TOKEN) {
        throw new Error("Configuration Hugging Face Token manquante.");
    }
    if (!context || !question) {
        throw new Error("Le contexte et la question sont requis pour le modèle QA.");
    }

    console.log(`[HF QA Service] Question: "${question}"`);
    // console.log(`[HF QA Service] Context (premiers 300 chars): "${context.substring(0, 300)}..."`);

    try {
        const result = await hf.questionAnswering({
            model: QA_MODEL,
            inputs: {
                question: question,
                context: context,
            },
        });
        console.log("[HF QA Service] Réponse du modèle:", result);
        return { answer: result.answer, score: result.score };
    } catch (error) {
        console.error("[HF QA Service] Erreur lors de l'appel à Hugging Face:", error);
        // Gérer différents types d'erreurs de l'API HF si nécessaire
        if (error.response && error.response.data) {
            console.error("Détails de l'erreur HF:", error.response.data);
        }
        throw new Error(`Échec de la réponse du modèle QA: ${error.message}`);
    }
};