// src/components/StaffChatAssistant.jsx
import React, { useState, useEffect, useRef } from 'react'; // Ajout de useEffect et useRef
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Loader2, X as CloseIcon } from 'lucide-react'; // Renommé X pour éviter conflit
import { ScrollArea } from "@/components/ui/scroll-area";

// Définir l'URL de base de votre API backend.
// Idéalement, cela viendrait d'une variable d'environnement.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8089"; 
// Assurez-vous d'avoir VITE_API_URL=http://localhost:8089 dans votre fichier .env à la racine du projet frontend

const StaffChatAssistant = ({ targetType, targetId, initialPrompt = "Posez une question sur ce patient/cette ressource..." }) => {
    const [messages, setMessages] = useState([{ sender: 'bot', text: `Bonjour ! ${initialPrompt}` }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const scrollAreaRef = useRef(null); // Pour scroller vers le bas

    // Effet pour scroller vers le bas quand un nouveau message arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollViewport) {
                scrollViewport.scrollTop = scrollViewport.scrollHeight;
            }
        }
    }, [messages]);


    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input; // Sauvegarder l'input avant de le vider
        setInput('');
        setIsLoading(true);

        try {
            console.log(`[Chat FE] Envoi à ${API_BASE_URL}/api/chatbot/staff-query avec :`, {
                targetType,
                targetId,
                userQuery: currentInput // Utiliser la valeur sauvegardée
            });
            const response = await axios.post(
                `${API_BASE_URL}/api/chatbot/staff-query`, // <-- MODIFICATION IMPORTANTE ICI
                {
                    targetType,
                    targetId,
                    userQuery: currentInput // Utiliser la valeur sauvegardée
                }, 
                { withCredentials: true }
            );

            const botResponse = { sender: 'bot', text: response.data.answer || "Je n'ai pas pu trouver de réponse précise." };
            // Optionnel : ajuster le message si le score de confiance est bas
            if (response.data.score !== undefined && response.data.score < 0.3 && response.data.answer) { 
                botResponse.text += " (Je ne suis pas très sûr de cette réponse, veuillez vérifier les informations.)";
            }
            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error("Erreur Chatbot:", error);
            let errorText = "Désolé, une erreur est survenue lors de la communication avec l'assistant.";
            if (error.response) {
                // Erreur venant du serveur backend (4xx, 5xx)
                errorText = error.response.data?.answer || error.response.data?.message || `Erreur serveur (${error.response.status}).`;
            } else if (error.request) {
                // La requête a été faite mais pas de réponse (problème réseau, backend down)
                errorText = "Impossible de joindre le service de l'assistant. Vérifiez votre connexion ou réessayez plus tard.";
            }
            // Autre erreur (config axios, etc.)
            // errorText reste le message par défaut

            setMessages(prev => [...prev, { sender: 'bot', text: errorText }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-[9999] flex items-center justify-center p-0" // z-index élevé
                aria-label="Ouvrir l'assistant du personnel"
                title="Assistant Personnel"
            >
                <MessageSquare size={24} />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[28rem] sm:h-[32rem] bg-white dark:bg-slate-900 shadow-xl rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col z-[9999]"> {/* z-index élevé */}
            <div className="p-3 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold text-sm">Assistant Médical</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 p-1 h-7 w-7">
                    <CloseIcon size={18}/>
                </Button>
            </div>
            <ScrollArea className="flex-1 p-3 space-y-2" ref={scrollAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                 {isLoading && <div className="flex justify-start p-2"><Loader2 className="h-5 w-5 animate-spin text-gray-500" /></div>}
            </ScrollArea>
            <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez votre question..."
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                    className="flex-1 text-sm rounded-full px-4 py-2"
                    disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                </Button>
            </div>
        </div>
    );
};

export default StaffChatAssistant;