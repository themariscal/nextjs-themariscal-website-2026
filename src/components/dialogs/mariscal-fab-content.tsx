"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { getSuggestionsForPage } from "@/data/chat-suggestions";
import { ListFlights } from "@/components/flights/list-flights";
import apiRoutes from "@/lib/api_routes";
// import { useChat } from "ai";

interface Flight {
    id: string;
    departure: {
        cityName: string;
        airportCode: string;
        timestamp: string;
    };
    arrival: {
        cityName: string;
        airportCode: string;
        timestamp: string;
    };
    airlines: string[];
    priceInUSD: number;
    numberOfStops: number;
}

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    flights?: Flight[];
}

// Dynamic suggestions will be loaded based on current page

export const MariscalFabContent = ({
    setDialogIsOpen = () => { },
    onHeightChange = () => { },
}: {
    setDialogIsOpen?: (isOpen: boolean) => void;
    onHeightChange?: (isExpanded: boolean) => void;
}) => {
    const pathname = usePathname();
    const [suggestionChips, setSuggestionChips] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "¡Hola! Soy tu asistente de The Mariscal. ¿En qué puedo ayudarte hoy?",
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Load suggestions based on current page
    useEffect(() => {
        const suggestions = getSuggestionsForPage(pathname);
        setSuggestionChips(suggestions);
    }, [pathname]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        // Expand dialog when user sends first message
        if (!isExpanded) {
            setIsExpanded(true);
            onHeightChange(true);
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            text: text.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call the chat API
            const response = await fetch(apiRoutes.ai.chat, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text.trim(),
                    pathname: pathname,
                    conversationHistory: messages,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from chat API');
            }

            const data = await response.json();

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.message,
                isUser: false,
                timestamp: new Date(),
                flights: data.flights || undefined,
            };

            setMessages(prev => [...prev, botMessage]);

            // Update suggestions if provided
            if (data.suggestions && data.suggestions.length > 0) {
                setSuggestionChips(data.suggestions);
            }

        } catch (error) {
            console.error('Error calling chat API:', error);

            // Fallback response
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Lo siento, no pude procesar tu mensaje en este momento. Por favor, inténtalo de nuevo.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b flex-shrink-0">
                <Image
                    src="/android-chrome-192x192.png"
                    alt="The Mariscal"
                    width={32}
                    height={32}
                    className="rounded-full"
                />
                <div>
                    <h3 className="font-semibold">Asistente Mariscal</h3>
                    <p className="text-xs text-muted-foreground">En línea</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                        <div
                            className={`flex gap-2 ${message.isUser ? "justify-end" : "justify-start"}`}
                        >
                            {!message.isUser && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 ${message.isUser
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                <p className="text-xs opacity-70 mt-1">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {message.isUser && (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-primary-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Show flights if available */}
                        {!message.isUser && message.flights && message.flights.length > 0 && (
                            <div className="ml-10">
                                <ListFlights
                                    flights={message.flights}
                                    onFlightSelect={(flight) => {
                                        handleSendMessage(`Me interesa el vuelo ${flight.id} de ${flight.airlines.join(', ')} por €${flight.priceInUSD}`);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
                <div className="p-4 border-t flex-shrink-0">
                    <p className="text-sm text-muted-foreground mb-3">Sugerencias:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestionChips.map((suggestion, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t flex-shrink-0">
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Escribe tu mensaje..."
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};