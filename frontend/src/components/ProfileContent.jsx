import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Contact, Settings, Activity, Award, Calendar, Mail, PencilIcon, SaveIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Importations des composants enfants
import TabNavigation from './TabNavigation';
import EditableField from './EditableField';
import ProfileHeader from './ProfileHeader'; // Le ProfileHeader fusionné

// --- AJOUT : URL de base de votre backend ---
// Remplacez par l'URL réelle ou utilisez une variable d'environnement
const BACKEND_BASE_URL = 'http://localhost:8089';
// --- FIN AJOUT ---

const ProfileContent = ({
    profileData,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    handleEdit,
    handleSave
}) => {
    const [isDarkThemeLocal, setIsDarkThemeLocal] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });
    const [avatarUrlLocal, setAvatarUrlLocal] = useState(''); // Initialisé à vide
    const [notificationsLocal, setNotificationsLocal] = useState(0);

    const { toast } = useToast();

    // Effet pour le thème (inchangé)
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkThemeLocal) {
            root.classList.add('dark');
            if (typeof window !== 'undefined') localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            if (typeof window !== 'undefined') localStorage.setItem('theme', 'light');
        }
    }, [isDarkThemeLocal]);

    // --- MODIFIÉ : useEffect pour synchroniser l'URL de l'avatar ---
    useEffect(() => {
        let finalImageUrl = ''; // Commencer avec une URL vide par défaut
        if (profileData?.personal?.profileImage) {
            const imagePath = profileData.personal.profileImage;

            // Vérifier si c'est déjà une URL absolue
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                finalImageUrl = imagePath;
            }
            // Sinon, si c'est un chemin relatif commençant par '/', construire l'URL absolue
            else if (imagePath.startsWith('/')) {
                finalImageUrl = `${BACKEND_BASE_URL}${imagePath}`;
            }
            // Optionnel: Gérer d'autres formats ou logguer un avertissement
            else {
                console.warn("Format de chemin d'image non reconnu:", imagePath);
                // finalImageUrl reste ''
            }
        } else {
            // Pas de profileImage dans les données
            // finalImageUrl reste ''
        }

        setAvatarUrlLocal(finalImageUrl); // Mettre à jour l'état avec l'URL complète (ou vide)

        // Logique pour les notifications (inchangée)
        setNotificationsLocal(profileData?.user?.unreadNotifications || 3); // Exemple

    }, [profileData]); // Déclenché quand profileData change
    // --- FIN MODIFICATION ---

    const getTabs = () => {
        const baseTabs = ['personal', 'contact', 'emergencyContacts', 'settings'];
        if (!profileData?.personal?.role) return baseTabs;
        const role = profileData.personal.role;
        if (role === 'Patient') return [...baseTabs, 'medical', 'appointments'];
        if (['Doctor', 'Nurse'].includes(role)) return [...baseTabs, 'professional', 'certifications', 'appointments'];
        if (role === 'Administrator') return [...baseTabs, 'professional'];
        return baseTabs;
    };

    const tabs = getTabs();
    const currentRole = profileData.personal?.role || 'Utilisateur';
    const firstNameForHeader = profileData.personal?.firstName || profileData.personal?.username?.split(' ')[0] || '';
    const lastNameForHeader = profileData.personal?.lastName || profileData.personal?.username?.split(' ').slice(1).join(' ') || '';

    // --- MODIFIÉ : S'assurer que handleEdit utilise 'profileImage' ---
    const handleAvatarUploadCallback = (event) => {
        const file = event.target.files[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setAvatarUrlLocal(tempUrl); // Affichage optimiste
            // Utiliser 'profileImage' car c'est le nom du champ dans la DB
            handleEdit('personal', 'profileImage', file);
            toast({
                title: "Photo de profil en cours...",
                description: "Votre nouvelle photo de profil est en cours de traitement.",
            });
        }
    };
    // --- FIN MODIFICATION ---


    const getFieldTooltipText = (field) => {
        const tooltips = { firstName: 'Votre prénom', lastName: 'Votre nom de famille', email: 'Adresse e-mail pour la communication', phone: 'Numéro de téléphone pour le contact', address: 'Adresse physique', dateOfBirth: 'Date de naissance', allergies: 'Liste des allergies connues', medicalConditions: 'Conditions médicales actuelles', specialty: 'Domaine de spécialisation médicale', licenseNumber: 'Numéro de licence professionnelle', notificationPreferences: 'Préférences pour les notifications', language: 'Langue préférée pour l\'interface', emergencyContactName: 'Nom du contact d\'urgence', emergencyContactPhone: 'Téléphone du contact d\'urgence', certificationName: 'Nom de la certification', certificationDate: 'Date d\'obtention de la certification', appointmentDate: 'Date du rendez-vous', appointmentDetails: 'Détails du rendez-vous' };
        return tooltips[field] || `Modifier ${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}`;
    };

    const renderFieldsForSection = (section) => {
        if (!profileData || !profileData[section]) {
            return <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">Aucune donnée disponible pour cette section.</div>;
        }
        const data = profileData[section];
        // --- MODIFIÉ : S'assurer que profileImage est bien dans skipFields ---
        const skipFields = ['role', 'username', 'avatar', 'profileImage', 'id', '_id', 'userId', 'user', 'password']; // Ajouter password aussi
        // --- FIN MODIFICATION ---

        const fields = Object.entries(data).filter(([key, value]) =>
            !skipFields.includes(key) &&
            (typeof value !== 'object' || value === null || (Array.isArray(value) && value.every(item => typeof item === 'string')))
        );

        if (fields.length === 0) {
            return <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 rounded-2xl">Aucune information éditable dans cette section.</div>;
        }

        const getFieldType = (fieldKey, fieldValue) => {
            if (fieldKey.toLowerCase().includes('allergies') || (Array.isArray(fieldValue) && fieldValue.every(item => typeof item === 'string'))) return 'array';
            if (fieldKey.toLowerCase().includes('date') || fieldKey === 'dateOfBirth') return 'date';
            if (fieldKey.toLowerCase().includes('notes') || fieldKey.toLowerCase().includes('description') || fieldKey === 'bio') return 'textarea';
            return 'text';
        };

        return fields.map(([fieldKey, fieldValue], index) => {
            const fieldType = getFieldType(fieldKey, fieldValue);
            const label = fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();

            return (
                <motion.div
                    key={`${section}-${fieldKey}`}
                    className="w-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <EditableField
                                        label={label}
                                        value={fieldValue === null || fieldValue === undefined ? '' : fieldValue}
                                        field={fieldKey}
                                        section={section}
                                        isEditing={isEditing}
                                        onChange={handleEdit}
                                        type={fieldType}
                                        className="w-full bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus-within:ring-2 focus-within:ring-blue-50 dark:focus-within:ring-blue-50 transition-all duration-300 shadow-sm hover:shadow-md dark:text-gray-100"
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-gray-800 text-white text-xs rounded p-2">
                                {getFieldTooltipText(fieldKey)}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </motion.div>
            );
        });
    };

    const getTabIcon = (tab) => {
        const icons = { personal: <User size={16} />, contact: <Mail size={16} />, emergencyContacts: <Contact size={16} />, settings: <Settings size={16} />, medical: <Activity size={16} />, professional: <Award size={16} />, certifications: <Award size={16} />, appointments: <Calendar size={16} /> };
        return icons[tab] || <User size={16} />;
    };

    const sectionTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1');

    if (!profileData || !profileData.personal) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">Chargement du contenu du profil...</div>;
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkThemeLocal ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} pb-12`}>
            <ProfileHeader
                firstName={firstNameForHeader}
                lastName={lastNameForHeader}
                role={currentRole}
                avatarUrl={avatarUrlLocal} // Utilise l'URL locale construite
                isDarkTheme={isDarkThemeLocal}
                notifications={notificationsLocal}
                isEditing={isEditing}
                setIsDarkTheme={setIsDarkThemeLocal}
                setNotifications={setNotificationsLocal}
                handleAvatarUpload={handleAvatarUploadCallback}
                onSettingsClick={() => setActiveTab('settings')}
            />

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 flex flex-col lg:flex-row gap-6 relative z-10">
                <motion.aside
                    className="lg:w-80 w-full lg:sticky lg:top-24 lg:self-start bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg dark:shadow-gray-900/50"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
                >
                    <h2 className="text-xl font-semibold mb-1 text-gray-700 dark:text-gray-200">Navigation</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Gérez les sections de votre profil.</p>
                    <Separator className="mb-4 bg-gray-200 dark:bg-gray-700" />
                    <TabNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        className="flex flex-col space-y-1"
                        tabClassName={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 dark:focus:ring-blue-50${ // Correction: focus:ring-blue-500
                            isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                            }`
                        }
                        tabIcon={getTabIcon}
                    />
                </motion.aside>

                <motion.main
                    className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 md:p-8 min-h-[400px]"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
                >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 dark:text-white">
                            {sectionTitle}
                        </h2>
                        <motion.button
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${isEditing
                                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-gray-400'
                                }`}
                            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isEditing ? <><SaveIcon size={16} /><span>Enregistrer</span></> : <><PencilIcon size={16} /><span>Modifier</span></>}
                        </motion.button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {renderFieldsForSection(activeTab)}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.main>
            </div>
        </div>
    );
};

ProfileContent.propTypes = {
    profileData: PropTypes.object.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
    isEditing: PropTypes.bool.isRequired,
    setIsEditing: PropTypes.func.isRequired,
    handleEdit: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
};

export default ProfileContent;