"use client"

import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Contact,
  Settings,
  Activity,
  Award, // Used for professional/certifications
  Calendar,
  Mail,
  PencilIcon,
  SaveIcon,
  Droplet,
  Pill,
  Dumbbell,
  Award as BadgeIcon, // Used for the donation badge section title
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast" // Assuming this is your Shadcn toast hook
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Ensure CardHeader, CardTitle are imported if used by DailyAdvice or Badges

// Importations des composants enfants
import TabNavigation from "./TabNavigation"
import EditableField from "./EditableField"
import ProfileHeader from "./ProfileHeader"

// Base URL for backend
const BACKEND_BASE_URL = "http://localhost:8089"

// Color palette
const COLORS = {
  primary: "#547792",
  secondary: "#94B4C1",
  dark: "#213448",
  light: "#ECEFCA",
}

// --- Donation Badge Definitions ---
const DONATION_BADGES = {
  beginner: {
    name: "Donneur Débutant",
    icon: "/images/badge1.png",
    threshold: 2,
    description: "Décerné pour avoir fait 2 dons.",
    color: "#CD7F32", // Bronze
  },
  committed: {
    name: "Donneur Engagé",
    icon: "/images/badge2.png",
    threshold: 5,
    description: "Décerné pour avoir fait 5 dons.",
    color: "#C0C0C0", // Argent
  },
  heroic: {
    name: "Donneur Héroïque",
    icon: "/images/badge3.png",
    threshold: 10,
    description: "Décerné pour avoir fait 10 dons.",
    color: "#FFD700", // Or
  },
  legendary: {
    name: "Donneur Légendaire",
    icon: "/images/badge4.png",
    threshold: 20,
    description: "Décerné pour 20+ dons. Un véritable sauveur de vies !",
    color: "#B9F2FF", // Suggérant diamant/platine
  },
};
const BADGE_ORDER = ["beginner", "committed", "heroic", "legendary"];
// --- End Donation Badge Definitions ---


// Static daily advice data for patients (in English)
const DAILY_ADVICE = [
  {
    id: "1",
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain energy and overall health.",
    image: "https://picsum.photos/seed/water/300/200", // Using seeded picsum for consistency
    icon: <Droplet className="w-12 h-12" style={{ color: COLORS.primary }} />,
  },
  {
    id: "2",
    title: "Take Your Medication",
    description: "Follow your medication schedule to manage your health effectively.",
    image: "https://picsum.photos/seed/meds/300/200",
    icon: <Pill className="w-12 h-12" style={{ color: COLORS.primary }} />,
  },
  {
    id: "3",
    title: "Get Moving",
    description: "Engage in 30 minutes of light exercise, like walking, to boost mood and fitness.",
    image: "https://picsum.photos/seed/exercise/300/200",
    icon: <Dumbbell className="w-12 h-12" style={{ color: COLORS.primary }} />,
  },
]

