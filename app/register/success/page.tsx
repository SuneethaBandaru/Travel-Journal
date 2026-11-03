import Link from 'next/link'

export default function RegisterSuccessPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#FAF7F2] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2D6A6A] text-3xl text-white">
          ✓
        </div>
        <h1 className="font-serif text-2xl font-semibold text-[#2B2B2B]">You&apos;re registered!</h1>
        <p className="mb-8 mt-3 text-sm text-[#8A8580]">
          Welcome to Travel Journal. You can now log in with your email and password.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-[#E8914B] py-3 text-sm font-semibold text-white"
        >
          Go to Login
        </Link>
      </div>
    </main>
  )
}