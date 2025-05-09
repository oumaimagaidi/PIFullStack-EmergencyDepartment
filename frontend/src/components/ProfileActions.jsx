import React from 'react';
import PropTypes from 'prop-types'; // Importez PropTypes
import { motion } from 'framer-motion';
import { PencilIcon, SaveIcon, Share2 } from 'lucide-react';

// L'interface est supprimée, nous utiliserons PropTypes à la place

const ProfileActions = ({
  isEditing,
  onEdit,
  onSave,
  onShare,
  sectionTitle
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <motion.h2
        className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {sectionTitle}
      </motion.h2>

      <div className="flex gap-2">
        {onShare && (
          <motion.button
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
            onClick={onShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={18} />
          </motion.button>
        )}

        <motion.button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isEditing
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          } transition-colors duration-200`}
          onClick={() => (isEditing ? onSave() : onEdit())}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isEditing ? (
            <>
              <SaveIcon size={18} />
              <span className="text-sm font-medium">Enregistrer</span>
            </>
          ) : (
            <>
              <PencilIcon size={18} />
              <span className="text-sm font-medium">Modifier</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

// Définition des PropTypes pour la validation
ProfileActions.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onShare: PropTypes.func, // Optionnel, donc pas de .isRequired
  sectionTitle: PropTypes.string.isRequired,
};

export default ProfileActions;