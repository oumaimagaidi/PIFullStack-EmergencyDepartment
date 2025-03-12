import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabNavigation from './TabNavigation';
import EditableField from './EditableField';
import { PencilIcon, SaveIcon } from 'lucide-react';

const ProfileContent = ({
    profileData,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    handleEdit,
    handleSave
}) => {
    const getTabs = () => {
        const tabs = ['personal'];
        if (profileData.personal?.role === 'Patient') {
            tabs.push('medical');
        } else if (['Doctor', 'Nurse', 'Administrator'].includes(profileData.personal?.role)) {
            tabs.push('professional');
        }
        return tabs;
    };

    const renderFields = (section) => {
        const data = profileData[section] || {};

        // Skip certain fields that shouldn't be editable
        const skipFields = ['role', 'username'];

        // Get all the fields in the section
        const fields = Object.entries(data).filter(([field]) => !skipFields.includes(field));

        if (fields.length === 0) {
            return (
                <div className="col-span-2 text-center py-8 text-gray-500">
                    No information available in this section
                </div>
            );
        }

        const getFieldType = (field, value) => {
            if (field === 'allergies' || Array.isArray(value)) return 'array';
            if (field === 'dateOfBirth' || field.toLowerCase().includes('date')) return 'date';
            if (field.toLowerCase().includes('description') || field.toLowerCase().includes('notes')) return 'textarea';
            return 'text';
        };

        return fields.map(([field, value]) => {
            const fieldType = getFieldType(field, value);
            const label = field
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();

            return (
                <div key={field} className="col-span-1">
                    <EditableField
                        label={label}
                        value={value}
                        field={field}
                        section={section}
                        isEditing={isEditing}
                        onChange={handleEdit}
                        type={fieldType}
                    />
                </div>
            );
        });
    };

    const tabs = getTabs();

    return (
        <motion.div
            className="profile-card animate-slide-up-fade"
            style={{ animationDelay: '0.3s' }}
        >
            <div className="px-6 py-4 flex justify-between items-center border-b">
                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                <motion.button
                    className={`profile-edit-button p-2 ${isEditing
                            ? 'bg-gradient-to-r from-[#42A5FF] to-[#1E88E5] text-white'
                            : 'bg-[#42A5FF]/10 text-[#42A5FF] hover:bg-[#42A5FF]/20'
                        }`}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="flex items-center space-x-2 px-3 py-1">
                        {isEditing ? (
                            <>
                                <SaveIcon size={18} />
                                <span className="font-medium">Save Changes</span>
                            </>
                        ) : (
                            <>
                                <PencilIcon size={18} />
                                <span className="font-medium">Edit Profile</span>
                            </>
                        )}
                    </div>
                </motion.button>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderFields(activeTab)}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ProfileContent;