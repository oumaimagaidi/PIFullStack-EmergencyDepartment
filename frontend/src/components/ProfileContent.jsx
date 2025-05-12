import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Contact, Settings, Activity, Award, Calendar, Mail, PencilIcon, SaveIcon, Droplet, Pill, Dumbbell } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

// Importations des composants enfants
import TabNavigation from './TabNavigation';
import EditableField from './EditableField';
import ProfileHeader from './ProfileHeader';

// Base URL for backend
const BACKEND_BASE_URL = 'http://localhost:8089';

// Static daily advice data for patients (in English)
const DAILY_ADVICE = [
  {
    id: '1',
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily to maintain energy and overall health.',
    image: 'https://picsum.photos/200?random=1',
    icon: <Droplet className="w-12 h-12 text-blue-600" />,
  },
  {
    id: '2',
    title: 'Take Your Medication',
    description: 'Follow your medication schedule to manage your health effectively.',
    image: 'https://picsum.photos/200?random=2',
    icon: <Pill className="w-12 h-12 text-blue-600" />,
  },
  {
    id: '3',
    title: 'Get Moving',
    description: 'Engage in 30 minutes of light exercise, like walking, to boost mood and fitness.',
    image: 'https://picsum.photos/200?random=3',
    icon: <Dumbbell className="w-12 h-12 text-blue-600" />,
  },
];

