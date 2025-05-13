// src/components/StaffChatAssistant.jsx (exemple basique)
import React, { useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const StaffChatAssistant = ({ targetType, targetId, initialPrompt = "Posez une question sur ce patient/cette ressource..." }) => {
    const [messages, setMessages] = useState([{ sender: 'bot', text: `Bonjour ! ${initialPrompt}` }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Pour contrôler l'affichage

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chatbot/staff-query', {
                targetType,
                targetId,
                userQuery: input
            }, { withCredentials: true });

            const botResponse = { sender: 'bot', text: response.data.answer || "Je n'ai pas pu trouver de réponse." };
            if(response.data.score < 0.3 && response.data.answer) { // Seuil de confiance bas
                botResponse.text += " (Je ne suis pas très sûr de cette réponse.)";
            }
            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error("Erreur Chatbot:", error);
            const errorText = error.response?.data?.answer || error.response?.data?.message || "Désolé, une erreur est survenue.";
            setMessages(prev => [...prev, { sender: 'bot', text: errorText }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-50 flex items-center justify-center p-0"
                aria-label="Ouvrir l'assistant du personnel"
                title="Assistant Personnel"
            >
                <MessageSquare size={24} />
            </Button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 h-[28rem] bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col z-50">
            <div className="p-3 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold text-sm">Assistant Médical</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 p-1 h-auto">X</Button>
            </div>
            <ScrollArea className="flex-1 p-3 space-y-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                 {isLoading && <div className="flex justify-start"><Loader2 className="h-5 w-5 animate-spin text-gray-500" /></div>}
            </ScrollArea>
            <div className="p-3 border-t border-gray-200 dark:border-slate-700 flex items-center">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez votre question..."
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                    className="flex-1 mr-2 text-sm"
                    disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                </Button>
            </div>
        </div>
    );
};

export default StaffChatAssistant;