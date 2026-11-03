import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import NewPostForm from '@/components/NewPostForm'
import { createClient } from '@/lib/supabase/server'

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) {
    redirect('/login')
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header />
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-6 font-serif text-2xl font-semibold text-[#2B2B2B]">
          New trip write-up
        </h1>
        <NewPostForm categories={categories ?? []} />
      </main>
    </div>
  )
}