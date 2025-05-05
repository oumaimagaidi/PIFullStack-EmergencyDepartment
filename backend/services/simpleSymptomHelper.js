// backend/services/simpleSymptomHelper.js

// --- Définition des Mappings ---
// On définit d'abord les questions communes pour éviter la répétition
const commonQuestions = {
    respiratory: [
        'Est-ce apparu soudainement ou progressivement ?',
        'Avez-vous de la toux ou une douleur en respirant ?',
        'Est-ce pire en position allongée ?'
    ],
    chestPain: [
        'La douleur s\'étend-elle à d\'autres parties (bras, dos, mâchoire) ?',
        'Quand la douleur a-t-elle commencé exactement ?',
        'Avez-vous des difficultés à respirer, des sueurs ou des nausées ?'
    ],
    headache: [
        'Où se situe la douleur dans la tête ?',
        'Avez-vous des nausées, vomissements ou sensibilité à la lumière ?',
        'Avez-vous eu un choc à la tête récemment ?'
    ],
    abdominalPain: [
        'Où se situe précisément la douleur dans l\'abdomen ?',
        'Avez-vous de la fièvre, des nausées ou des diarrhées ?',
        'Depuis quand avez-vous mal ?'
    ],
    fever: [
        'Avez-vous pris votre température ? Si oui, combien ?',
        'Avez-vous d\'autres symptômes (toux, courbatures) ?',
        'Depuis combien de temps avez-vous de la fièvre ?'
    ],
    fall: [
        'Avez-vous perdu connaissance, même brièvement ?',
        'Vous êtes-vous cogné la tête ou une autre partie du corps ?',
        'Avez-vous des douleurs ou difficultés à bouger ?'
    ],
    allergy: [
        'À quoi pensez-vous être allergique ?',
        'Avez-vous des difficultés à respirer ou un gonflement (visage, gorge) ?',
        'Avez-vous une éruption cutanée ? Où ?'
    ],
    nausea: [
            'Avez-vous vomi ? Si oui, combien de fois et à quoi ressemblaient les vomissements ?',
            'Avez-vous d\'autres symptômes (douleur ventre, diarrhée, fièvre) ?',
            'Depuis quand avez-vous des nausées ?'
    ]
    // Ajouter d'autres groupes de questions communes si nécessaire
};

const symptomMappings = {
    // Douleurs
    'poitrine': {
        keywords: ['douleur poitrine', 'pression thoracique', 'serrement poitrine'],
        questions: commonQuestions.chestPain
    },
    'cœur': { // Nouveau: lié à poitrine
        keywords: ['douleur cardiaque', 'palpitations', 'problème cœur', 'douleur poitrine'],
        questions: commonQuestions.chestPain // Réutiliser ou adapter les questions
    },
    'tête': {
        keywords: ['mal de tête', 'céphalée', 'migraine'],
        questions: commonQuestions.headache
    },
    'ventre': {
        keywords: ['douleur abdominale', 'mal de ventre', 'crampes estomac'],
        questions: commonQuestions.abdominalPain
    },
    'estomac': { // Variante de ventre
        keywords: ['douleur estomac', 'brûlure estomac'],
        questions: commonQuestions.abdominalPain
    },
    'dos': {
        keywords: ['mal de dos', 'douleur lombaire', 'douleur dorsale'],
        questions: [
            'Où exactement dans le dos avez-vous mal ? (Bas, milieu, haut)',
            'La douleur descend-elle dans une jambe ?',
            'Est-ce apparu après un effort ou une chute ?',
        ]
    },

    // Respiration
    'respire': {
        keywords: ['difficulté respiratoire', 'essoufflement', 'manque d\'air', 'souffle court'],
        questions: commonQuestions.respiratory
    },
    'souffle': { // Variante
        keywords: ['difficulté respiratoire', 'essoufflement', 'manque d\'air'],
        questions: commonQuestions.respiratory
    },
    'toux': {
        keywords: ['toux', 'tousse'],
        questions: [
            'La toux est-elle sèche ou grasse (avec crachats) ?',
            'Depuis combien de temps toussez-vous ?',
            'Avez-vous de la fièvre ou des difficultés à respirer associées ?'
        ]
    },

    // Fièvre
    'fièvre': {
        keywords: ['fièvre', 'chaud', 'température élevée'],
        questions: commonQuestions.fever
    },
    'température': { // Nouveau: lié à fièvre
        keywords: ['température', 'fièvre'],
        questions: commonQuestions.fever
    },
    'frisson': { // Variante fièvre
        keywords: ['frissons', 'fièvre'],
        questions: commonQuestions.fever
    },

    // Traumatisme / Blessures
    'tomber': {
        keywords: ['chute', 'tombé(e)', 'perte d\'équilibre'],
        questions: commonQuestions.fall
    },
     'chute': { // Variante
        keywords: ['chute', 'tombé(e)'],
        questions: commonQuestions.fall
    },
    'cogné': {
        keywords: ['choc', 'coup', 'contusion'],
        questions: [
            'Quelle partie du corps a reçu le choc ?',
            'Y a-t-il un gonflement, un bleu ou une plaie ouverte ?',
            'Avez-vous des douleurs intenses ou des difficultés à bouger ?'
        ]
    },
     'coupure': { /* ... */ }, // Garder vos définitions précédentes ou les adapter
     'plaie': { /* ... */ },
     'brûlure': { /* ... */ },
     'saigne': { /* ... */ },

    // Neuro / Conscience
    'vertige': { /* ... */ },
    'évanoui': { /* ... */ },
    'connaissance': { /* ... */ },

    // Allergies
    'allergie': {
        keywords: ['réaction allergique', 'allergie', 'éruption'],
        questions: commonQuestions.allergy
    },
    'gonflement': {
         keywords: ['gonflement', 'œdème'],
         questions: [ /* ... gardez les questions précédentes pour gonflement ... */
             'Quelle partie du corps est gonflée ?',
             'Est-ce apparu soudainement ?',
             'Est-ce douloureux, rouge ou chaud ?',
             'Avez-vous des difficultés à respirer ?'
         ]
    },

    // Digestif
    'nausée': { // Mot-clé pour les nausées
        keywords: ['nausée', 'envie de vomir', 'mal au cœur'], // Ajout "mal au cœur" ici
        questions: commonQuestions.nausea
    },
     'vomi': { // Variante
        keywords: ['vomissements', 'nausée'],
        questions: commonQuestions.nausea
    },
    'diarrhée': { /* ... */ },

    // Ajoutez d'autres...
};

