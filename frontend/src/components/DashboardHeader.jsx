// src/components/DashboardHeader.jsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, PanelLeft, Trash2 } from "lucide-react"; // Import Trash2
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { Badge } from "@/components/ui/badge"; // Import Badge
import { useNotifications } from '@/context/NotificationContext'; // Import useNotifications
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

// Helper function to format time ago
const timeAgo = (date) => {
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
    return Math.floor(seconds) + " seconds ago";
};


const DashboardHeader = () => {
    const { toggleSidebar } = useSidebar();
    const { notifications, unreadCount, markAllAsRead, clearAllNotifications } = useNotifications(); // Get state/functions from context

    const handleOpenChange = (open) => {
        if (open && unreadCount > 0) {
            markAllAsRead(); // Mark as read when dropdown opens
        }
    };

    return (
        <div className="sticky top-0 bg-background/95 z-40 w-full border-b">
            <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Left Side: Search */}
                <div className="flex-1 flex">
                     {/* Sidebar Toggle Button - Moved to the left */}
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
                                    <PanelLeft className="h-5 w-5" /> {/* Slightly larger icon */}
                                    <span className="sr-only">Toggle Sidebar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Toggle Sidebar
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {/* Search Input */}
                    <div className="max-w-md w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients, records..." // Updated placeholder
                            className="pl-10 h-9 rounded-md" // Adjusted size
                        />
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center space-x-4">
                    {/* Language Icon (Example) */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    {/* Replace with your actual language icon/logic */}
                                    <span className="fi fi-us fis"></span>
                                    <span className="sr-only">Select Language</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Change Language</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* --- Notification Dropdown --- */}
                    <DropdownMenu onOpenChange={handleOpenChange}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative">
                                            <Bell className="h-5 w-5" /> {/* Slightly larger icon */}
                                            {unreadCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center rounded-full text-xs" // Badge styling
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

                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel className="flex justify-between items-center">
                                <span>Notifications</span>
                                {notifications.length > 0 && (
                                     <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-red-500 hover:bg-red-50" onClick={clearAllNotifications}>
                                         <Trash2 className="h-3 w-3 mr-1"/> Clear All
                                     </Button>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                             <ScrollArea className="h-[300px]"> {/* Add ScrollArea */}
                                {notifications.length === 0 ? (
                                    <DropdownMenuItem disabled>
                                        No new notifications
                                    </DropdownMenuItem>
                                ) : (
                                    notifications.map((notif) => (
                                        <DropdownMenuItem key={notif.id} className="flex flex-col items-start whitespace-normal">
                                            <p className="text-sm font-medium mb-1">{notif.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Patient: {notif.patientName || 'N/A'} - {timeAgo(notif.receivedAt)}
                                            </p>
                                        </DropdownMenuItem>
                                    ))
                                )}
                             </ScrollArea>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* --- End Notification Dropdown --- */}

                    {/* User Avatar/Profile */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">User Profile</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="font-medium">Bini Jets</div>
                                <p className="text-xs text-muted-foreground">Available</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;