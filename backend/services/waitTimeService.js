// backend/services/waitTimeService.js
import EmergencyPatient from '../models/EmergencyPatient.js';
// Correction: Utiliser l'import nommé avec les accolades
import { User } from '../models/User.js'; // Assurez-vous que le chemin est correct

// --- Logique Heuristique Simple ---
// Ces valeurs sont des exemples, à ajuster selon la réalité de l'hôpital
const BASE_WAIT_TIME_MINUTES = {
    critical: 5, // Temps incompressible pour préparer
    high: 15,
    medium: 30,
    low: 60,
    default: 45 // Si niveau non défini ou invalide
};

const PEAK_HOURS_START = 8; // 8h du matin
const PEAK_HOURS_END = 18; // 18h (6 PM)
const PEAK_HOUR_FACTOR = 1.5; // Augmente le temps de 50% pendant les heures de pointe
const WEEKEND_FACTOR = 1.2; // Augmente le temps de 20% le week-end (Samedi/Dimanche)
const PATIENT_LOAD_FACTOR_PER_PATIENT = 5; // Ajoute 5 minutes par autre patient en attente récente
const DOCTOR_AVAILABILITY_FACTOR = 0.8; // Réduit le temps de 20% si plus de 2 médecins sont disponibles
const MIN_WAIT_TIME = 5; // Temps d'attente minimum absolu (en minutes)
const MAX_WAIT_TIME = 180; // Temps d'attente maximum pour éviter les estimations excessives (en minutes)

/**
 * Estime le temps d'attente pour un patient donné basé sur des heuristiques simples.
 * @param {string} patientId - L'ID du patient d'urgence.
 * @returns {Promise<string>} Une estimation textuelle du temps d'attente (ex: "environ 20-30 minutes").
 * @throws {Error} Si le patient n'est pas trouvé ou en cas d'erreur.
 */
export const getEstimatedWaitTime = async (patientId) => {
    console.log(`[WaitTime] Début estimation pour patient ID: ${patientId}`);
    try {
        const patient = await EmergencyPatient.findById(patientId);
        if (!patient) {
            console.error(`[WaitTime] Patient non trouvé: ${patientId}`);
            throw new Error("Patient non trouvé.");
        }

        // 1. Temps de base selon le niveau d'urgence
        // Utiliser 'toLowerCase()' pour la robustesse et gérer le cas où le niveau est null/undefined
        const emergencyLevel = patient.emergencyLevel?.toLowerCase() || 'default';
        let estimatedTime = BASE_WAIT_TIME_MINUTES[emergencyLevel] || BASE_WAIT_TIME_MINUTES.default;
        console.log(`[WaitTime] Base time for level "${emergencyLevel}": ${estimatedTime.toFixed(0)} min`);

        // 2. Ajustement selon l'heure et le jour
        const submissionTime = new Date(patient.createdAt || Date.now()); // Utiliser createdAt, fallback sur maintenant
        const hour = submissionTime.getHours();
        const day = submissionTime.getDay(); // 0 = Dimanche, 6 = Samedi

        if (hour >= PEAK_HOURS_START && hour < PEAK_HOURS_END) {
            estimatedTime *= PEAK_HOUR_FACTOR;
            console.log(`[WaitTime] Peak hour adjustment applied: ${estimatedTime.toFixed(0)} min`);
        }
        if (day === 0 || day === 6) {
            estimatedTime *= WEEKEND_FACTOR;
            console.log(`[WaitTime] Weekend adjustment applied: ${estimatedTime.toFixed(0)} min`);
        }

        // 3. Ajustement selon la charge (patients en attente)
        // Compter les patients enregistrés récemment et non traités/annulés
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        let waitingPatientsCount = 0;
        try {
             waitingPatientsCount = await EmergencyPatient.countDocuments({
                createdAt: { $gte: oneHourAgo },
                 // Statuts considérés comme "en attente" ou "en cours"
                status: { $in: ['Demande Enregistrée', 'En Cours d\'Examen', 'Médecin Assigné', 'Médecin En Route'] },
                _id: { $ne: patientId } // Exclure le patient actuel du compte
            });
            estimatedTime += waitingPatientsCount * PATIENT_LOAD_FACTOR_PER_PATIENT;
            console.log(`[WaitTime] Load adjustment (+${waitingPatientsCount} waiting patients): ${estimatedTime.toFixed(0)} min`);
        } catch (countError) {
             console.error("[WaitTime] Erreur lors du comptage des patients en attente:", countError);
             // Continuer sans cet ajustement si le comptage échoue
        }


        // 4. Ajustement (simplifié) selon les médecins disponibles
        try {
             const availableDoctorsCount = await User.countDocuments({
                 role: 'Doctor',
                 isAvailable: true, // Le champ clé
                 isValidated: true // S'assurer qu'ils sont actifs/validés
             });
             console.log(`[WaitTime] Médecins disponibles: ${availableDoctorsCount}`);
             // Ajustement simple: si peu de médecins dispo, le temps peut augmenter légèrement
             // Si beaucoup de médecins dispo, le temps peut diminuer légèrement
             if (availableDoctorsCount <= 1 && waitingPatientsCount > 0) { // Si peu de médecins et charge
                 estimatedTime *= 1.15; // Augmentation modeste
                 console.log(`[WaitTime] Low doctor availability adjustment applied: ${estimatedTime.toFixed(0)} min`);
             } else if (availableDoctorsCount > 3) { // Si > 3 médecins dispo
                estimatedTime *= DOCTOR_AVAILABILITY_FACTOR; // Réduction
                console.log(`[WaitTime] High doctor availability adjustment applied: ${estimatedTime.toFixed(0)} min`);
             }
        } catch (userError) {
            console.error("[WaitTime] Erreur lors de la récupération des médecins dispos:", userError);
            // Ne pas planter si la récupération des users échoue, continuer sans cet ajustement
        }


        // 5. Assurer un temps minimum, appliquer un plafond maximum et arrondir
        estimatedTime = Math.max(MIN_WAIT_TIME, estimatedTime); // Appliquer minimum
        estimatedTime = Math.min(MAX_WAIT_TIME, estimatedTime); // Appliquer maximum
        estimatedTime = Math.round(estimatedTime / 5) * 5; // Arrondir aux 5 minutes les plus proches

        console.log(`[WaitTime] Final estimated (rounded, capped) for ${patientId}: ${estimatedTime} min`);

        // 6. Retourner une fourchette textuelle pour gérer l'incertitude
        // Créer une fourchette simple autour du temps estimé
        const lowerBound = Math.max(MIN_WAIT_TIME, estimatedTime - 5);
        const upperBound = Math.min(MAX_WAIT_TIME, estimatedTime + 10); // Plafonner aussi la borne sup

        // Gérer le cas où la borne inf > sup après plafonnement
        if (lowerBound >= upperBound) {
            return `environ ${upperBound} minutes`;
        }

        return `environ ${lowerBound}-${upperBound} minutes`;

    } catch (error) {
        // Log l'erreur complète côté serveur pour le débogage
        console.error(`[WaitTime] Erreur finale dans getEstimatedWaitTime pour ${patientId}:`, error);
        // Retourner un message générique au client
        return "Estimation indisponible";
    }
};