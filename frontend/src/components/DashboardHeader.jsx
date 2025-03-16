// src/components/DashboardHeader.jsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, PanelLeft } from "lucide-react"; // Importez PanelLeft pour le toggle sidebar
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar"; // Si vous utilisez SidebarTrigger
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components

const DashboardHeader = () => {
    const { toggleSidebar } = useSidebar(); // Si vous utilisez SidebarTrigger

    return (
        <div className="sticky top-0 bg-background/95 z-40 w-full border-b">
            <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Partie Gauche : Recherche */}
                <div className="flex-1 flex">
                    <div className="max-w-md w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients..."
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Partie Droite : Profil utilisateur */}
                <div className="flex items-center space-x-4">
                    {/* Icône de Langue (exemple - en utilisant Tooltip pour l'exemple) */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <span className="fi fi-us fis"></span> {/* Remplacez par votre icône de langue si nécessaire */}
                                    <span className="sr-only">Select Language</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Change Language
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>


                    {/* Toggle Sidebar (si vous utilisez SidebarTrigger) - en utilisant Tooltip pour l'exemple */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={toggleSidebar}> {/* Utilisez toggleSidebar pour basculer le sidebar */}
                                    <PanelLeft className="h-4 w-4" />
                                    <span className="sr-only">Toggle Sidebar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Toggle Sidebar
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>


                    {/* Icône de Notifications (exemple - en utilisant Tooltip pour l'exemple) */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Bell className="h-4 w-4" />
                                    <span className="sr-only">Notifications</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Notifications
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>


                    {/* Avatar utilisateur - en utilisant Tooltip pour l'exemple */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> {/* Remplacez par l'URL de l'avatar de l'utilisateur */}
                                        <AvatarFallback>CN</AvatarFallback> {/* Initiales de l'utilisateur ou fallback */}
                                    </Avatar>
                                    <span className="sr-only">User Profile</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="font-medium">Bini Jets</div> {/* Remplacez par le nom de l'utilisateur */}
                                <p className="text-xs text-muted-foreground">Available</p> {/* Remplacez par le statut de l'utilisateur */}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;