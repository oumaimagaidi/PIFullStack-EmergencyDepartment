// backend/services/chatbotService.js
import EmergencyPatient from '../models/EmergencyPatient.js';
import { getEstimatedWaitTime } from './waitTimeService.js'; // Assurez-vous que le chemin est correct

/**
 * Génère une réponse simple basée sur des mots-clés dans la requête de l'utilisateur.
 * @param {string} patientId - L'ID du patient.
 * @param {string} queryText - La question de l'utilisateur.
 * @returns {Promise<string>} La réponse du chatbot.
 */
export const getSimpleChatbotResponse = async (patientId, queryText) => {
    if (!patientId || !queryText) {
        console.warn("[ChatbotService] Patient ID ou QueryText manquant.");
        return "Désolé, je n'ai pas toutes les informations nécessaires pour répondre.";
    }

    const lowerQuery = queryText.toLowerCase().trim();
    // Réponse par défaut si aucune intention n'est comprise
    let responseMessage = "Je suis un assistant virtuel. Je peux vous donner des informations sur votre statut actuel, le temps d'attente estimé, ou le médecin qui vous a été assigné. Pour toute autre préoccupation, veuillez patienter qu'un membre de notre équipe vous contacte.";

    console.log(`[ChatbotService] Traitement de la requête: "${lowerQuery}" pour patient ID: ${patientId}`);

    try {
        // Récupérer les infos patient nécessaires. Populate pour avoir nom et spé du médecin si assigné.
        const patient = await EmergencyPatient.findById(patientId)
            .populate('assignedDoctor', 'username specialization'); // 'username' et 'specialization' sont des exemples

        if (!patient) {
            console.warn(`[ChatbotService] Patient non trouvé pour ID: ${patientId}`);
            return "Désolé, je n'arrive pas à trouver votre dossier d'urgence dans notre système.";
        }

        // --- Analyse simple par mots-clés ---

        // 1. Intention : Demande de Statut
        if (lowerQuery.includes('statut') || lowerQuery.includes('status') || lowerQuery.includes('état') || lowerQuery.includes("où en est")) {
            responseMessage = `Votre statut actuel est : "${patient.status}". `;
            // Ajouter une brève explication du statut si possible
            switch (patient.status) {
                case 'Demande Enregistrée':
                    responseMessage += "Notre équipe examine votre demande.";
                    break;
                case 'En Cours d\'Examen':
                    responseMessage += "Un professionnel de santé évalue actuellement votre situation.";
                    break;
                case 'Médecin Assigné':
                    responseMessage += "Un médecin a été assigné et sera informé.";
                    break;
                case 'Médecin En Route':
                    responseMessage += "Le médecin est en chemin. Veuillez rester disponible.";
                    break;
                case 'Traité':
                    responseMessage += "Votre prise en charge est terminée.";
                    break;
                case 'Annulé':
                    responseMessage += "Votre demande a été annulée.";
                    break;
                default:
                    responseMessage += "Nous traitons votre demande.";
            }
            console.log(`[ChatbotService] Intention détectée: Statut. Réponse: ${responseMessage}`);

        // 2. Intention : Demande de Temps d'Attente
        } else if (lowerQuery.includes('temps') || lowerQuery.includes('attente') || lowerQuery.includes('combien de temps') || lowerQuery.includes('quand serai-je')) {
            const waitTime = await getEstimatedWaitTime(patientId); // Appel au service de temps d'attente
            responseMessage = `Le temps d'attente actuel est estimé à ${waitTime}. Veuillez noter qu'il s'agit d'une estimation et qu'elle peut varier.`;
            console.log(`[ChatbotService] Intention détectée: Temps d'attente. Réponse: ${responseMessage}`);

        // 3. Intention : Demande d'Informations sur le Médecin
        } else if (lowerQuery.includes('médecin') || lowerQuery.includes('docteur') || (lowerQuery.includes('qui') && lowerQuery.includes('assigné'))) {
            if (patient.assignedDoctor && patient.assignedDoctor.username) {
                let doctorDetails = `Le Dr. ${patient.assignedDoctor.username}`;
                if (patient.assignedDoctor.specialization) {
                    doctorDetails += `, spécialiste en ${patient.assignedDoctor.specialization},`;
                }
                doctorDetails += " vous a été assigné.";
                responseMessage = doctorDetails;
            } else {
                responseMessage = "Un médecin n'a pas encore été formellement assigné à votre cas, mais notre équipe examine votre demande.";
            }
            console.log(`[ChatbotService] Intention détectée: Info Médecin. Réponse: ${responseMessage}`);

        // 4. Intention : Salutations
        } else if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello') || lowerQuery.includes('yo')) {
             responseMessage = `Bonjour ! Comment puis-je vous aider concernant votre statut actuel, le temps d'attente estimé, ou le médecin qui vous a été assigné ?`;
             console.log(`[ChatbotService] Intention détectée: Salutation. Réponse: ${responseMessage}`);
        }
        // Ajoutez d'autres 'else if' pour plus de mots-clés/intentions ici...
        // Exemple:
        // else if (lowerQuery.includes('conseil') || lowerQuery.includes('faire')) {
        //    responseMessage = "Je ne peux pas donner de conseils médicaux. Si votre état s'aggrave, veuillez le signaler. En attendant, essayez de rester calme.";
        // }

    } catch (error) {
        console.error(`[ChatbotService] Erreur lors du traitement de la requête pour patient ${patientId} / query "${queryText}":`, error);
        responseMessage = "Désolé, une erreur technique s'est produite lors de la récupération des informations. Veuillez réessayer plus tard.";
    }

    return responseMessage;
};