/**
 * Analyse SIMPLEMENT le texte des symptômes basé sur des mots-clés prédéfinis.
 * @param {string} symptomText - La description des symptômes.
 * @returns {object} Un objet { keywords: string[], suggestedQuestions: string[] }.
 */
export const analyzeSymptomsSimple = (symptomText) => {
    if (!symptomText || typeof symptomText !== 'string' || symptomText.trim().length < 5) {
         console.log("[Simple Analysis] Texte trop court ou invalide, retour vide.");
        return { keywords: [], suggestedQuestions: [] };
    }

    console.log(`[Simple Analysis] Analyse du texte: "${symptomText.substring(0, 70)}..."`);
    const textLower = symptomText.toLowerCase();
    const foundKeywords = new Set();
    const suggestedQuestions = new Set();
    let questionCount = 0;
    const maxQuestions = 3; // Limite du nombre total de questions à suggérer

    // Parcourir les mots déclencheurs définis
    for (const triggerWord in symptomMappings) {
        // Utiliser includes() pour une recherche de sous-chaîne simple et robuste
        if (textLower.includes(triggerWord)) {
            console.log(`[Simple Analysis] Mot déclencheur trouvé: "${triggerWord}"`);

            // Ajouter les mots-clés associés (évite les doublons grâce au Set)
            symptomMappings[triggerWord].keywords.forEach(kw => foundKeywords.add(kw));

            // Ajouter les questions associées sans dépasser la limite et sans doublons
            symptomMappings[triggerWord].questions.forEach(q => {
                if (questionCount < maxQuestions && !suggestedQuestions.has(q)) {
                    suggestedQuestions.add(q);
                    questionCount++;
                }
            });
        }
         // Optionnel: sortir de la boucle si on a déjà assez de questions
         // if (questionCount >= maxQuestions) break;
    }

    // Optionnel: ajouter une question générique si absolument rien n'a été trouvé
    if (foundKeywords.size === 0 && suggestedQuestions.size === 0 && textLower.length > 15) {
        console.log("[Simple Analysis] Aucun mot-clé trouvé, ajout de questions génériques.");
        suggestedQuestions.add("Pouvez-vous décrire plus précisément le symptôme principal ?");
        if (suggestedQuestions.size < maxQuestions) {
             suggestedQuestions.add("Quand ces symptômes ont-ils commencé ?");
        }
    }

    // Convertir les Sets en Array pour le retour JSON
    const result = {
        keywords: [...foundKeywords],
        suggestedQuestions: [...suggestedQuestions]
    };

    console.log("[Simple Analysis] Résultat final:", result);
    return result;
};