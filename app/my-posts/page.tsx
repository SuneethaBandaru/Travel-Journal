import Link from 'next/link'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import PostCard, { type PostCardData } from '@/components/PostCard'
import ConfirmButton from '@/components/ConfirmButton'
import { deletePost } from '@/app/posts/actions'
import { createClient } from '@/lib/supabase/server'

export default async function MyPostsPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub
  if (!userId) redirect('/login')

  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, created_at, categories(name, slug), post_images(image_url), comments(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const posts = (data ?? []) as unknown as PostCardData[]

  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-6 font-serif text-2xl font-semibold text-[#2B2B2B]">My posts</h1>

        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#8A8580]">You haven’t written any trips yet.</p>
            <Link
              href="/posts/new"
              className="mt-4 inline-block rounded-lg bg-[#E8914B] px-6 py-2.5 text-sm font-semibold text-white"
            >
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post}>
                <Link
                  href={`/posts/${post.slug}/edit`}
                  className="rounded-full border border-[#2D6A6A] px-4 py-1 text-xs font-semibold text-[#2D6A6A]"
                >
                  Edit
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="id" value={post.id} />
                  <ConfirmButton
                    message="Delete this post? This cannot be undone."
                    className="rounded-full border border-[#D85A30] px-4 py-1 text-xs font-semibold text-[#D85A30]"
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </PostCard>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}