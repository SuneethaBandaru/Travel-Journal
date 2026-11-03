import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/logout/actions'
import Avatar from '@/components/Avatar'
import { fullName } from '@/lib/format'

export default async function Header({ q = '' }: { q?: string }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  let profile: { first_name: string | null; last_name: string | null; avatar_url: string | null } | null = null
  if (claims) {
    const { data: p } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url')
      .eq('id', claims.sub)
      .maybeSingle()
    profile = p
  }
  const name = fullName(profile, claims?.email ?? 'Me')

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[#8A8580] bg-white/95 px-6 py-4 backdrop-blur">
      <Link href="/" className="font-serif text-xl font-semibold text-[#2B2B2B]">
        ✈ Travel Journal
      </Link>

      <form action="/" method="get" className="order-3 w-full sm:order-0 sm:w-72">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search trips or countries…"
          className="w-full rounded-full border border-[#8A8580] bg-[#FAF7F2] px-4 py-1.5 text-sm text-[#2B2B2B]"
        />
      </form>

      {claims ? (
        <div className="flex items-center gap-4">
          <Link
            href="/posts/new"
            className="rounded-full bg-[#E8914B] px-4 py-1.5 text-sm font-semibold text-white"
          >
            + New post
          </Link>

          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center">
              <Avatar url={profile?.avatar_url} name={name} size={36} />
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-lg border border-[#8A8580] bg-white text-sm shadow-md">
              <p className="truncate border-b border-[#D3D1C7] px-4 py-2 text-xs text-[#8A8580]">{name}</p>
              <Link href="/my-posts" className="block px-4 py-2 text-[#2B2B2B] hover:bg-[#FAF7F2]">
                My posts
              </Link>
              <Link href="/settings" className="block px-4 py-2 text-[#2B2B2B] hover:bg-[#FAF7F2]">
                Settings
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="block w-full px-4 py-2 text-left text-[#D85A30] hover:bg-[#FAF7F2]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-[#2D6A6A]">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#E8914B] px-4 py-1.5 text-sm font-semibold text-white"
          >
            Register
          </Link>
        </div>
      )}
    </header>
  )
}