const ProfileContent = ({
  profileData,
  activeTab,
  setActiveTab,
  isEditing,
  setIsEditing,
  handleEdit,
  handleSave,
}) => {
  const [isDarkThemeLocal, setIsDarkThemeLocal] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const [avatarUrlLocal, setAvatarUrlLocal] = useState('');
  const [notificationsLocal, setNotificationsLocal] = useState(0);

  const { toast } = useToast();

  // Effect for theme
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

  // Effect to sync avatar URL
  useEffect(() => {
    let finalImageUrl = '';
    if (profileData?.personal?.profileImage) {
      const imagePath = profileData.personal.profileImage;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        finalImageUrl = imagePath;
      } else if (imagePath.startsWith('/')) {
        finalImageUrl = `${BACKEND_BASE_URL}${imagePath}`;
      } else {
        console.warn("Unrecognized image path format:", imagePath);
      }
    }
    setAvatarUrlLocal(finalImageUrl);
    setNotificationsLocal(profileData?.user?.unreadNotifications || 3);
  }, [profileData]);

  // Debug role, tab, and profile data
  useEffect(() => {
    console.log("ProfileContent - Role:", profileData?.personal?.role, "Active Tab:", activeTab);
    console.log("Profile Data:", JSON.stringify(profileData, null, 2));
  }, [profileData, activeTab]);

  const getTabs = () => {
    const baseTabs = ['personal', 'contact', 'emergencyContacts', 'settings'];
    if (!profileData?.personal?.role) {
      console.log("No role defined, using base tabs");
      return baseTabs;
    }
    const role = profileData.personal.role;
    if (role === 'Patient') return [...baseTabs, 'medical', 'appointments'];
    if (['Doctor', 'Nurse'].includes(role)) return [...baseTabs, 'professional', 'certifications', 'appointments'];
    if (role === 'Administrator') return [...baseTabs, 'professional'];
    return baseTabs;
  };

  const tabs = getTabs();
  const currentRole = profileData?.personal?.role || 'User';
  const firstNameForHeader = profileData?.personal?.firstName || profileData?.personal?.username?.split(' ')[0] || '';
  const lastNameForHeader = profileData?.personal?.lastName || profileData?.personal?.username?.split(' ').slice(1).join(' ') || '';

  const handleAvatarUploadCallback = (event) => {
    const file = event.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      setAvatarUrlLocal(tempUrl);
      handleEdit('personal', 'profileImage', file);
      toast({
        title: "Profile picture uploading...",
        description: "Your new profile picture is being processed.",
      });
    }
  };

  const getFieldTooltipText = (field) => {
    const tooltips = {
      firstName: 'Your first name',
      lastName: 'Your last name',
      email: 'Email address for communication',
      phone: 'Phone number for contact',
      address: 'Physical address',
      dateOfBirth: 'Date of birth',
      allergies: 'List of known allergies',
      medicalConditions: 'Current medical conditions',
      specialty: 'Medical specialization',
      licenseNumber: 'Professional license number',
      notificationPreferences: 'Notification preferences',
      language: 'Preferred language for the interface',
      emergencyContactName: 'Emergency contact name',
      emergencyContactPhone: 'Emergency contact phone',
      certificationName: 'Certification name',
      certificationDate: 'Certification date',
      appointmentDate: 'Appointment date',
      appointmentDetails: 'Appointment details',
    };
    return tooltips[field] || `Edit ${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}`;
  };

  const renderFieldsForSection = (section) => {
    if (!profileData || !profileData[section]) {
      return <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">No data available for this section.</div>;
    }
    const data = profileData[section];
    const skipFields = ['role', 'username', 'avatar', 'profileImage', 'id', '_id', 'userId', 'user', 'password'];

    const fields = Object.entries(data).filter(([key, value]) =>
      !skipFields.includes(key) &&
      (typeof value !== 'object' || value === null || (Array.isArray(value) && value.every(item => typeof item === 'string')))
    );

    if (fields.length === 0) {
      return <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 rounded-2xl">No editable information in this section.</div>;
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
    const icons = {
      personal: <User size={16} />,
      contact: <Mail size={16} />,
      emergencyContacts: <Contact size={16} />,
      settings: <Settings size={16} />,
      medical: <Activity size={16} />,
      professional: <Award size={16} />,
      certifications: <Award size={16} />,
      appointments: <Calendar size={16} />,
    };
    return icons[tab] || <User size={16} />;
  };

  const sectionTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1');

  // Render Daily Advice Section
  const renderDailyAdvice = () => {
    console.log("Rendering Daily Advice - Role:", currentRole, "Tab:", activeTab);
    return (
      <motion.div
        className="mt-10 relative border-4 border-white-500" // Debug border
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-3xl font-bold mb-6"
          style={{ color: '#42A5FF' }}
        >
          Daily Advice
        </h2>
        <div className="relative bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-700 rounded-2xl p-8 shadow-xl overflow-hidden">
          {/* Sparkling Background Effect */}
          <div className="absolute inset-0 sparkle-bg"></div>
          <div className="grid gap-6 md:grid-cols-3 relative z-10">
            {DAILY_ADVICE.map((advice, index) => (
              <motion.div
                key={advice.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
              >
                <Card className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                  <img
                    src={advice.image}
                    alt={advice.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      console.log(`Image failed to load: ${advice.image}`);
                      e.target.style.display = 'none'; // Hide broken image
                      e.target.nextSibling.style.display = 'block'; // Show icon
                    }}
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                      e.target.nextSibling.style.display = 'none';
                    }}
                  />
                  <div
                    className="hidden w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg mb-4"
                  >
                    {advice.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                    {advice.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {advice.description}
                  </p>
                  <button
                    className="mt-4 w-full py-2 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: '#42A5FF' }}
                  >
                    Learn More
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!profileData || !profileData.personal) {
    console.log("Profile data missing, showing loading state");
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">Loading profile content...</div>;
  }

  return (
    <>
      {/* Embedded CSS */}
      <style>
        {`
          /* Sparkling Background Effect */
          .sparkle-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            pointer-events: none;
          }

          .sparkle-bg::before,
          .sparkle-bg::after,
          .sparkle-bg .sparkle-1,
          .sparkle-bg .sparkle-2 {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            animation: sparkle 3s infinite ease-in-out;
            opacity: 0;
          }

          .sparkle-bg::before {
            top: 15%;
            left: 20%;
            animation-delay: 0.3s;
          }

          .sparkle-bg::after {
            top: 50%;
            left: 60%;
            animation-delay: 1s;
          }

          .sparkle-bg .sparkle-1 {
            top: 70%;
            left: 30%;
            animation-delay: 1.5s;
          }

          .sparkle-bg .sparkle-2 {
            top: 30%;
            left: 80%;
            animation-delay: 2s;
          }

          @keyframes sparkle {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
            100% {
              opacity: 0;
              transform: scale(0);
            }
          }

          /* Enhanced hover effects */
          .hover\\:shadow-2xl:hover {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          .transform {
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
          }

          .hover\\:-translate-y-2:hover {
            transform: translateY(-8px);
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .md\\:grid-cols-3 {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className={`min-h-screen transition-colors duration-300 ${isDarkThemeLocal ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} pb-12`}>
        <ProfileHeader
          firstName={firstNameForHeader}
          lastName={lastNameForHeader}
          role={currentRole}
          avatarUrl={avatarUrlLocal}
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Manage your profile sections.</p>
            <Separator className="mb-4 bg-gray-200 dark:bg-gray-700" />
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="flex flex-col space-y-1"
              tabClassName={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
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
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  isEditing
                    ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus:ring-gray-400'
                }`}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditing ? <><SaveIcon size={16} /><span>Save</span></> : <><PencilIcon size={16} /><span>Edit</span></>}
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

            {/* Render Daily Advice Section */}
            {renderDailyAdvice()}
          </motion.main>
        </div>
      </div>
    </>
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