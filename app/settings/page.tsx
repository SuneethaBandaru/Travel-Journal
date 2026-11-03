import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import SettingsForm from '@/components/SettingsForm'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const claims = auth?.claims
  if (!claims) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('id', claims.sub)
    .maybeSingle()

  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header />
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-6 font-serif text-2xl font-semibold text-[#2B2B2B]">Settings</h1>
        <SettingsForm
          userId={claims.sub}
          email={claims.email ?? ''}
          firstName={profile?.first_name ?? ''}
          lastName={profile?.last_name ?? ''}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </main>
    </div>
  )
}