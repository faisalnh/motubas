---
name: ai-assistant
description: Implements Om Motu AI assistant using Google Gemini 2.5 Flash for car troubleshooting. Use when building AI chat features, implementing Gemini API integration, or handling AI credit systems.
---

# Om Motu AI Assistant

## Overview

Om Motu is an AI assistant for troubleshooting old car issues in Indonesia. Uses Google Gemini 2.5 Flash API with:
- Text and image inputs (users can send photos of car issues)
- Conversation history storage
- Credit-based usage (10 free queries/month)
- Bengkel (workshop) recommendations

## Gemini Flash Setup

### Install SDK

Already in package.json:
```json
"@google/genai": "^1.34.0"
```

### Environment Variable

Required in `.env.local`:
```
GEMINI_API_KEY="your-api-key-from-google-ai-studio"
```

Get API key: https://aistudio.google.com/app/apikey

### Initialize Client

```typescript
import { GoogleGenerativeAI } from '@google/genai';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

## System Prompt for Om Motu

```typescript
const SYSTEM_PROMPT = `Kamu adalah Om Motu, asisten digital untuk pemilik mobil tua di Indonesia.

PERAN KAMU:
- Membantu diagnosa masalah mobil berdasarkan gejala yang dijelaskan
- Memberikan rekomendasi jenis service yang dibutuhkan
- Menyarankan bengkel yang sesuai dengan masalah
- Menjelaskan dengan bahasa yang mudah dipahami

ATURAN PENTING:
1. SELALU gunakan Bahasa Indonesia yang sopan dan ramah
2. Gunakan istilah "Om" atau "Ibu/Bapak" untuk memanggil pengguna
3. Jika masalah serius (mesin overheat, rem bermasalah, dll), sarankan SEGERA ke bengkel
4. Berikan estimasi biaya service jika memungkinkan (dalam Rupiah)
5. Rekomendasikan bengkel partner jika tersedia
6. Jika tidak yakin, jujur katakan dan sarankan untuk konsultasi langsung

CONTOH RESPONS:
"Berdasarkan gejala yang Om jelaskan, sepertinya ada masalah di sistem pendingin. Kalau mesin cepat panas dan air radiator berkurang, bisa jadi ada kebocoran di selang radiator atau termostat rusak.

**Rekomendasi:**
- Service sistem pendingin (cek radiator, selang, dan termostat)
- Estimasi biaya: Rp 200.000 - Rp 500.000

**Tingkat Urgensi:** Segera - jangan dipakai dulu kalau mesin sudah overheat

Bengkel yang bisa membantu: [nama bengkel akan dimasukkan oleh sistem]"

Selalu prioritaskan keselamatan pengguna.`;
```

## API Implementation

Create `/api/ai/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/genai';
import { canUseAI } from '@/lib/subscription';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check AI credits
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { aiCreditsRemaining: true, subscriptionTier: true },
  });

  if (!user || !canUseAI(user.aiCreditsRemaining)) {
    return NextResponse.json(
      { error: 'Kredit AI habis. Upgrade ke Premium untuk unlimited.' },
      { status: 403 }
    );
  }

  try {
    const { message, carId, conversationId, imageBase64 } = await request.json();

    // 3. Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await db.aiConversation.findUnique({
        where: { id: conversationId },
      });
    } else {
      conversation = await db.aiConversation.create({
        data: {
          userId: session.user.id,
          carId: carId || null,
          conversationHistory: [],
          issueDescription: message.substring(0, 200),
        },
      });
    }

    // 4. Prepare conversation history
    const history = conversation.conversationHistory as Array<{
      role: string;
      content: string;
    }>;

    // 5. Call Gemini API
    const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const parts = [{ text: message }];
    
    // Add image if provided
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'Siap membantu, Om/Bu!' }] },
        ...history.map((h) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(parts);
    const response = result.response.text();

    // 6. Update conversation history
    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: response },
    ];

    await db.aiConversation.update({
      where: { id: conversation.id },
      data: { conversationHistory: updatedHistory },
    });

    // 7. Decrement AI credits (FREE tier only)
    if (user.subscriptionTier === 'FREE') {
      await db.user.update({
        where: { id: session.user.id },
        data: { aiCreditsRemaining: { decrement: 1 } },
      });
    }

    return NextResponse.json({
      response,
      conversationId: conversation.id,
      creditsRemaining: user.subscriptionTier === 'FREE' 
        ? user.aiCreditsRemaining - 1 
        : -1, // -1 means unlimited
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Gagal berkomunikasi dengan Om Motu' },
      { status: 500 }
    );
  }
}
```

## Client-Side Chat Component

See [CHAT-COMPONENT.md](CHAT-COMPONENT.md) for complete React component implementation.

## Image Upload for AI

```typescript
'use client';

