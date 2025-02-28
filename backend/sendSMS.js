import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMS = async (body, userPhoneNumber) => {
    try {
        // Parse le numéro
        const phoneNumber = parsePhoneNumberFromString(userPhoneNumber, 'TN'); // 'TN' pour Tunisie.  Change si nécessaire.

        // Vérifie si le numéro est valide
        if (!phoneNumber || !isValidPhoneNumber(phoneNumber.number, phoneNumber.country)) {
            console.error("Numéro de téléphone invalide :", userPhoneNumber);
            return { success: false, message: 'Numéro de téléphone invalide.' };
        }

        // Formate le numéro en E.164 (le format requis par Twilio)
        const formattedPhoneNumber = phoneNumber.format('E.164');

        const msgOptions = {
            from: process.env.TWILIO_FROM_NUMBER,
            to: formattedPhoneNumber,
            body: body
        };

        const message = await client.messages.create(msgOptions);
        console.log("✅ SMS envoyé avec succès :", message.sid);
        return { success: true, message: 'Message sent successfully' };

    } catch (error) {
        console.error("❌ Erreur d'envoi SMS ou de validation du numéro:", error);

        // Gérer les erreurs spécifiques à libphonenumber et Twilio séparément
        if (error.message === "INVALID_COUNTRY") { // Exemple d'erreur libphonenumber-js
            return { success: false, message: 'Code pays invalide pour le numéro de téléphone.' };
        }

        if (error.code === 21211) {
            return { success: false, message: 'Numéro de téléphone invalide pour Twilio.' };
        }
        //Ajoute d'autre  gestion d'erreur si nécessaire
        return { success: false, message: 'Échec de l\'envoi du SMS', error: error.message };
    }
};

export default sendSMS;