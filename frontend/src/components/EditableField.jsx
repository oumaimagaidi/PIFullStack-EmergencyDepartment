import React, { useState, useEffect } from 'react'; // useEffect n'est pas utilisé ici, peut être supprimé si c'est le cas partout.
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, ChevronDown } from 'lucide-react';

// L'interface EditableFieldProps est supprimée

const EditableField = ({
  label,
  value,
  field,
  section,
  isEditing,
  onChange,
  type = 'text', // La valeur par défaut reste
  className = '', // La valeur par défaut reste
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Pour arrayValue, on initialise en se basant sur le type de `value`
  const [arrayValue, setArrayValue] = useState(Array.isArray(value) ? value : []);
  const [newItem, setNewItem] = useState('');

  // Mettre à jour arrayValue si la prop `value` (de type tableau) change de l'extérieur
  useEffect(() => {
    if (type === 'array' && Array.isArray(value)) {
      setArrayValue(value);
    } else if (type !== 'array') {
      // Réinitialiser si le type n'est plus 'array' ou si la valeur n'est plus un tableau
      setArrayValue([]);
    }
  }, [value, type]);


  const handleArrayAdd = () => {
    if (newItem.trim()) {
      const updated = [...arrayValue, newItem.trim()];
      setArrayValue(updated);
      onChange(section, field, updated);
      setNewItem('');
    }
  };

  const handleArrayRemove = (index) => {
    const updated = arrayValue.filter((_, i) => i !== index);
    setArrayValue(updated);
    onChange(section, field, updated);
  };

  const renderEditor = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            value={typeof value === 'string' ? value : ''} // Assurer que value est une chaîne
            onChange={(e) => onChange(section, field, e.target.value)}
            className="w-full min-h-[120px] bg-transparent border-0 focus:ring-0 text-base p-0"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={typeof value === 'string' ? value : ''} // Assurer que value est une chaîne
            onChange={(e) => onChange(section, field, e.target.value)}
            className="w-full bg-transparent border-0 focus:ring-0 text-base p-0"
          />
        );
      case 'array':
        return (
          <div className="space-y-2">
            {arrayValue.map((item, index) => (
              <div key={index} className="flex justify-between items-center group">
                <span className="text-base">{item}</span>
                <button
                  type="button"
                  onClick={() => handleArrayRemove(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1 bg-white/50 dark:bg-gray-800/50 border-0 focus:ring-1 ring-primary/30 text-sm"
                placeholder={`Add new ${label.toLowerCase()}...`}
                onKeyPress={(e) => e.key === 'Enter' && handleArrayAdd()}
              />
              <button
                type="button"
                onClick={handleArrayAdd}
                className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors duration-200"
              >
                <Check size={14} />
              </button>
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <Input
            type="text"
            value={typeof value === 'string' ? value : ''} // Assurer que value est une chaîne
            onChange={(e) => onChange(section, field, e.target.value)}
            className="w-full bg-transparent border-0 focus:ring-0 text-base p-0"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        );
    }
  };

  const isArrayWithMultipleItems = type === 'array' && Array.isArray(value) && value.length > 1;
  const shouldAllowExpand = type === 'textarea' || isArrayWithMultipleItems;

  return (
    <motion.div
      className={`profile-field-container ${className} ${isEditing ? 'field-highlight' : ''}`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div className="px-5 py-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h3>
          {shouldAllowExpand && (
            <button
              type="button" // Ajout du type pour un bouton
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>
          )}
        </div>

        <motion.div
          className="overflow-hidden"
          animate={{
            // Si le type est 'array', la hauteur est 'auto' pour toujours afficher les éléments + le champ d'ajout.
            // Sinon, elle dépend de isExpanded ou est fixée à '2rem' pour les champs texte/date/textarea non étendus.
            height: type === 'array' ? 'auto' : (isExpanded ? 'auto' : '2rem'),
          }}
          // Ajustement pour que le contenu 'array' ne soit pas coupé en mode non-édité
          style={type === 'array' && !isEditing ? { height: 'auto' } : {}}
        >
          {isEditing ? (
            renderEditor()
          ) : (
            <div className="text-base break-words">
              {type === 'array' ? (
                Array.isArray(value) && value.length > 0 ? ( // Vérifier aussi que value.length > 0
                  <div className="space-y-1">
                    {value.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm bg-secondary/50 rounded-full px-3 py-1">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">Aucune donnée</span>
                )
              ) : value ? ( // Pour les types non-array, s'assurer que `value` n'est pas vide
                <span>{String(value)}</span> // String(value) pour gérer le cas où value est un nombre
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Aucune donnée</span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

EditableField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  field: PropTypes.string.isRequired,
  section: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['text', 'date', 'textarea', 'array']),
  className: PropTypes.string,
};

// Valeurs par défaut (déjà gérées dans la déstructuration, mais peut être explicite ici aussi)
// EditableField.defaultProps = {
//   type: 'text',
//   className: '',
// };

export default EditableField;