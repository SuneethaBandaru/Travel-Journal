import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import CategoryChips from '@/components/CategoryChips'
import PostCard, { type PostCardData } from '@/components/PostCard'
import { createClient } from '@/lib/supabase/server'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: categories } = await supabase.from('categories').select('id, name, slug').order('name')
  const category = categories?.find((c) => c.slug === slug)
  if (!category) notFound()

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, categories(name, slug), post_images(image_url), comments(count)')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  const posts = (data ?? []) as unknown as PostCardData[]

  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-4 font-serif text-2xl font-semibold text-[#2B2B2B]">
          Trips in {category.name}
        </h1>

        <CategoryChips categories={categories ?? []} activeSlug={category.slug} />

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Could not load posts: {error.message}
          </p>
        )}

        {!error && posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <h2 className="font-serif text-xl font-semibold text-[#2B2B2B]">No trips here yet</h2>
            <p className="mt-2 max-w-sm text-sm text-[#8A8580]">
              Nobody has written about {category.name} yet.
            </p>
            <Link
              href="/posts/new"
              className="mt-6 rounded-lg bg-[#E8914B] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Write a post
            </Link>
          </div>
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
