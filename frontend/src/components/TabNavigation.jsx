import React from 'react';
import PropTypes from 'prop-types'; // Importez PropTypes
import { motion } from 'framer-motion';

// L'interface TabNavigationProps est supprimée.

const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  className = '', // La valeur par défaut est conservée, c'est du JS valide
  tabClassName,
  tabIcon,
}) => {
  const getTabDisplayName = (tab) => { // Type 'string' supprimé du paramètre
    return tab
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <nav className={className}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const displayName = getTabDisplayName(tab);

        // Calcule la classe du bouton. Si tabClassName n'est pas fourni,
        // on pourrait avoir un style par défaut ou laisser vide si géré par le parent.
        // Ici, j'utilise le fallback 'default-tab' que vous aviez.
        const currentTabClassName = tabClassName
          ? tabClassName({ isActive })
          : 'default-tab-style'; // Assurez-vous que 'default-tab-style' est défini dans votre CSS ou ajustez

        return (
          <button
            key={tab}
            // className={`relative ${tabClassName ? tabClassName({ isActive }) : 'default-tab'}`}
            className={`relative ${currentTabClassName}`} // Utilisation de la variable calculée
            onClick={() => onTabChange(tab)}
          >
            {isActive && (
              <motion.div
                // className="tab-indicator" // Vous aurez besoin de définir cette classe ou de la styler en ligne
                className="absolute inset-0 bg-primary/20 rounded-md z-0" // Exemple de style pour l'indicateur
                layoutId="tab-indicator" // Important pour l'animation partagée de Framer Motion
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {/* Contenu du bouton au-dessus de l'indicateur */}
            <div className="flex items-center gap-3 z-10 relative p-2"> {/* Ajout de padding pour la visibilité */}
              {tabIcon && tabIcon(tab)}
              <span className={`${isActive ? 'font-semibold text-primary' : 'font-normal text-foreground'}`}> {/* Styles pour le texte actif/inactif */}
                {displayName}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};

// Définition des PropTypes
TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  tabClassName: PropTypes.func, // Attend une fonction qui retourne une chaîne de classes
  tabIcon: PropTypes.func,     // Attend une fonction qui retourne un nœud React (par exemple, un icône)
};

// Valeurs par défaut pour les props optionnelles (si non gérées dans la déstructuration)
// Dans ce cas, className a déjà une valeur par défaut dans la déstructuration.
// TabNavigation.defaultProps = {
//   className: '',
//   tabClassName: null, // ou une fonction par défaut si nécessaire
//   tabIcon: null,      // ou une fonction par défaut si nécessaire
// };

export default TabNavigation;