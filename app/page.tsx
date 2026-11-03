import Link from 'next/link'
import Header from '@/components/Header'
import PostCard, { type PostCardData } from '@/components/PostCard'
import CategoryChips from '@/components/CategoryChips'
import { createClient } from '@/lib/supabase/server'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const term = q.trim().replace(/[,()%_*\\]/g, ' ').trim()

  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('name')

  let query = supabase
    .from('posts')
    .select('id, title, slug, created_at, categories(name, slug), post_images(image_url), comments(count)')
    .order('created_at', { ascending: false })

  if (term) {
    
    const matchingIds = (categories ?? [])
      .filter((c) => c.name.toLowerCase().includes(term.toLowerCase()))
      .map((c) => c.id)
    const filters = [`title.ilike.%${term}%`, `content.ilike.%${term}%`]
    if (matchingIds.length > 0) filters.push(`category_id.in.(${matchingIds.join(',')})`)
    query = query.or(filters.join(','))
  }

  const { data, error } = await query
  const posts = (data ?? []) as unknown as PostCardData[]

  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header q={q} />
      {!term && (
        <section className="bg-linear-to-b from-[#F6E3D0] to-[#FAF7F2]">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-4xl font-semibold text-[#2B2B2B] sm:text-5xl">
              Share your journeys.<br />Discover the world.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[#5F5E5A]">
              Read trip stories from fellow travelers, or write your own and add your best photos.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/posts/new" className="rounded-full bg-[#E8914B] px-6 py-2.5 text-sm font-semibold text-white">
                Write a post
              </Link>
              <a href="#trips" className="rounded-full border border-[#2B2B2B] px-6 py-2.5 text-sm font-semibold text-[#2B2B2B]">
                Browse trips
              </a>
            </div>
          </div>
        </section>
      )}
      <main id="trips" className="mx-auto max-w-6xl px-6 py-10">
        {term && (
          <h1 className="mb-4 font-serif text-xl font-semibold text-[#2B2B2B]">
            Search results for “{term}”
          </h1>
        )}

        <CategoryChips categories={categories ?? []} />

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Could not load posts: {error.message}
          </p>
        )}

        {!error && posts.length === 0 ? (
          term ? (
            <div className="flex flex-col items-center py-16 text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8A8580" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <h2 className="mt-4 font-serif text-xl font-semibold text-[#2B2B2B]">No results found</h2>
              <p className="mt-2 max-w-sm text-sm text-[#8A8580]">
                We couldn’t find any trips matching “{term}”. Try another word or a country name.
              </p>
              <Link
                href="/"
                className="mt-6 rounded-lg bg-[#E8914B] px-6 py-2.5 text-sm font-semibold text-white"
              >
                Clear search
              </Link>
            </div>
          ) : (
            <p className="text-sm text-[#8A8580]">No trips yet. Be the first to write one.</p>
          )
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}