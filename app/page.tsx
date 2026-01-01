import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Car, Wrench, MessageSquare, Bell } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <div className="text-center space-y-8 max-w-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
              Motubas
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-medium text-orange-400">
            Buku Service Digital untuk Mobil Tua Anda
          </p>

          {/* Description */}
          <p className="text-slate-400 text-lg leading-relaxed">
            Lacak riwayat service, dapatkan pengingat maintenance, dan konsultasi dengan <strong className="text-white">Om Motu AI</strong> assistant kami.
          </p>

          {/* CTA Buttons - Mobile First (Stacked on mobile) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg shadow-orange-500/25 text-lg"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:border-slate-500 transition-all text-lg"
            >
              Masuk
            </Link>
          </div>
        </div>

        {/* Features Grid - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl w-full">
          <FeatureCard icon={Car} title="Kelola Armada" desc="Catat semua mobil Anda" />
          <FeatureCard icon={Wrench} title="Riwayat Service" desc="Invoice tersimpan aman" />
          <FeatureCard icon={Bell} title="Pengingat" desc="Tak ada yang terlewat" />
          <FeatureCard icon={MessageSquare} title="Om Motu AI" desc="Konsultasi 24/7" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4 text-center hover:border-orange-500/50 transition-colors">
      <Icon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
      <h3 className="font-bold text-white text-sm">{title}</h3>
      <p className="text-slate-500 text-xs mt-1">{desc}</p>
    </div>
  );
}
