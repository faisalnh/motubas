# Motubas - Buku Service Digital untuk Mobil Tua

Aplikasi web untuk melacak riwayat service mobil tua di Indonesia dengan fitur pengingat maintenance dan AI assistant (Om Motu).

## Tech Stack

- **Framework:** Next.js 15 (App Router with Turbopack)
- **Database:** PostgreSQL with Prisma 7
- **Authentication:** Auth.js v5 (NextAuth.js v5)
- **AI:** Google Gemini 2.5 Flash
- **UI:** Tailwind CSS + shadcn/ui
- **File Storage:** Vercel Blob Storage
- **Hosting:** Vercel

## Fitur MVP

- ✅ Authentication (Email/Password & Google OAuth)
- ✅ Dashboard utama
- 🚧 Manajemen mobil (1 mobil untuk free tier)
- 🚧 Riwayat service dengan upload foto invoice
- 🚧 Pengingat maintenance otomatis
- 🚧 Om Motu AI assistant untuk troubleshooting
- 🚧 Analytics biaya service

## Prasyarat

- Node.js 20.9 atau lebih tinggi
- PostgreSQL database
- Google Cloud Project (untuk OAuth & Gemini API)
- Vercel account (untuk deployment & blob storage)

## Setup Local Development

### 1. Clone Repository

```bash
cd /Users/faisalnurhidayat/repo/Motubas
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Database (gunakan Vercel Postgres atau PostgreSQL lokal)
DATABASE_URL="postgresql://user:password@localhost:5432/motubas?schema=public"

# NextAuth / Auth.js
AUTH_SECRET="generate-dengan-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Vercel Blob (untuk upload foto)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

#### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

### 4. Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Enable Google+ API
4. Buat OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID dan Client Secret ke `.env.local`

### 5. Setup Google Gemini API

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Buat API key
3. Copy API key ke `.env.local` sebagai `GEMINI_API_KEY`

### 6. Setup Database

#### Opsi A: Vercel Postgres (Recommended untuk production-like dev)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Create Postgres: `vercel postgres create`
5. Pull env vars: `vercel env pull .env.local`

#### Opsi B: PostgreSQL Lokal

1. Install PostgreSQL
2. Buat database: `createdb motubas`
3. Update `DATABASE_URL` di `.env.local`

### 7. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 8. Generate Prisma Client

```bash
npx prisma generate
```

### 9. (Optional) Seed Database

Untuk development, Anda bisa menambahkan data sample:

```bash
npx prisma db seed
```

### 10. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **users** - User accounts
- **cars** - User cars (1 max untuk free tier)
- **service_records** - Service history dengan foto invoice
- **maintenance_reminders** - Auto-generated reminders
- **ai_conversations** - Om Motu AI chat history
- **bengkels** - Partner service shops (future)
- **bengkel_users** - Service shop staff (future)

Lihat detail schema di `prisma/schema.prisma`

## Struktur Folder

```
motubas/
├── app/
│   ├── (auth)/              # Login & Register pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   ├── actions/             # Server actions
│   └── layout.tsx
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── db.ts               # Prisma client
│   ├── utils.ts            # Utility functions
│   ├── subscription.ts     # Freemium logic
│   └── reminder-calculator.ts
├── prisma/
│   └── schema.prisma
└── public/
```

## Development Workflow

### Prisma Commands

```bash
# Generate client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Lint
npm run lint
```

## Deployment ke Vercel

### Setup

1. Push code ke GitHub
2. Import project di [Vercel Dashboard](https://vercel.com/new)
3. Tambahkan environment variables di Vercel:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` (domain production)
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
   - `GEMINI_API_KEY`
   - `BLOB_READ_WRITE_TOKEN`

### Update Google OAuth

Tambahkan production redirect URI di Google Cloud Console:
- `https://your-domain.vercel.app/api/auth/callback/google`

### Deploy

```bash
vercel --prod
```

## Freemium Model

### Free Tier
- ✅ 1 mobil
- ✅ Unlimited service records
- ✅ 10 AI queries per bulan
- ❌ Tidak ada notifikasi email/push

### Premium (Future)
- ✅ Unlimited mobil
- ✅ Unlimited AI queries
- ✅ Email/push notifications
- ✅ Export PDF
- ✅ Advanced analytics

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/callback/google` - Google OAuth callback

### Cars
- `GET /api/cars` - Get user cars
- `POST /api/cars` - Create car (max 1 for free)
- `PATCH /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Service Records
- `GET /api/services` - Get service records
- `POST /api/services` - Create service record
- `PATCH /api/services/:id` - Update service record
- `DELETE /api/services/:id` - Delete service record

### AI (Om Motu)
- `POST /api/ai/chat` - Chat with Om Motu AI

## Troubleshooting

### Prisma adapter error

Jika ada error terkait Prisma adapter, pastikan sudah install:
```bash
npm install @prisma/adapter-pg pg
```

### Auth.js error

Pastikan `AUTH_SECRET` sudah di-generate dengan benar:
```bash
openssl rand -base64 32
```

### Google OAuth tidak bekerja

1. Cek redirect URI di Google Cloud Console
2. Pastikan `AUTH_URL` sesuai dengan domain
3. Cek `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET` benar

## Next Steps untuk Development

### Implementasi Car Management
- [ ] Form tambah mobil
- [ ] Edit mobil
- [ ] Validasi 1 mobil untuk free tier

### Service Record System
- [ ] Form tambah service
- [ ] Upload & compress foto invoice
- [ ] Display service history dengan filter
- [ ] Auto-create reminders dari service

### Maintenance Reminders
- [ ] Dashboard pengingat
- [ ] Kalkulasi due date/mileage
- [ ] Visual indicators (due soon, overdue)

### Om Motu AI
- [ ] Chat interface
- [ ] Gemini Flash integration
- [ ] Image upload untuk diagnosa
- [ ] Credit system
- [ ] Bengkel recommendation

### Dashboard Analytics
- [ ] Service cost charts
- [ ] Monthly trends
- [ ] Export data

## Tech Stack Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Auth.js v5 Documentation](https://authjs.dev)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## License

Private - All rights reserved

## Contact

Untuk pertanyaan atau issue, silakan buat issue di GitHub repository.

---

**Status:** 🚧 MVP Development in Progress

**Latest Version:** Next.js 15, Prisma 7, Auth.js v5, Gemini 2.5 Flash (2025)
