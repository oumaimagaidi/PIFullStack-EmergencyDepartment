import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const EditableField = ({
  label,
  value,
  field,
  section,
  isEditing,
  onChange,
  type = 'text'
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    onChange(section, field, newValue);
  };

  const displayValue = () => {
    if (!value && value !== 0) return 'Not specified';

    if (Array.isArray(value)) {
      return value.join(', ') || 'None';
    }

    if (type === 'date' && value) {
      try {
        return new Date(value).toLocaleDateString();
      } catch (e) {
        return value;
      }
    }

    return value;
  };

  const renderEditableContent = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={Array.isArray(localValue) ? localValue.join(', ') : localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-2 border border-profileBlue-200 rounded focus:outline-none focus:ring-1 focus:ring-profileBlue-400 transition-all"
          rows={3}
        />
      );
    } else if (type === 'date') {
      return (
        <input
          type="date"
          value={localValue ? new Date(localValue).toISOString().split('T')[0] : ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-2 border border-profileBlue-200 rounded focus:outline-none focus:ring-1 focus:ring-profileBlue-400 transition-all"
        />
      );
    } else if (type === 'array') {
      return (
        <input
          type="text"
          value={Array.isArray(localValue) ? localValue.join(', ') : localValue || ''}
          onChange={(e) => handleChange(e.target.value.split(',').map(item => item.trim()))}
          className="w-full p-2 border border-profileBlue-200 rounded focus:outline-none focus:ring-1 focus:ring-profileBlue-400 transition-all"
          placeholder="Separate values with commas"
        />
      );
    } else {
      return (
        <input
          type="text"
          value={localValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full p-2 border border-profileBlue-200 rounded focus:outline-none focus:ring-1 focus:ring-profileBlue-400 transition-all"
        />
      );
    }
  };

  return (
    <motion.div
      className="profile-field-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="profile-field-label">{label}</div>

      {isEditing ? (
        renderEditableContent()
      ) : (
        <div className="profile-field-value">
          {displayValue()}
        </div>
      )}
    </motion.div>
  );
};

export default EditableField;