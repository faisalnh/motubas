'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatMessage } from '@/lib/gemini';
import { sendMessage } from '@/app/actions/chat';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
    initialCredits: number | 'Unlimited';
    userTier: 'FREE' | 'PREMIUM';
    userName: string;
}

export function ChatInterface({ initialCredits, userTier, userName }: ChatInterfaceProps) {
    const firstName = userName.split(' ')[0];
    const greetingName = userName === 'Sobat Motu' ? 'Sobat Motu' : `Om ${firstName}`;

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'model',
            parts: `Halo ${greetingName}! 👋 Ketemu lagi sama Om Motu nih. Mobilnya lagi kenapa Om? Ada yang aneh-aneh nggak bunyinya? Ceritain aja, Om siap bantu diagnosa! 🚗🔧`,
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [credits, setCredits] = useState<number | 'Unlimited'>(initialCredits);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function handleSend() {
        if (!input.trim() || isLoading) return;

        if (userTier === 'FREE' && typeof credits === 'number' && credits <= 0) {
            return; // UI should block this, but safety check
        }

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        // Optimistically add user message
        const newHistory = [...messages, { role: 'user' as const, parts: userMessage }];
        setMessages(newHistory);

        try {
            // Pass previous history (excluding the optimistic new message for the API call if logic required, 
            // but server action takes history and appends latest. 
            // Actually my server action definition was: sendMessage(message, history)
            // So I should pass the *previous* messages, and the *current* message as argument.

            const result = await sendMessage(userMessage, messages); // Pass history BEFORE new message

            if (result.error) {
                setMessages(prev => [...prev, { role: 'model', parts: `⚠️ ${result.error}` }]);
            } else if (result.response) {
                setMessages(prev => [...prev, { role: 'model', parts: result.response! }]);
                if (result.remainingCredits !== undefined) {
                    setCredits(result.remainingCredits as number | 'Unlimited');
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', parts: '⚠️ Maaf, terjadi kesalahan koneksi. Silakan coba lagi.' }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isOutOfCredits = userTier === 'FREE' && typeof credits === 'number' && credits <= 0;

    return (
        <Card className="flex flex-col h-[600px] w-full max-w-4xl mx-auto shadow-lg dark:bg-slate-900">
            <CardHeader className="border-b dark:border-slate-800 bg-primary/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Om Motu AI</CardTitle>
                            <p className="text-xs text-muted-foreground">Asisten Mekanik Virtual</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-medium">
                            Credit: {credits === 'Unlimited' ? '∞' : credits}
                        </span>
                        {userTier === 'FREE' && (
                            <span className="text-xs text-muted-foreground">/ 10</span>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-950/50">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
                                }`}>
                                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                            </div>
                            <div
                                className={`p-3 rounded-lg text-sm ${msg.role === 'user'
                                    ? 'bg-slate-700 dark:bg-slate-600 text-white'
                                    : 'bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm text-gray-800 dark:text-gray-200'
                                    }`}
                            >
                                {msg.role === 'model' ? (
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown>{msg.parts}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap">{msg.parts}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-2 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm p-3 rounded-lg flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Om Motu sedang mengetik...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            <CardFooter className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex w-full gap-2">
                    {isOutOfCredits ? (
                        <div className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle size={18} />
                            <p className="text-sm font-medium">Kuota chat habis. Upgrade ke Premium untuk lanjut chat!</p>
                        </div>
                    ) : (
                        <>
                            <Input
                                placeholder="Tanya masalah mobilmu di sini..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                                <Send size={18} />
                                <span className="sr-only">Kirim</span>
                            </Button>
                        </>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
