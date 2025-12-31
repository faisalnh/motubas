import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-5xl font-bold text-blue-600">Motubas</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Buku Service Digital untuk Mobil Tua Anda
        </p>
        <p className="text-gray-500 max-w-xl">
          Lacak riwayat service, dapatkan pengingat maintenance, dan konsultasi dengan Om Motu AI assistant kami.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
