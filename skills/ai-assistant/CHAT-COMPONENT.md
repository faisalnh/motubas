# Om Motu Chat Component

Complete React component for the AI chat interface.

## Full Component Implementation

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface ChatProps {
  carId?: string;
  initialCredits: number;
}

export function OmMotuChat({ carId, initialCredits }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [credits, setCredits] = useState(initialCredits);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  }

  async function sendMessage() {
    if (!input.trim() && !selectedImage) return;
    if (credits === 0) {
      alert('Kredit AI habis. Upgrade ke Premium untuk unlimited.');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          carId,
          conversationId,
          imageBase64: selectedImage?.split(',')[1], // Remove data URL prefix
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal mengirim pesan');
      }

      const data = await response.json();

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);

      // Update conversation ID and credits
      setConversationId(data.conversationId);
      setCredits(data.creditsRemaining);
      setSelectedImage(null);
    } catch (error) {
      console.error('Chat error:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header with credits */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Om Motu AI</CardTitle>
            <div className="text-sm">
              {credits === -1 ? (
                <span className="text-green-600">✨ Unlimited</span>
              ) : (
                <span className={credits <= 2 ? 'text-red-600' : 'text-gray-600'}>
                  {credits} kredit tersisa
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Tanyakan masalah mobil Anda. Bisa kirim foto juga!
          </p>
        </CardHeader>
      </Card>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">👋 Halo!</p>
            <p className="text-sm">
              Saya Om Motu, siap membantu diagnosa masalah mobil Anda.
            </p>
            <p className="text-xs mt-4 text-gray-400">
              Contoh: "Mobil saya susah distarter pagi hari" atau "Mesin panas terus, kenapa ya?"
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    className="mb-2 rounded max-w-full h-auto max-h-48"
                  />
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input area */}
      <Card>
        <CardContent className="pt-4">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img
                src={selectedImage}
                alt="Preview"
                className="h-20 rounded border"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isLoading || credits === 0}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isLoading || credits === 0}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan masalah mobil Anda..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading || credits === 0}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !selectedImage) || credits === 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Usage in Page

```typescript
// app/(dashboard)/om-motu/page.tsx
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { OmMotuChat } from '@/components/om-motu-chat';

export default async function OmMotuPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      aiCreditsRemaining: true,
      subscriptionTier: true,
      cars: {
        take: 1,
        select: { id: true },
      },
    },
  });

  const credits = user?.subscriptionTier === 'PREMIUM' 
    ? -1 
    : (user?.aiCreditsRemaining || 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Om Motu AI</h1>
      <OmMotuChat
        carId={user?.cars[0]?.id}
        initialCredits={credits}
      />
    </div>
  );
}
```

## Features

### 1. Real-time Chat
- Message bubbles (user: blue, assistant: gray)
- Auto-scroll to latest message
- Loading indicator during API calls

### 2. Image Support
- Upload button with file picker
- Image preview before sending
- Remove image option
- Size validation (max 5MB)

### 3. Credit System
- Display remaining credits
- Warning when low (≤2 credits)
- Disable input when credits = 0
- Show "Unlimited" for premium users

### 4. UX Improvements
- Enter key to send (Shift+Enter for new line)
- Disable inputs while loading
- Error handling with alerts
- Empty state with examples

### 5. Conversation Persistence
- Maintains conversation ID
- Sends full history to API
- Context preserved across messages

## Styling Notes

- Uses Tailwind CSS classes
- Responsive design (mobile-friendly)
- Fixed height container (600px)
- Scrollable message area
- Sticky input at bottom

## Accessibility

- Keyboard navigation (Enter to send)
- Loading states clearly indicated
- Error messages shown to user
- Alt text for images
- Disabled states for buttons

## Testing Checklist

- [ ] Send text-only message
- [ ] Send message with image
- [ ] Test with 0 credits (should block)
- [ ] Test Enter key to send
- [ ] Test image preview and removal
- [ ] Test auto-scroll on new messages
- [ ] Test error handling
- [ ] Test on mobile viewport