import { useState } from 'react';

function ImageUploadForAI({ onImageReady }: { onImageReady: (base64: string) => void }) {
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64Data = base64.split(',')[1];
      onImageReady(base64Data);
    };
    reader.readAsDataURL(file);
  }

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="text-sm"
    />
  );
}
```

## Credit Display

Show remaining credits prominently:

```typescript
function CreditDisplay({ credits }: { credits: number }) {
  if (credits === -1) {
    return (
      <div className="text-sm text-green-600">
        ✨ Unlimited (Premium)
      </div>
    );
  }

  return (
    <div className={`text-sm ${credits <= 2 ? 'text-red-600' : 'text-gray-600'}`}>
      {credits} pertanyaan tersisa bulan ini
      {credits <= 2 && (
        <p className="text-xs mt-1">
          Upgrade ke Premium untuk unlimited
        </p>
      )}
    </div>
  );
}
```

## Bengkel Recommendations

Inject bengkel data into AI response:

```typescript
async function addBengkelRecommendations(
  response: string,
  carId: string
): Promise<string> {
  // Get car location (from user profile or car data)
  const car = await db.car.findUnique({
    where: { id: carId },
    include: { user: true },
  });

  // Find nearby partner bengkels
  const bengkels = await db.bengkel.findMany({
    where: {
      isPartner: true,
      // Add location filter when implemented
    },
    take: 3,
  });

  if (bengkels.length === 0) {
    return response;
  }

  // Append bengkel list to response
  const bengkelList = bengkels
    .map(
      (b) =>
        `- **${b.name}**\n  ${b.address}\n  ${b.phone}\n  Spesialisasi: ${b.specialty.join(', ')}`
    )
    .join('\n\n');

  return `${response}\n\n---\n\n**Bengkel Partner yang Direkomendasikan:**\n\n${bengkelList}`;
}
```

## Error Handling

```typescript
try {
  // Gemini API call
} catch (error) {
  if (error.message.includes('quota')) {
    return { error: 'API quota exceeded. Please try again later.' };
  }
  if (error.message.includes('safety')) {
    return { error: 'Konten tidak sesuai. Coba pertanyaan yang berbeda.' };
  }
  return { error: 'Terjadi kesalahan. Silakan coba lagi.' };
}
```

## Rate Limiting

Implement simple rate limiting:

```typescript
// In-memory rate limit (use Redis in production)
const rateLimits = new Map<string, number>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimits.get(userId) || 0;
  
  // 1 request per 5 seconds
  if (now - lastRequest < 5000) {
    return false;
  }
  
  rateLimits.set(userId, now);
  return true;
}
```

## Important Notes

- **Always check credits** before allowing AI queries
- **Decrement credits** only for FREE tier users
- **Store conversation history** for context
- **Indonesian language** in all prompts and responses
- **Safety first** - always recommend professional help for serious issues
- **Rate limit** to prevent abuse
- **Image support** helps with visual diagnostics
- **Bengkel recommendations** increase value for users
