// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Import Card components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"; 
// Import Label
import { Label } from "@/components/ui/label";
// Import Switch
import { Switch } from "@/components/ui/switch";
// Import Select components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
// Import Button <-- Make sure this is imported!
import { Button } from "@/components/ui/button"; 

// Import Icons
import { Settings as SettingsIcon, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';

// Import Accessibility Hook and Alert component
import { useAccessibility } from '../context/AccessibilityContext'; 
import { Alert, AlertDescription } from "@/components/ui/alert";


const Settings = () => {
    // Use states from the global accessibility context
    const { isTTSActive, setIsTTSActive, ttsLanguage, setTtsLanguage } = useAccessibility();

    // Local state for profile settings (used for fetching and saving)
    // We need this to potentially hold other settings sections besides accessibility
    const [profileSettings, setProfileSettings] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // List of available languages for the select dropdown
    const availableLanguages = [
        { value: 'fr-FR', label: 'Français' },
        { value: 'en-US', label: 'English (US)' },
        { value: 'en-GB', label: 'English (UK)' },
        { value: 'es-ES', label: 'Español' },
        // Add other languages if needed and if voices are available in browser/system
    ];


    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            setError(null);
            console.log("Settings: Attempting to fetch profile settings...");
            try {
                const token = Cookies.get("token");
                if (!token) { 
                    console.log("Settings: No token found, cannot fetch profile settings.");
                    setError("You need to be logged in to save profile settings."); 
                    setLoading(false);
                    return; 
                }
                const response = await axios.get('http://localhost:8089/api/profile', { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log("Settings: Profile fetched successfully", response.data);
                const fetchedSettings = response.data.settings || {};
                const fetchedAccessibilitySettings = fetchedSettings.accessibility || {};

                // Synchronize global context states with fetched values (if they exist)
                // Use ?? to keep current context value (from localStorage) if fetched value is null or undefined
                // This ensures the UI reflects the saved setting if available, otherwise falls back to local pref
                const initialTTSActive = fetchedAccessibilitySettings.ttsEnabled ?? isTTSActive;
                const initialTTSLanguage = fetchedAccessibilitySettings.ttsLanguage ?? ttsLanguage;

                setIsTTSActive(initialTTSActive); 
                setTtsLanguage(initialTTSLanguage); 

                // Set the local state for the form, ensuring accessibility is initialized
                setProfileSettings({
                    ...fetchedSettings,
                    accessibility: {
                        ttsEnabled: initialTTSActive,
                        ttsLanguage: initialTTSLanguage,
                         ...(fetchedAccessibilitySettings.ttsVoice && { ttsVoice: fetchedAccessibilitySettings.ttsVoice }), // Include other accessibility if they exist
                         ...(fetchedAccessibilitySettings.ttsRate && { ttsRate: fetchedAccessibilitySettings.ttsRate }),
                        // Add other specific accessibility fields here if your backend stores them
                    }
                }); 
                console.log("Settings: Profile settings state initialized", { 
                    initialTTSActive, initialTTSLanguage, localProfileSettings: { accessibility: { ttsEnabled: initialTTSActive, ttsLanguage: initialTTSLanguage } }
                 });


            } catch (err) {
                console.error("Settings: Error fetching settings:", err);
                setError("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        // Fetch settings only if the user is potentially logged in (check for token presence)
        const token = Cookies.get("token");
        if (token) { 
             fetchSettings();
        } else {
            // If no token, cannot fetch/save profile settings. 
            // The global states (isTTSActive, ttsLanguage) are already initialized via localStorage
            // by the AccessibilityProvider, so they will control the UI in the local section.
            setLoading(false);
            setError("You need to be logged in to save profile settings. Local preferences are still active."); 
        }

    }, []); // Empty dependencies: fetch on mount


    // Handler for the TTS switch
    // Updates both the global state (and localStorage) and the local form state for saving.
    const handleTTSwitchChange = (checked) => {
         setIsTTSActive(checked); // Update global state (and localStorage via context)
         setProfileSettings(prev => {
             const newState = { // Use a function to ensure we get the latest 'prev' state
                 ...prev,
                 accessibility: {
                     ...(prev?.accessibility || {}), // Preserve other accessibility settings if they exist
                     ttsEnabled: checked
                 }
             };
             console.log("Settings: handleTTSwitchChange - New local state:", newState);
             return newState;
         });
     };

     // Handler for the language selection
     // Updates both the global state (and localStorage) and the local form state for saving.
     const handleLanguageSelectChange = (value) => {
         setTtsLanguage(value); // Update global state (and localStorage via context)
         setProfileSettings(prev => {
             const newState = { // Use a function to ensure we get the latest 'prev' state
                  ...prev,
                  accessibility: {
                      ...(prev?.accessibility || {}), // Preserve other accessibility settings if they exist
                      ttsLanguage: value
                  }
              };
              console.log("Settings: handleLanguageSelectChange - New local state:", newState);
              return newState;
         });
     };


    const handleSaveSettings = async () => {
        console.log("Settings: Save button clicked.");
         // Check if the user is logged in before attempting backend save
         const token = Cookies.get("token");
         if (!token) {
             console.log("Settings: No token found during save attempt.");
             setError("You need to be logged in to save profile settings.");
             toast.error("Save failed. Please log in.");
             return;
         }

        setIsSaving(true);
        setError(null); // Clear previous errors
        console.log("Settings: Starting save process...");

        try {
            // Construct the data structure expected by your PUT /api/profile route
            // It expects sections like 'personal', 'settings', 'medical', etc.
            // We only need to send the 'settings' section here.
            
            // Use the current values from the local profileSettings state, which is synced with UI changes
            // Provide defaults in case parts of profileSettings are still null/undefined
            const dataToSave = {
                 settings: {
                     accessibility: {
                         ttsEnabled: profileSettings?.accessibility?.ttsEnabled ?? false, // Use local state value
                         ttsLanguage: profileSettings?.accessibility?.ttsLanguage ?? 'fr-FR', // Use local state value
                         // Include other accessibility parameters from local state if they exist
                          ...(profileSettings?.accessibility?.ttsVoice && { ttsVoice: profileSettings.accessibility.ttsVoice }),
                          ...(profileSettings?.accessibility?.ttsRate && { ttsRate: profileSettings.accessibility.ttsRate }),
                         // Add other specific accessibility fields here if your backend stores them
                     },
                     // If you have other settings sections in profileSettings state,
                     // include them here to avoid losing them if the backend expects a full settings object.
                     // This depends on how your PUT /api/profile backend route is implemented.
                     // If it only updates provided fields, this might be enough.
                     // If it replaces the entire 'settings' object, you'd need to load ALL settings first.
                     // Assuming it updates provided fields within 'settings':
                     ...(profileSettings?.notifications ? { notifications: profileSettings.notifications } : {})
                     // Add other top-level settings sections here like profileSettings.account, etc.
                 }
                 // Note: The backend PUT /api/profile expects top-level sections like 'personal', 'settings', etc.
                 // If you need to update other sections (like phone number in 'personal') from this Settings page,
                 // you would add them to dataToSave here, e.g., personal: { phoneNumber: ... }
                 // However, based on the design, this page seems focused just on settings.
            };

            console.log("Settings: Data being sent to backend:", JSON.stringify(dataToSave, null, 2));

             // Your PUT /api/profile route needs the user ID, which is taken from the token.
             const response = await axios.put('http://localhost:8089/api/profile', dataToSave, {
                 headers: { Authorization: `Bearer ${token}` }
             });

            console.log("Settings: Save successful!", response.data);
            toast.success("Settings saved successfully!");
             // Re-sync local state with the response data if necessary
             // setProfileSettings(response.data.settings || {}); // If backend sends back the updated settings structure

        } catch (err) {
            console.error("Settings: Error saving settings:", err);
            setError("Failed to save settings.");
            toast.error(err.response?.data?.message || "Failed to save settings. Please try again."); 
        } finally {
            setIsSaving(false);
            console.log("Settings: Save process finished.");
        }
    };

    // --- Render different UI based on login status ---
    // If the user is not logged in, show a limited UI indicating settings are local only
    if (!Cookies.get("token")) { 
         return (
             <div className="p-6 max-w-4xl mx-auto">
                 <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You need to be logged in to save settings to your profile. Accessibility preferences are currently saved locally in your browser.
                    </AlertDescription>
                </Alert>
                 {/* Render the accessibility controls using ONLY global context state */}
                 {/* These controls will update the global context and localStorage */}
                 <Card className="shadow-lg mt-6 dark:bg-slate-800">
                     <CardHeader><CardTitle className="text-slate-800 dark:text-slate-100">Accessibility Settings (Local)</CardTitle></CardHeader> 
                     <CardContent className="space-y-4 p-6">
                         <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-slate-900">
                                <div className="space-y-0.5">
                                    <Label htmlFor="tts-switch-local" className="text-base text-gray-800 dark:text-gray-100"> 
                                        Enable Text-to-Speech on Hover/Focus
                                    </Label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enables vocal feedback when hovering over or focusing interactive elements.
                                    </p>
                                </div>
                                <Switch
                                    id="tts-switch-local" 
                                    checked={isTTSActive} // Uses global state directly
                                    onCheckedChange={setIsTTSActive} // Updates global state directly
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-slate-900">
                                 <Label htmlFor="tts-language-local" className="text-base text-gray-800 dark:text-gray-100"> 
                                     Language for Speech
                                 </Label>
                                 <Select value={ttsLanguage} onValueChange={setTtsLanguage}> // Uses/Updates global state directly
                                     <SelectTrigger id="tts-language-local" className="w-[180px] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"> 
                                         <SelectValue placeholder="Select language" />
                                     </SelectTrigger>
                                     <SelectContent className="dark:bg-slate-900"> 
                                         {availableLanguages.map(lang => (
                                             <SelectItem key={lang.value} value={lang.value} className="dark:text-slate-200"> 
                                                 {lang.label}
                                             </SelectItem>
                                         ))}
                                     </SelectContent>
                                 </Select>
                             </div>
                         </div>
                     </CardContent>
                 </Card>
             </div>
         );
    }


    // Render the full settings form for logged-in users
    // This section uses the local state (profileSettings) which is synced with global state/backend
    if (loading) return <div className="flex justify-center items-center h-64">Loading settings...</div>;
    
    // If profileSettings is null after loading (e.g., backend returned empty or error)
    // We can still render controls but they will rely on the global context state initially.
    // The save button will then attempt to save these values to the profile.
    // The calculated states `currentTTSActive` and `currentTTSLanguage` handle providing fallbacks.

    const currentTTSActive = profileSettings?.accessibility?.ttsEnabled ?? isTTSActive; // Use state from profileSettings if available, else global state
    const currentTTSLanguage = profileSettings?.accessibility?.ttsLanguage ?? ttsLanguage; // Use state from profileSettings if available, else global state


    return (
        <div className="p-6 max-w-4xl mx-auto">
             {error && // Display the non-blocking error (e.g., fetch failed but showed cached data, or save failed)
                 <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800 mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             }

            <Card className="shadow-lg dark:bg-slate-800">
                <CardHeader className="border-b dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2 text-xl text-slate-800 dark:text-slate-100">
                        <SettingsIcon className="h-6 w-6 text-primary" /> General Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">

                    {/* Section Accessibilité */}
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-slate-800/50">
                         <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Accessibility
                        </h3>
                        <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-slate-900">
                            <div className="space-y-0.5">
                                <Label htmlFor="tts-switch" className="text-base text-gray-800 dark:text-gray-100">
                                    Enable Text-to-Speech on Hover/Focus
                                </Label>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Enables vocal feedback when hovering over or focusing interactive elements.
                                </p>
                            </div>
                            <Switch
                                id="tts-switch"
                                checked={currentTTSActive} // Uses the calculated state (syncs with local and global)
                                onCheckedChange={handleTTSwitchChange} // Updates local & global state
                            />
                        </div>
                         {/* Language selection control */}
                         <div className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-slate-900">
                             <Label htmlFor="tts-language" className="text-base text-gray-800 dark:text-gray-100">
                                 Language for Speech
                             </Label>
                             <Select value={currentTTSLanguage} onValueChange={handleLanguageSelectChange}> // Uses/Updates the calculated state
                                 <SelectTrigger id="tts-language" className="w-[180px] dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"> 
                                     <SelectValue placeholder="Select language" />
                                 </SelectTrigger>
                                 <SelectContent className="dark:bg-slate-900"> 
                                     {availableLanguages.map(lang => (
                                         <SelectItem key={lang.value} value={lang.value} className="dark:text-slate-200"> 
                                             {lang.label}
                                         </SelectItem>
                                     ))}
                                 </SelectContent>
                             </Select>
                         </div>
                         {/* Other TTS settings can be added here (voice, rate, etc.) */}
                    </div>

                     {/* Other settings sections here (e.g., Account, Notifications) */}
                     <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-slate-800/50">
                         <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Other Settings</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400">... Add other settings forms here ...</p>
                     </div>


                </CardContent>
                 <CardFooter className="flex justify-end p-6 border-t dark:border-slate-700"> 
                    <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Settings
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Settings;