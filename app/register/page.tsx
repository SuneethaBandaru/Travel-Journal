import Link from 'next/link'
import { register } from './actions'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex flex-1 items-center justify-center bg-[#FAF7F2] px-4">
      <form action={register} className="w-full max-w-sm">
        <h1 className="text-center font-serif text-2xl font-semibold text-[#2B2B2B]">
          Travel Journal
        </h1>
        <p className="mb-8 mt-1 text-center text-sm text-[#8A8580]">Create your account</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <label htmlFor="email" className="block text-sm text-[#2B2B2B]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mb-4 mt-1 w-full rounded-lg border border-[#8A8580] bg-white px-3 py-3 text-sm text-[#2B2B2B]"
        />

        <label htmlFor="password" className="block text-sm text-[#2B2B2B]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="mb-6 mt-1 w-full rounded-lg border border-[#8A8580] bg-white px-3 py-3 text-sm text-[#2B2B2B]"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-[#E8914B] py-3 text-sm font-semibold text-white"
        >
          Register
        </button>

        <p className="mt-6 text-center text-sm text-[#8A8580]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2D6A6A] underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}