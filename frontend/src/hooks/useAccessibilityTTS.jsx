// src/hooks/useAccessibilityTTS.jsx
import { useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

const useAccessibilityTTS = () => {
  const { isTTSActive, speak, stopSpeaking } = useAccessibility();

  useEffect(() => {
    if (!isTTSActive) {
      stopSpeaking(); // S'assurer que la parole s'arrête si le TTS est désactivé
      return; // Ne pas attacher d'écouteurs si le TTS est inactif
    }

    // Fonction pour extraire le texte pertinent
    const getAccessibleText = (element) => {
      if (!element) return '';

      // 1. Priorité aux attributs ARIA
      if (element.hasAttribute('aria-label')) return element.getAttribute('aria-label');
      // Vous pourriez implémenter aria-labelledby et aria-describedby si nécessaire, c'est plus complexe.

      // 2. Attributs sémantiques standard
      if (element.tagName === 'IMG' && element.hasAttribute('alt')) return element.getAttribute('alt');
      if (element.hasAttribute('title')) return element.getAttribute('title');

      // 3. Texte du label associé (pour les inputs)
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
         const label = element.labels?.[0]; // Récupère le premier label associé
         if (label && label.textContent) {
             return label.textContent.trim().replace(/[:*]/g, '') + (element.placeholder ? `. ${element.placeholder}` : '');
         }
         if (element.placeholder) return element.placeholder;
      }
       // 4. Texte du bouton, lien ou autre élément interactif
       if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.tagName === 'SUMMARY') {
          return element.textContent.trim();
       }

      // 5. Texte d'un élément générique qui pourrait être important (ex: titre, paragraphe important)
      // Cette partie est délicate et peut devenir bruyante. On peut se limiter aux éléments interactifs.
      // Si vous voulez inclure des textes statiques, soyez sélectif.
      // if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'P') {
      //      // Évitez les textes trop longs
      //      const text = element.textContent.trim();
      //      return text.length < 100 ? text : '';
      // }


      return ''; // Aucun texte pertinent trouvé
    };

    const handleInteraction = (event) => {
      // Cibler l'élément qui a déclenché l'événement (ou un parent interactif)
      const target = event.target;
      // Trouver l'élément interactif le plus proche qui a du texte ou un attribut ARIA
      let interactiveElement = target;
       while (interactiveElement && interactiveElement !== document.body) {
            const tagName = interactiveElement.tagName;
            const hasAriaLabel = interactiveElement.hasAttribute('aria-label');
            const hasAlt = tagName === 'IMG' && interactiveElement.hasAttribute('alt');
            const hasTitle = interactiveElement.hasAttribute('title');
            const isInteractiveTag = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY'].includes(tagName);
            const hasTextContent = interactiveElement.textContent.trim().length > 0;

            // Si c'est un tag interactif OU qu'il a un attribut ARIA/alt/title pertinent
            if (isInteractiveTag || hasAriaLabel || hasAlt || hasTitle || (hasTextContent && tagName.match(/^[Hh]\d$|^P$|^SPAN$/))) { // Ajout de Hx, P, SPAN pour le texte
                 const text = getAccessibleText(interactiveElement);
                if (text) {
                    // Ajoutez un petit délai pour les événements mouseover afin de ne pas parler instantanément lors du survol rapide
                    if (event.type === 'mouseover') {
                         // Optionnel: Clear un timer précédent pour éviter les lectures multiples si on survole rapidement
                         if (interactiveElement._ttsTimer) clearTimeout(interactiveElement._ttsTimer);
                         interactiveElement._ttsTimer = setTimeout(() => {
                            speak(text);
                         }, 300); // Délai de 300ms avant de lire au survol
                     } else { // Pour focus, on lit tout de suite
                        speak(text);
                     }
                    return; // Arrêter la recherche une fois un élément pertinent trouvé
                }
            }

            interactiveElement = interactiveElement.parentElement;
       }
    };

    // Ajouter les écouteurs d'événements sur le document
    document.addEventListener('mouseover', handleInteraction);
    document.addEventListener('focus', handleInteraction, true); // Utiliser capture phase pour focus car il ne bulle pas toujours

    // Fonction de nettoyage
    return () => {
      document.removeEventListener('mouseover', handleInteraction);
      document.removeEventListener('focus', handleInteraction, true);
      stopSpeaking(); // S'arrêter de parler lors du démontage ou désactivation
       // Nettoyer les timers mouseover si nécessaire
       // (Peut être complexe si beaucoup d'éléments avec timers)
    };
  }, [isTTSActive, speak, stopSpeaking]); // Re-run effect if isTTSActive changes

   // Hook ne retourne rien car il gère des effets secondaires
   return null;
};

export default useAccessibilityTTS;