const ProfileContent = ({ profileData, activeTab, setActiveTab, isEditing, setIsEditing, handleEdit, handleSave }) => {
  const [isDarkThemeLocal, setIsDarkThemeLocal] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark"
    }
    return false
  })
  const [avatarUrlLocal, setAvatarUrlLocal] = useState("")
  const [notificationsLocal, setNotificationsLocal] = useState(0)

  const { toast } = useToast()

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkThemeLocal) {
      root.classList.add("dark")
      if (typeof window !== "undefined") localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      if (typeof window !== "undefined") localStorage.setItem("theme", "light")
    }
  }, [isDarkThemeLocal])

  useEffect(() => {
    let finalImageUrl = ""
    if (profileData?.personal?.profileImage) {
      const imagePath = profileData.personal.profileImage
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        finalImageUrl = imagePath
      } else if (imagePath.startsWith("/")) {
        finalImageUrl = `${BACKEND_BASE_URL}${imagePath}`
      } else {
        // Assuming it's a relative path from public, but backend usually serves from /uploads
        // For now, let's assume it's relative to backend's /uploads if not absolute or starting with /
        // finalImageUrl = `${BACKEND_BASE_URL}/uploads/${imagePath}`; // This might need adjustment based on your backend
        console.warn("Unrecognized image path format, attempting relative to backend uploads:", imagePath)
         finalImageUrl = `${BACKEND_BASE_URL}/${imagePath.startsWith('uploads/') ? '' : 'uploads/'}${imagePath}`;

      }
    }
    setAvatarUrlLocal(finalImageUrl)
    setNotificationsLocal(profileData?.personal?.unreadNotifications || profileData?.user?.unreadNotifications || 3) // Check both for flexibility
  }, [profileData])

  useEffect(() => {
    console.log("ProfileContent - Role:", profileData?.personal?.role, "Active Tab:", activeTab)
    // console.log("Profile Data for Badges:", profileData?.personal?.donationCount, profileData?.personal?.unlockedBadges);
    // console.log("Full Profile Data:", JSON.stringify(profileData, null, 2))
  }, [profileData, activeTab])

  const getTabs = () => {
    const baseTabs = ["personal", "contact", "emergencyContacts", "settings"]
    if (!profileData?.personal?.role) return baseTabs
    const role = profileData.personal.role
    if (role === "Patient") return [...baseTabs, "medical", "appointments"]
    if (["Doctor", "Nurse"].includes(role)) return [...baseTabs, "professional", "certifications", "appointments"]
    if (role === "Administrator") return [...baseTabs, "professional"]
    return baseTabs
  }

  const tabs = getTabs()
  const currentRole = profileData?.personal?.role || "User"
  const firstNameForHeader = profileData?.personal?.firstName || profileData?.personal?.username?.split(" ")[0] || ""
  const lastNameForHeader =
    profileData?.personal?.lastName || profileData?.personal?.username?.split(" ").slice(1).join(" ") || ""

  const handleAvatarUploadCallback = (event) => {
    const file = event.target.files[0]
    if (file) {
      const tempUrl = URL.createObjectURL(file)
      setAvatarUrlLocal(tempUrl) // Preview
      handleEdit("personal", "profileImageFile", file) // Pass the file object for upload
      toast({
        title: "Profile picture selected",
        description: "Click 'Save' to upload your new profile picture.",
      })
    }
  }

  const getFieldTooltipText = (field) => {
    const tooltips = { /* ... your tooltips ... */ }
    return tooltips[field] || `Edit ${field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim()}`
  }

  const renderFieldsForSection = (section) => {
    if (!profileData || !profileData[section]) {
      return (
        <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
          No data available for this section.
        </div>
      )
    }
    const data = profileData[section]
    // Exclude donationCount and unlockedBadges from being rendered as standard editable fields
    const skipFields = ["role", "username", "avatar", "profileImage", "id", "_id", "userId", "user", "password", "donationCount", "unlockedBadges", "profileImageFile"]


    const fields = Object.entries(data).filter(
      ([key, value]) =>
        !skipFields.includes(key) &&
        (typeof value !== "object" ||
          value === null ||
          (Array.isArray(value) && value.every((item) => typeof item === "string"))),
    )

    if (fields.length === 0 && section !== "personal") { // Allow personal tab to be "empty" if only badges show
      return (
        <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 rounded-2xl">
          No editable information in this section.
        </div>
      )
    }
    // If personal section and fields are empty, it might just show badges, so don't show "No editable info" yet.

    const getFieldType = (fieldKey, fieldValue) => { /* ... your getFieldType logic ... */ 
        if (fieldKey.toLowerCase().includes("allergies") || (Array.isArray(fieldValue) && fieldValue.every(item => typeof item === 'string'))) return 'array';
        if (fieldKey.toLowerCase().includes('date') || fieldKey === 'dateOfBirth') return 'date';
        if (fieldKey.toLowerCase().includes('notes') || fieldKey.toLowerCase().includes('description') || fieldKey === 'bio') return 'textarea';
        return 'text';
    }

    return fields.map(([fieldKey, fieldValue], index) => {
      const fieldType = getFieldType(fieldKey, fieldValue)
      const label = fieldKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim()
      return (
        <motion.div /* ... field motion ... */ >
          <EditableField
            label={label}
            value={fieldValue ?? ""} // Ensure value is not null/undefined
            // ... other props for EditableField
          />
        </motion.div>
      )
    })
  }
  const getTabIcon = (tab) => { /* ... your getTabIcon logic ... */ 
      const icons = {
      personal: <User size={16} style={{ color: COLORS.dark }} />,
      contact: <Mail size={16} style={{ color: COLORS.dark }} />,
      emergencyContacts: <Contact size={16} style={{ color: COLORS.dark }} />,
      settings: <Settings size={16} style={{ color: COLORS.dark }} />,
      medical: <Activity size={16} style={{ color: COLORS.dark }} />,
      professional: <Award size={16} style={{ color: COLORS.dark }} />,
      certifications: <Award size={16} style={{ color: COLORS.dark }} />,
      appointments: <Calendar size={16} style={{ color: COLORS.dark }} />,
    }
    return icons[tab] || <User size={16} style={{ color: COLORS.dark }} />
  }

  const sectionTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, " $1")

  // --- Render Donation Badges Section ---
  const renderDonationBadges = () => {
    // Show badges for Patients, Doctors, and Nurses, or adjust as needed
    const eligibleRolesForBadges = ["Patient", "Doctor", "Nurse"];
    if (!eligibleRolesForBadges.includes(currentRole)) {
        return null;
    }

    const donationCount = profileData?.personal?.donationCount || 0;
    const unlockedBadges = profileData?.personal?.unlockedBadges || [];

    return (
      <motion.div
        className="mt-10 col-span-1 md:col-span-2" // Make it span full width if it's the only thing in this tab
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: COLORS.primary }}>
          <BadgeIcon className="w-6 h-6 mr-2" /> Donation Achievements
          <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">({donationCount} Total Donations)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGE_ORDER.map((badgeKey) => {
            const badge = DONATION_BADGES[badgeKey];
            if (!badge) return null; // Should not happen if BADGE_ORDER is correct
            const isUnlocked = unlockedBadges.includes(badgeKey);
            const progress = donationCount >= badge.threshold ? 100 : Math.floor((donationCount / badge.threshold) * 100);

            return (
              <TooltipProvider key={badgeKey} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-between h-full ${
                        isUnlocked
                          ? "bg-white dark:bg-gray-800 shadow-lg"
                          : "bg-gray-100 dark:bg-gray-800/70 opacity-70"
                      }`}
                      style={{
                        borderColor: isUnlocked ? badge.color : (isDarkThemeLocal ? COLORS.secondary + '60' : COLORS.secondary + "40"),
                      }}
                      whileHover={{ y: -5 }}
                    >
                      <img
                        src={badge.icon} // Path from public folder
                        alt={badge.name}
                        className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 object-contain ${
                          !isUnlocked ? "grayscale" : ""
                        }`}
                      />
                      <div className="flex-grow flex flex-col justify-center">
                        <h3
                          className={`text-sm md:text-base font-semibold ${
                            isUnlocked ? "" : "text-gray-500 dark:text-gray-400"
                          }`}
                          style={{ color: isUnlocked ? badge.color : undefined }}
                        >
                          {badge.name}
                        </h3>
                      </div>
                      {!isUnlocked && (
                        <div className="mt-2 w-full pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progress}%`, backgroundColor: badge.color || COLORS.secondary }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {donationCount}/{badge.threshold}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white rounded p-2 text-xs shadow-lg">
                    <p className="font-bold">{badge.name}</p>
                    <p>{badge.description}</p>
                    {!isUnlocked && <p>Progress: {donationCount}/{badge.threshold} donations</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </motion.div>
    );
  };
  // --- END Render Donation Badges Section ---

  // Render Daily Advice Section
  const renderDailyAdvice = () => { /* ... your renderDailyAdvice logic ... */ 
    console.log("Rendering Daily Advice - Role:", currentRole, "Tab:", activeTab)
    // Only show daily advice for patients and on the personal tab, for example
    if (currentRole !== "Patient" || activeTab !== "personal") {
        // return null;
    }
    return (
      <motion.div
        className="mt-10 relative col-span-1 md:col-span-2" // Make it span full width
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }} // Slight delay after fields/badges
      >
        <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.primary }}>
          Daily Advice for You
        </h2>
        <div className="relative rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden" style={{ backgroundColor: COLORS.light }}>
          <div className="absolute inset-0 sparkle-bg"></div>
          <div className="grid gap-6 md:grid-cols-3 relative z-10">
            {DAILY_ADVICE.map((advice, index) => (
              <motion.div
                key={advice.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
              >
                <Card className="p-5 md:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 h-full flex flex-col">
                  <div className="flex-shrink-0 mb-4">
                    <img
                      src={advice.image || "/placeholder.svg"}
                      alt={advice.title}
                      className="w-full h-40 md:h-48 object-cover rounded-lg"
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      onLoad={(e) => { e.target.style.display = "block"; e.target.nextSibling.style.display = "none"; }}
                    />
                    <div
                      className="hidden w-full h-40 md:h-48 items-center justify-center rounded-lg"
                      style={{ backgroundColor: COLORS.light }}
                    >
                      {advice.icon}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg md:text-xl font-semibold mb-1" style={{ color: COLORS.dark }}>
                      {advice.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">{advice.description}</p>
                  </div>
                  <button
                    className="mt-4 w-full py-2 rounded-lg text-white font-medium transition-colors text-sm"
                    style={{ backgroundColor: COLORS.primary, ':hover': {backgroundColor: COLORS.dark} }}
                  >
                    Learn More
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }


  if (!profileData || !profileData.personal) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">Loading profile content...</div>;
  }

  return (
    <>
      {/* Embedded CSS */}
      <style>
        {/* ... (your existing sparkle and hover effects CSS) ... */}
      </style>

      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkThemeLocal ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        } pb-12`}
      >
        <ProfileHeader
          firstName={firstNameForHeader}
          lastName={lastNameForHeader}
          role={currentRole}
          avatarUrl={avatarUrlLocal}
          // Pass donation related props
          donationCount={profileData?.personal?.donationCount || 0}
          unlockedBadges={profileData?.personal?.unlockedBadges || []}
          allBadges={DONATION_BADGES} // Pass all badge definitions
          isDarkTheme={isDarkThemeLocal}
          notifications={notificationsLocal}
          isEditing={isEditing}
          setIsDarkTheme={setIsDarkThemeLocal}
          setNotifications={setNotificationsLocal}
          handleAvatarUpload={handleAvatarUploadCallback}
          onSettingsClick={() => setActiveTab("settings")}
        />

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 flex flex-col lg:flex-row gap-6 relative z-10">
          <motion.aside
            className="lg:w-80 w-full lg:sticky lg:top-24 lg:self-start rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            style={{ backgroundColor: COLORS.secondary, color: COLORS.dark }}
          >
            {/* ... (TabNavigation remains the same) ... */}
             <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.dark }}>
              Navigation
            </h2>
            <p className="text-xs font-medium mb-4" style={{ color: COLORS.dark }}>
              Manage your profile sections.
            </p>
            <Separator className="mb-4" style={{ backgroundColor: COLORS.dark + "40" }} />
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="flex flex-col space-y-1"
              tabClassName={({ isActive }) =>
                `nav-tab flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${
                  COLORS.secondary
                } focus:ring-${COLORS.dark} ${isActive ? "active" : ""}`
              }
              tabIcon={getTabIcon}
              activeStyle={{ color: COLORS.dark }}
              inactiveStyle={{ color: COLORS.dark }}
            />
          </motion.aside>

          <motion.main
            className="flex-1 rounded-xl shadow-lg p-6 md:p-8 min-h-[400px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
            style={{ backgroundColor: "white", color: COLORS.dark }}
          >
            <div
              className="flex justify-between items-center mb-6 pb-4 border-b"
              style={{ borderColor: COLORS.secondary }}
            >
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: COLORS.primary }}>
                {sectionTitle}
              </h2>
              {/* ... (Edit/Save button remains the same) ... */}
               <motion.button
                className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: isEditing ? COLORS.primary : COLORS.light,
                  color: isEditing ? "white" : COLORS.dark,
                }}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isEditing ? (
                  <>
                    <SaveIcon size={16} />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <PencilIcon size={16} />
                    <span>Edit</span>
                  </>
                )}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" // Applied grid here
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Render fields for the current section */}
                {renderFieldsForSection(activeTab)}

                {/* Conditionally render Donation Badges only when 'personal' tab is active */}
                {activeTab === "personal" && renderDonationBadges()}

                {/* Conditionally render Daily Advice, e.g., for 'personal' tab for patients */}
                {currentRole === "Patient" && activeTab === "personal" && renderDailyAdvice()}
                 {currentRole !== "Patient" && activeTab === "personal" && (
                    <div className="col-span-1 md:col-span-2 mt-10">
                         {/* Placeholder or different content for non-patients on personal tab */}
                    </div>
                 )}


              </motion.div>
            </AnimatePresence>
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