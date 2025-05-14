
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, PanelLeft, Trash2, User, CheckCheck, MailOpen, MessageSquare, AlertTriangle, Activity, Pill, Stethoscope, Clipboard as ClipboardIcon , Home } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar"; 
import { Volume2, VolumeX } from 'lucide-react'; 
import { useAccessibility } from '../context/AccessibilityContext';     
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from '@/context/NotificationContext'; // Assurez-vous que le chemin est correct
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';

// Helper function to format time ago
const timeAgo = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn("Invalid date passed to timeAgo:", dateString);
        return "Invalid date";
    }
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    if (seconds < 5) return "just now";
    return Math.floor(seconds) + " seconds ago";
};

// Helper to get notification icon, title, and color based on type
const getNotificationPresentation = (type) => {
    switch (type) {
        case 'doctor_assignment':
            return { Icon: User, title: '🧑‍⚕️ Doctor Assigned', color: 'text-blue-600', iconBg: 'bg-blue-100' };
        case 'patient_status_update':
            return { Icon: Activity, title: '🔄 Patient Status Update', color: 'text-amber-600', iconBg: 'bg-amber-100' };
        case 'new_emergency_case':
        case 'unassigned_emergency_case': // Regrouper car l'icône et la couleur pourraient être similaires pour de nouveaux cas
            return { Icon: AlertTriangle, title: '🚨 New Emergency Case', color: 'text-red-600', iconBg: 'bg-red-100' };
        case 'patient_assigned_to_doctor': // For nurses
            return { Icon: User, title: 'ℹ️ Patient Assigned to Dr.', color: 'text-sky-600', iconBg: 'bg-sky-100' };
        // 'unassigned_emergency_case' a été fusionné avec 'new_emergency_case' ci-dessus. 
        // Si vous voulez une présentation distincte, remettez-la ici :
        // case 'unassigned_emergency_case':
        //      return { Icon: MessageSquare, title: '⚠️ Patient Awaiting Doctor', color: 'text-orange-600', iconBg: 'bg-orange-100' };
        case 'ambulance_alert':
            return { Icon: Bell, title: '🚑 Ambulance Alert', color: 'text-fuchsia-600', iconBg: 'bg-fuchsia-100' };
        case 'availability_update': 
            return { Icon: CheckCheck, title: '✅ Availability Updated', color: 'text-green-600', iconBg: 'bg-green-100' };
        case 'admin_log': 
            return { Icon: ClipboardIcon, title: '📋 Admin Log', color: 'text-gray-600', iconBg: 'bg-gray-100' };
        case 'patient_file_created':
            return { Icon: Pill, title: '📄 New Document Added', color: 'text-emerald-600', iconBg: 'bg-emerald-100' };
        case 'patient_file_updated':
            return { Icon: Stethoscope, title: '📝 Document Updated', color: 'text-violet-600', iconBg: 'bg-violet-100' };
        case 'generic': 
        default:
            return { Icon: Bell, title: '🔔 Notification', color: 'text-slate-600', iconBg: 'bg-slate-100' };
    }
};


