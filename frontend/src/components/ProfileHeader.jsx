"use client"

import { motion } from "framer-motion"
import { Bell, Moon, Sun, Upload, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import PropTypes from "prop-types"

// Color palette
const COLORS = {
  primary: "#547792",
  secondary: "#547792",
  dark: "#547792",
  light: "#ECEFCA",
}

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
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const avatarVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.95 },
  }

  const notificationCount = Number(notifications) || 0

  return (
    <motion.div
      className="w-full rounded-b-2xl md:rounded-b-3xl pt-12 overflow-hidden shadow-xl"
      style={{ backgroundColor: COLORS.dark }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* La partie supérieure de la bannière */}
      <div className="w-full h-24 md:h-32 relative" style={{ backgroundColor: COLORS.dark }}>
        {/* Gradient overlay for visual interest */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}40 0%, ${COLORS.dark} 100%)`,
          }}
        ></div>
      </div>

      {/* Conteneur principal pour l'avatar, le nom, le rôle et les icônes d'action */}
      <div
        className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 pb-6 md:pb-8"
        style={{ backgroundColor: COLORS.dark }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4">
          {/* Partie gauche : Avatar et Nom/Rôle */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="relative"
                    variants={avatarVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Avatar
                      className="h-28 w-28 md:h-32 md:w-32 border-4 shadow-xl"
                      style={{ backgroundColor: COLORS.primary, borderColor: COLORS.light }}
                    >
                      <AvatarImage
                        src={avatarUrl || "/placeholder.svg"}
                        alt={`${firstName} ${lastName}`}
                        className="object-cover"
                      />
                      <AvatarFallback
                        className="text-2xl md:text-3xl"
                        style={{ backgroundColor: COLORS.primary, color: COLORS.light }}
                      >
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label
                        className="absolute bottom-1 right-1 rounded-full p-1.5 cursor-pointer shadow-lg border hover:bg-gray-100"
                        style={{
                          backgroundColor: COLORS.light,
                          borderColor: COLORS.secondary,
                        }}
                      >
                        <Upload size={16} style={{ color: COLORS.primary }} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                      </label>
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{isEditing ? "Changer la photo" : "Photo de profil"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="text-center md:text-left md:mb-1">
              <h1 className="text-2xl md:text-3xl font-bold drop-shadow-sm" style={{ color: COLORS.light }}>
                {firstName} {lastName}
              </h1>
              <div className="flex items-center justify-center md:justify-start mt-1">
                <Badge
                  variant="outline"
                  className="backdrop-blur-sm px-3 py-1 text-xs md:text-sm"
                  style={{
                    backgroundColor: `${COLORS.primary}80`,
                    color: COLORS.light,
                    borderColor: `${COLORS.light}40`,
                  }}
                >
                  {role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Partie droite : Icônes d'action */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0 md:mb-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative hover:bg-opacity-20 rounded-full w-9 h-9",
                      notificationCount > 0 && "animate-pulse",
                    )}
                    style={{
                      color: `${COLORS.light}80`,
                    }}
                    onClick={() => setNotifications(0)}
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white/50"></span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {notificationCount > 0 ? `${notificationCount} notification(s)` : "Aucune notification"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-opacity-20 rounded-full w-9 h-9"
                    style={{
                      color: `${COLORS.light}80`,
                    }}
                    onClick={() => setIsDarkTheme(!isDarkTheme)}
                    aria-label="Changer de thème"
                  >
                    {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isDarkTheme ? "Thème clair" : "Thème sombre"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {onSettingsClick && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-opacity-20 rounded-full w-9 h-9"
                      style={{
                        color: `${COLORS.light}80`,
                      }}
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
  )
}

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
}

ProfileHeader.defaultProps = {
  avatarUrl: null,
  notifications: 0,
}

export default ProfileHeader
