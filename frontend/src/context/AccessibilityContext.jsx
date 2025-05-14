// src/context/AccessibilityContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  // State for TTS activation (from localStorage)
  const [isTTSActive, setIsTTSActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('accessibility:ttsActive');
      return savedPreference ? JSON.parse(savedPreference) : false; 
    }
    return false;
  });

  // State for the preferred language (from localStorage)
  const [ttsLanguage, setTtsLanguage] = useState(() => {
      if (typeof window !== 'undefined') {
          const savedLang = localStorage.getItem('accessibility:ttsLanguage');
          // Default to French if not saved, as it seems you have a French voice
          return savedLang || 'fr-FR'; 
      }
      return 'fr-FR'; 
  });

   // État pour stocker les voix disponibles (fetches from window.speechSynthesis)
   const [availableVoices, setAvailableVoices] = useState([]);
   // État pour la voix actuellement sélectionnée par notre logique
   const [selectedVoice, setSelectedVoice] = useState(null);


  // Sauvegarder les préférences dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility:ttsActive', JSON.stringify(isTTSActive));
    }
  }, [isTTSActive]);

   useEffect(() => {
       if (typeof window !== 'undefined') {
           localStorage.setItem('accessibility:ttsLanguage', ttsLanguage);
       }
   }, [ttsLanguage]);


    // Effect to fetch voices when they are loaded by the browser
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const handleVoicesChanged = () => {
                const voices = window.speechSynthesis.getVoices();
                console.log('TTS: Voices changed. Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
                setAvailableVoices(voices);
            };

            let voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                handleVoicesChanged();
            } else {
                 window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
            }

            return () => {
                 if (window.speechSynthesis) {
                     window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
                 }
            };
        }
    }, []); 


    // *** CORRECTION ICI: Effect to select the preferred voice ***
    useEffect(() => {
        if (availableVoices.length > 0 && ttsLanguage) {
            console.log(`TTS: Attempting to select voice for language "${ttsLanguage}" from ${availableVoices.length} available voices.`);
            
            // --- LOGIQUE DE SÉLECTION DE VOIX RAFFINÉE ---
            // 1. Chercher une voix qui correspond EXACTEMENT à la langue demandée (priorité locale)
            const matchingLanguageVoice = availableVoices.find(v => v.lang === ttsLanguage && v.localService) 
                                      || availableVoices.find(v => v.lang === ttsLanguage); 

            let voiceToUse = matchingLanguageVoice; // Start with the best match

            // 2. Si aucune voix ne correspond à la langue demandée, chercher un fallback
            if (!voiceToUse) {
                console.warn(`TTS: No voice found specifically for language "${ttsLanguage}". Trying fallbacks.`);
                 voiceToUse = availableVoices.find(v => v.default) // Fallback 1: Voix par default du système
                           || availableVoices[0]; // Fallback 2: La première voix disponible (might not speak requested language)
            }

            // 3. Définir la voix sélectionnée
            if (voiceToUse) {
                console.log(`TTS: Final selected voice "${voiceToUse.name}" (lang: ${voiceToUse.lang}) for language "${ttsLanguage}"`);
                setSelectedVoice(voiceToUse);
            } else {
                 console.warn(`TTS: No voice found at all. Speech may fail or use an unexpected default.`);
                 setSelectedVoice(null); // Set to null if no voice is found, browser will use its ultimate default
            }
        } else if (availableVoices.length === 0) {
             console.log("TTS: availableVoices list is empty.");
             setSelectedVoice(null); // No voices available initially
        }
    }, [availableVoices, ttsLanguage]); // Re-run when available voices or preferred language changes


  // Logique Web Speech API pour lire le texte
  const speak = (text) => {
     if (!isTTSActive || typeof window === 'undefined' || !window.speechSynthesis) {
         console.log('TTS inactive ou API non supportée. Annulation de la lecture.');
         return; 
     }

     window.speechSynthesis.cancel(); // Annule la parole en cours

     const utterance = new SpeechSynthesisUtterance(text);

     // *** DÉFINIR LA LANGUE ET LA VOIX DE LA LECTURE ***
     // Définir la langue est important comme hint, même si une voix est sélectionnée
     utterance.lang = ttsLanguage; 
     
     if (selectedVoice) { // Si une voix a été sélectionnée par notre logique
         utterance.voice = selectedVoice; 
         console.log(`TTS: Using selected voice "${selectedVoice.name}" (lang: ${selectedVoice.lang}) for "${text.substring(0, Math.min(text.length, 50))}"`);
     } else {
          // Si aucune voix n'est sélectionnée par notre logique (selectedVoice is null),
          // l'API utilisera le défaut du navigateur/système.
          console.log(`TTS: Using browser/system default voice for "${text.substring(0, Math.min(text.length, 50))}" (preferred lang: ${ttsLanguage})`);
     }

     // Ajoutez des écouteurs pour le débogage si nécessaire
     // utterance.onstart = (event) => { console.log('Speech started:', event); };
     // utterance.onend = (event) => { console.log('Speech ended:', event); };
     // utterance.onerror = (event) => { console.error('Speech error:', event.error); };


     window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
       if (typeof window !== 'undefined' && window.speechSynthesis) {
           window.speechSynthesis.cancel();
           console.log('TTS: Speech cancelled.');
       }
  };

  return (
   
    <AccessibilityContext.Provider value={{ 
        isTTSActive, setIsTTSActive, 
        ttsLanguage, setTtsLanguage, 
        availableVoices, 
        selectedVoice,   
        speak, 
        stopSpeaking 
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