const DashboardHeader = () => {
    const { toggleSidebar } = useSidebar(); // Assurez-vous que useSidebar est bien défini et exporté par son provider
    const {
        notifications,
        unreadCount,
        isLoading,
        markOneAsRead,
        markAllAsRead, // Doit correspondre au nom exposé par NotificationContext
        clearAllNotifications,
        fetchNotifications
    } = useNotifications();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
     const { isTTSActive, setIsTTSActive } = useAccessibility(); 

    useEffect(() => {
        // Il est bon de fetch les notifications après que l'utilisateur soit potentiellement chargé
        // pour s'assurer que les appels API faits par fetchNotifications ont le contexte utilisateur si nécessaire (ex: token)
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from sessionStorage for header:", e);
            }
        }
        fetchNotifications(); // Appeler après avoir potentiellement défini currentUser
    }, [fetchNotifications]); // fetchNotifications est memoized par useCallback, donc stable en tant que dépendance

    const handleOpenChange = (open) => {
        if (open) {
            // Optionnel: recharger les notifications à chaque ouverture du dropdown
            // fetchNotifications(); 
        }
    };

    const handleNotificationClick = (notification) => {
        // Marquer comme lue seulement si elle n'est pas déjà lue
        if (!notification.isRead) {
            markOneAsRead(notification._id); // Appeler la fonction du contexte
        }

        // Logique de navigation
        if (notification.relatedEntityId && notification.relatedEntityType) {
            switch (notification.relatedEntityType) {
                case 'EmergencyPatient':
                    navigate(`/emergency-status`, { state: { patientId: notification.relatedEntityId } });
                    break;
                case 'Ambulance':
                    navigate('/ambulance'); // Exemple, adaptez selon vos routes
                    break;
                // Ajoutez d'autres cas pour d'autres relatedEntityType si nécessaire
                default:
                    console.log("Clicked notification, no specific navigation for type:", notification.relatedEntityType);
            }
        } else {
            console.log("Clicked notification with no specific entity to navigate to:", notification);
        }
    };

    return (
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 w-full border-b dark:border-slate-700">
            <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Left Side: Search & Sidebar Toggle */}
                <div className="flex-1 flex items-center">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4 text-foreground hover:bg-accent">
                                    <PanelLeft className="h-5 w-5" />
                                    <span className="sr-only">Toggle Sidebar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Toggle Sidebar</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="max-w-md w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients, records..."
                            className="pl-10 h-9 rounded-md bg-muted/50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:border-primary"
                        />
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                     {/* Nouveau Bouton TTS */}
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-foreground hover:bg-accent"
                                    onClick={() => setIsTTSActive(!isTTSActive)} // <-- Toggle TTS
                                    aria-label={isTTSActive ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'} // <-- Label ARIA
                                >
                                    {isTTSActive ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />} {/* Icône dynamique */}
                                    <span className="sr-only">{isTTSActive ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isTTSActive ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'} {/* Texte du Tooltip */}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Placeholder pour le sélecteur de langue - vous devrez implémenter la logique */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                                    {/* <Globe className="h-5 w-5" />  Exemple avec Lucide Icon */}
                                    <span className="fi fi-us fis"></span> {/* Si vous utilisez flag-icons */}
                                    <span className="sr-only">Select Language</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Change Language</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu onOpenChange={handleOpenChange}>
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-accent">
                                            <Bell className="h-5 w-5" />
                                            {unreadCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center rounded-full text-xs"
                                                >
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </Badge>
                                            )}
                                            <span className="sr-only">Notifications</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Notifications</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => navigate("/home")}
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full"
                                >
                                    <Home className="h-5 w-5 text-blue-600 hover:text-blue-700" />
                                    <span className="sr-only">Home</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Home</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                        <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 shadow-xl bg-card border dark:border-slate-700">
                            <DropdownMenuLabel className="flex justify-between items-center px-3 py-2.5 border-b dark:border-slate-700">
                                <span className="font-semibold text-sm text-popover-foreground">
                                    Notifications ({unreadCount > 0 ? `${unreadCount} unread` : 'No unread'})
                                </span>
                                {notifications.length > 0 && unreadCount > 0 && (
                                     <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            markAllAsRead(); // Appel de la fonction du contexte
                                        }}
                                     >
                                         <CheckCheck className="h-3.5 w-3.5 mr-1"/>Mark all as read
                                     </Button>
                                )}
                            </DropdownMenuLabel>

                             <ScrollArea className="h-[300px] sm:h-[350px]">
                                {(isLoading && notifications.length === 0) ? (
                                    <div className="p-3 space-y-2.5">
                                        {[...Array(3)].map((_, i) => ( // Moins de skeletons par défaut
                                            <div key={i} className="flex items-center space-x-2.5 p-1.5">
                                                <Skeleton className="h-7 w-7 rounded-full bg-muted" />
                                                <div className="space-y-1 flex-1">
                                                    <Skeleton className="h-2.5 w-3/4 bg-muted" />
                                                    <Skeleton className="h-2 w-1/2 bg-muted" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
                                        <MailOpen className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 dark:text-slate-500 mb-3"/>
                                        No notifications at the moment.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border dark:divide-slate-700">
                                    {notifications.map((notif) => {
                                        const { Icon: NotifIcon, title: notifTitle, color: notifColor, iconBg } = getNotificationPresentation(notif.type);
                                        return (
                                            <DropdownMenuItem
                                                key={notif._id || `${notif.message}-${notif.createdAt}`} // Clé plus robuste
                                                className={`flex items-start p-2.5 gap-2.5 whitespace-normal cursor-pointer 
                                                            focus:bg-accent dark:focus:bg-slate-700/80
                                                            data-[disabled]:opacity-50 data-[disabled]:pointer-events-none 
                                                            transition-colors duration-150 ease-in-out 
                                                            ${!notif.isRead 
                                                                ? 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 focus:bg-blue-100 dark:focus:bg-blue-900/50' 
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:bg-slate-50 dark:focus:bg-slate-800/50'
                                                            }`}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${iconBg} ${notif.isRead ? 'opacity-70' : ''} mt-0.5`}>
                                                    <NotifIcon className={`h-3.5 w-3.5 ${notifColor}`} />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-start mb-0">
                                                        <p className={`text-xs font-semibold leading-snug ${!notif.isRead ? 'text-primary dark:text-blue-400' : 'text-foreground'}`}>
                                                            {notifTitle}
                                                        </p>
                                                        {!notif.isRead && (
                                                            <span className="h-1.5 w-1.5 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0 ml-2 mt-1" aria-label="Unread"></span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs ${notif.isRead ? 'text-muted-foreground' : 'text-foreground/90 dark:text-slate-300'} leading-normal line-clamp-2`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/80 dark:text-slate-500 mt-0.5 text-right">
                                                        {timeAgo(notif.createdAt)}
                                                    </p>
                                                </div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                    </div>
                                )}
                             </ScrollArea>
                            {notifications.length > 0 && (
                                 <div className="px-3 py-1.5 border-t dark:border-slate-700 text-center">
                                     <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            clearAllNotifications();
                                        }}
                                     >
                                         <Trash2 className="h-3 w-3 mr-1"/> Clear all notifications
                                     </Button>
                                 </div>
                             )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                   <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="p-0 h-8 w-8 rounded-full text-foreground hover:bg-accent">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage 
                                            src={currentUser?.profileImage ? `http://localhost:8089${currentUser.profileImage.startsWith('/') ? currentUser.profileImage : '/' + currentUser.profileImage}` : "https://github.com/shadcn.png"} 
                                            alt={currentUser?.username || "User"}
                                            onError={(e) => { e.target.src = "https://github.com/shadcn.png"; }}
                                        />
                                        <AvatarFallback className="bg-muted"> {/* Fallback avec fond neutre */}
                                            {currentUser?.username ? currentUser.username.substring(0,2).toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">User Profile</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="font-medium">
                                    {currentUser?.username || "User"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {currentUser?.role || "Role"}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;