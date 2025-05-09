// src/components/ProfileHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Bell, Moon, Sun, Upload, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Assurez-vous qu'il est importé si vous l'utilisez
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ProfileHeader = ({
  firstName,
  lastName,
  role,
  avatarUrl,
  isDarkTheme,
  notifications,
  isEditing,
  setIsDarkTheme,
  setNotifications,
  handleAvatarUpload,
  onSettingsClick,
}) => {
  const getInitials = () => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const avatarVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' },
    tap: { scale: 0.95 }
  };

  const notificationCount = Number(notifications) || 0;

  return (
    <motion.div
      className="w-full rounded-b-2xl md:rounded-b-3xl overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 shadow-xl" // Un exemple de dégradé
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* La partie supérieure de la bannière - peut être vide ou avec une image de fond subtile */}
      {/* J'ai réduit la hauteur ici pour qu'elle soit moins proéminente */}
      <div className="w-full h-24 md:h-32 relative">
        {/* Si vous voulez une image de fond pour cette partie : */}
        {/* <img src="/path-to-your-banner-image.jpg" alt="Profile Banner" className="absolute inset-0 w-full h-full object-cover opacity-20" /> */}
        {/* <div className="absolute inset-0 bg-black/10"></div> */} {/* Overlay optionnel */}
      </div>

      {/* Conteneur principal pour l'avatar, le nom, le rôle ET les icônes d'action */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 pb-6 md:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
          {/* Partie gauche : Avatar et Nom/Rôle */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="relative" // mb-4 md:mb-0 supprimé pour aligner avec le texte
                    variants={avatarVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-white dark:border-gray-800 shadow-xl">
                      <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} className="object-cover" />
                      <AvatarFallback className="bg-primary/80 text-white text-2xl md:text-3xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 rounded-full p-1.5 cursor-pointer shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Upload size={16} className="text-primary dark:text-gray-300" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{isEditing ? 'Changer la photo' : 'Photo de profil'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="text-center md:text-left md:mb-1"> {/* mb-1 pour aligner avec les icônes */}
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">
                {firstName} {lastName}
              </h1>
              <div className="flex items-center justify-center md:justify-start mt-1">
                <Badge variant="outline" className="bg-white/25 backdrop-blur-sm text-white border-white/40 px-3 py-1 text-xs md:text-sm">
                  {role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Partie droite : Icônes d'action - maintenant alignées avec le nom/rôle sur desktop */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0 md:mb-1"> {/* mb-1 pour aligner avec le texte */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative text-white/80 hover:text-white hover:bg-white/20 rounded-full w-9 h-9",
                      notificationCount > 0 && "animate-pulse"
                    )}
                    onClick={() => setNotifications(0)}
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white/50"></span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{notificationCount > 0 ? `${notificationCount} notification(s)` : 'Aucune notification'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-9 h-9"
                    onClick={() => setIsDarkTheme(!isDarkTheme)}
                    aria-label="Changer de thème"
                  >
                    {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isDarkTheme ? 'Thème clair' : 'Thème sombre'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {onSettingsClick && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-9 h-9"
                      onClick={onSettingsClick}
                      aria-label="Paramètres"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Paramètres</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

ProfileHeader.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  isDarkTheme: PropTypes.bool.isRequired,
  notifications: PropTypes.number.isRequired,
  isEditing: PropTypes.bool.isRequired,
  setIsDarkTheme: PropTypes.func.isRequired,
  setNotifications: PropTypes.func.isRequired,
  handleAvatarUpload: PropTypes.func.isRequired,
  onSettingsClick: PropTypes.func,
};

ProfileHeader.defaultProps = {
  avatarUrl: null,
  notifications: 0,
};

export default ProfileHeader;