// backend/services/aiService.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Charger les variables d'environnement

// Initialiser le client OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyse le texte des symptômes fourni par un patient à l'aide d'un LLM.
 * @param {string} symptomText - La description des symptômes fournie par le patient.
 * @returns {Promise<object>} Un objet contenant les mots-clés et les questions suggérées.
 *                          Ex: { keywords: ["douleur poitrine", "essoufflement"], suggestedQuestions: ["La douleur s'étend-elle au bras ?", ...] }
 * @throws {Error} Si l'analyse échoue.
 */
export const analyzeSymptoms = async (symptomText) => {
    if (!symptomText || typeof symptomText !== 'string' || symptomText.trim().length < 10) {
        // Ne pas appeler l'API si le texte est trop court ou invalide
        console.log("Texte de symptôme trop court ou invalide, analyse annulée.");
        return { keywords: [], suggestedQuestions: [] };
    }

    const systemPrompt = `
    You are a helpful medical assistant bot integrated into an emergency registration system.
    Your role is to analyze a patient's symptom description to extract key information and suggest clarifying questions.
    You MUST follow these instructions strictly:
    1.  Identify the main keywords or symptoms mentioned by the patient. List them concisely.
    2.  Suggest 2-3 relevant follow-up questions that a medical professional MIGHT ask to get more details about the symptoms described. These questions should be open-ended and aimed at clarification (e.g., "Where exactly is the pain located?", "When did the symptoms start?").
    3.  **CRITICAL: DO NOT provide any diagnosis, medical advice, assessment of severity, or treatment recommendations.** Do not use phrases like "you might have", "it sounds like", "you should".
    4.  **CRITICAL: Your output MUST be a valid JSON object ONLY, with the following structure:**
        {
          "keywords": ["symptom1", "symptom2", ...],
          "suggestedQuestions": ["question1?", "question2?", ...]
        }
    5.  If the input text is vague or doesn't seem like symptoms, return empty arrays for keywords and questions in the JSON structure.
    6.  Keep keywords and questions concise and clear.
  `;

    try {
        console.log(`[AI Service] Analyse des symptômes demandée pour: "${symptomText.substring(0, 50)}..."`);
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-0125", // Modèle économique et rapide, suffisant pour cette tâche. Vous pouvez tester gpt-4o si besoin.
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: symptomText }
            ],
            temperature: 0.3, // Faible température pour des réponses plus factuelles/prévisibles
            max_tokens: 150, // Limiter la longueur de la réponse
            response_format: { type: "json_object" } // Essayer de forcer le JSON (marche avec certains modèles)
        });

        const responseContent = completion.choices[0]?.message?.content;
        console.log("[AI Service] Réponse brute de l'API:", responseContent);

        if (!responseContent) {
            throw new Error("Réponse vide de l'API OpenAI.");
        }

        // Essayer de parser la réponse JSON
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseContent);
            // Valider la structure attendue
            if (!parsedResponse || !Array.isArray(parsedResponse.keywords) || !Array.isArray(parsedResponse.suggestedQuestions)) {
                console.error("[AI Service] Structure JSON invalide reçue:", parsedResponse);
                throw new Error("Format de réponse JSON invalide de l'API.");
            }
            console.log("[AI Service] Réponse analysée:", parsedResponse);
            return parsedResponse;
        } catch (parseError) {
            console.error("[AI Service] Erreur de parsing JSON:", parseError);
            console.error("[AI Service] Contenu reçu non-JSON:", responseContent);
            // Fallback: essayer d'extraire manuellement si c'est possible (peu fiable)
            // Ou simplement retourner un objet vide/erreur structurée
            return { keywords: [], suggestedQuestions: [], error: "Format de réponse invalide de l'IA." };
        }

    } catch (error) {
        console.error("[AI Service] Erreur lors de l'appel à l'API OpenAI:", error);
        // Remonter une erreur plus générique pour ne pas exposer de détails sensibles
        throw new Error("L'analyse des symptômes par l'IA a échoué.");
    }
};