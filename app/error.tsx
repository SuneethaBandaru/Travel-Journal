'use client'

import Link from 'next/link'


export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[#FAF7F2] px-6 py-24 text-center">
      <h1 className="font-serif text-2xl font-semibold text-[#2B2B2B]">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-[#8A8580]">
        {error.message || 'The action could not be completed.'} Please try again.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-[#E8914B] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-[#8A8580] px-6 py-2.5 text-sm text-[#2B2B2B]">
          Back to home
        </Link>
      </div>
    </main>
  )
}
