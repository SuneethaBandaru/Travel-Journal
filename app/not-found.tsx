import Link from 'next/link'
import Header from '@/components/Header'

export default function NotFound() {
  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header />
      <main className="flex flex-col items-center px-6 py-24 text-center">
        <p className="text-6xl">🧭</p>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-[#2B2B2B]">Lost on the road?</h1>
        <p className="mt-2 max-w-sm text-sm text-[#8A8580]">
          We couldn’t find the page you were looking for. It may have been moved or deleted.
        </p>
        <Link href="/" className="mt-6 rounded-lg bg-[#E8914B] px-6 py-2.5 text-sm font-semibold text-white">
          Back to home
        </Link>
      </main>
    </div>
  )
}