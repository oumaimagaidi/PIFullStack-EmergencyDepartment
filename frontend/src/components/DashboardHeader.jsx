// src/components/DashboardHeader.jsx
import React, { useEffect, useState } from 'react'; // Ajout de useState pour l'état local de l'utilisateur
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, PanelLeft, Trash2, User, CheckCheck, MailOpen, MessageSquare, AlertTriangle, Activity, Pill, Stethoscope, Clipboard as ClipboardIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
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
import { useNotifications } from '@/context/NotificationContext';
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
            return { Icon: AlertTriangle, title: '🚨 New Emergency Case', color: 'text-red-600', iconBg: 'bg-red-100' };
        case 'patient_assigned_to_doctor': // Pour les infirmières
            return { Icon: User, title: 'ℹ️ Patient Assigned to Dr.', color: 'text-sky-600', iconBg: 'bg-sky-100' };
        case 'unassigned_emergency_case':
             return { Icon: MessageSquare, title: '⚠️ Patient Awaiting Doctor', color: 'text-orange-600', iconBg: 'bg-orange-100' };
        case 'ambulance_alert':
            return { Icon: Bell, title: '🚑 Ambulance Alert', color: 'text-fuchsia-600', iconBg: 'bg-fuchsia-100' };
        case 'availability_update': // Notif pour le médecin sur sa propre dispo
            return { Icon: CheckCheck, title: '✅ Availability Updated', color: 'text-green-600', iconBg: 'bg-green-100' };
        case 'admin_log': // Pour les logs admin génériques
            return { Icon: ClipboardIcon, title: '📋 Admin Log', color: 'text-gray-600', iconBg: 'bg-gray-100' };
        case 'patient_file_created': // Type générique, ajustez le titre si vous avez plus de contexte
            return { Icon: Pill, title: '📄 New Document Added', color: 'text-emerald-600', iconBg: 'bg-emerald-100' };
        case 'patient_file_updated':
            return { Icon: Stethoscope, title: '📝 Document Updated', color: 'text-violet-600', iconBg: 'bg-violet-100' };
        case 'generic': // Fallback
        default:
            return { Icon: Bell, title: '🔔 Notification', color: 'text-slate-600', iconBg: 'bg-slate-100' };
    }
};


const DashboardHeader = () => {
    const { toggleSidebar } = useSidebar();
    const {
        notifications,
        unreadCount,
        isLoading,
        markOneAsRead,
        markAllAsRead,
        clearAllNotifications,
        fetchNotifications
    } = useNotifications();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchNotifications();
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from sessionStorage for header:", e);
            }
        }
    }, [fetchNotifications]);

    const handleOpenChange = (open) => {
        if (open) {
            // fetchNotifications(); // Optionnel: recharger à chaque ouverture
        }
    };
    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markOneAsRead(notification._id);
        }
        if (notification.relatedEntityId && notification.relatedEntityType) {
            switch (notification.relatedEntityType) {
                case 'EmergencyPatient':
                    navigate(`/emergency-status`, { state: { patientId: notification.relatedEntityId } });
                    break;
                case 'Ambulance':
                    navigate('/ambulance');
                    break;
                default:
                    console.log("Clicked notification, no specific navigation for type:", notification.relatedEntityType);
            }
        } else {
            console.log("Clicked notification with no specific entity to navigate to:", notification);
        }
    };

    return (
        <div className="sticky top-0 bg-background/95 z-40 w-full border-b">
            <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Left Side: Search & Sidebar Toggle */}
                <div className="flex-1 flex items-center">
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
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
                            className="pl-10 h-9 rounded-md"
                        />
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center space-x-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    {/* Remplacez par votre icône de langue ou logique */}
                                    <span className="fi fi-us fis"></span>
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
                                        <Button variant="ghost" size="icon" className="relative">
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

                        <DropdownMenuContent align="end" className="w-96 p-0 shadow-xl">
                            <DropdownMenuLabel className="flex justify-between items-center px-3 py-2.5 border-b">
                                <span className="font-semibold text-sm">Notifications ({unreadCount > 0 ? `${unreadCount} non lues` : 'Aucune non lue'})</span>
                                {notifications.length > 0 && unreadCount > 0 && (
                                     <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700" onClick={(e) => {e.stopPropagation(); markAllAsRead();}}>
                                         <CheckCheck className="h-3.5 w-3.5 mr-1"/>Marquer tout comme lu
                                     </Button>
                                )}
                            </DropdownMenuLabel>

                             <ScrollArea className="h-[350px]">
                                {(isLoading && notifications.length === 0) ? (
                                    <div className="p-3 space-y-2.5">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-2.5 p-1.5">
                                                <Skeleton className="h-7 w-7 rounded-full" />
                                                <div className="space-y-1 flex-1">
                                                    <Skeleton className="h-2.5 w-3/4" />
                                                    <Skeleton className="h-2 w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
                                        <MailOpen className="h-12 w-12 text-slate-300 mb-3"/>
                                        Aucune notification pour le moment.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                    {notifications.map((notif) => {
                                        const { Icon: NotifIcon, title: notifTitle, color: notifColor, iconBg } = getNotificationPresentation(notif.type);
                                        return (
                                            <DropdownMenuItem
                                                key={notif._id}
                                                className={`flex items-start p-2.5 gap-2.5 whitespace-normal cursor-pointer focus:bg-accent data-[disabled]:opacity-50 data-[disabled]:pointer-events-none transition-colors duration-150 ease-in-out 
                                                            ${!notif.isRead ? 'bg-blue-50 hover:bg-blue-100 focus:bg-blue-100' : 'hover:bg-slate-50 focus:bg-slate-50'}`}
                                                onClick={() => handleNotificationClick(notif)}
                                            >
                                                <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${iconBg} ${notif.isRead ? 'opacity-70' : ''} mt-0.5`}>
                                                    <NotifIcon className={`h-3.5 w-3.5 ${notifColor}`} />
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex justify-between items-start mb-0">
                                                        <p className={`text-xs font-semibold leading-snug ${!notif.isRead ? 'text-primary' : 'text-foreground'}`}>
                                                            {notifTitle}
                                                        </p>
                                                        {!notif.isRead && (
                                                            <span className="h-1.5 w-1.5 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" aria-label="Unread"></span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs ${notif.isRead ? 'text-muted-foreground' : 'text-foreground/90'} leading-normal line-clamp-2`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/80 mt-0.5 text-right">
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
                                 <div className="px-3 py-1.5 border-t text-center">
                                     <Button variant="ghost" size="sm" className="w-full text-xs text-red-600 hover:bg-red-50 hover:text-red-700" onClick={(e) => { e.stopPropagation(); clearAllNotifications();}}>
                                         <Trash2 className="h-3 w-3 mr-1"/> Effacer toutes les notifications
                                     </Button>
                                 </div>
                             )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                   <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage 
                                            src={currentUser?.profileImage ? `http://localhost:8089${currentUser.profileImage.startsWith('/') ? currentUser.profileImage : '/' + currentUser.profileImage}` : "https://github.com/shadcn.png"} 
                                            alt={currentUser?.username || "User"}
                                            onError={(e) => { e.target.src = "https://github.com/shadcn.png"; }}
                                        />
                                        <AvatarFallback>
                                            {currentUser?.username ? currentUser.username.substring(0,2).toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">User Profile</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="font-medium">
                                    {currentUser?.username || "Utilisateur"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {currentUser?.role || "Rôle"}
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