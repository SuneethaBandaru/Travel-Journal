import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Avatar from '@/components/Avatar'
import ConfirmButton from '@/components/ConfirmButton'
import ImageCarousel from '@/components/ImageCarousel'
import { CommentForm, ReplyProvider } from '@/components/ReplyContext'
import CommentThread, { type CommentRow } from '@/components/CommentThread'
import { deletePost, toggleLike } from '@/app/posts/actions'
import { createClient } from '@/lib/supabase/server'
import { fullName, type ProfileLite } from '@/lib/format'

type PostDetail = {
  id: string
  title: string
  content: string
  slug: string
  created_at: string
  user_id: string
  categories: { name: string; slug: string } | null
  post_images: { image_url: string }[]
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub ?? null

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, content, slug, created_at, user_id, categories(name, slug), post_images(image_url)')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    return <pre className="p-6 text-sm text-red-700">Could not load post: {error.message}</pre>
  }
  if (!data) notFound()

  const post = data as unknown as PostDetail

  const [commentsRes, likesRes, myLikeRes] = await Promise.all([
    supabase
      .from('comments')
      .select('id, content, created_at, user_id, parent_comment_id')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true }),
    supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
    userId
      ? supabase.from('post_likes').select('post_id').eq('post_id', post.id).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const comments = (commentsRes.data ?? []) as CommentRow[]
  const likeCount = likesRes.count ?? 0
  const liked = Boolean(myLikeRes.data)

 
  const authorIds = [...new Set([post.user_id, ...comments.map((c) => c.user_id)])]
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url')
    .in('id', authorIds)

  const authors: Record<string, ProfileLite> = {}
  for (const p of profileRows ?? []) authors[p.id] = p

  const byParent: Record<string, CommentRow[]> = {}
  for (const c of comments) {
    const key = c.parent_comment_id ?? 'root'
    ;(byParent[key] ??= []).push(c)
  }

  const author = authors[post.user_id]
  const authorName = fullName(author)
  const isOwner = userId === post.user_id

  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/" className="text-sm text-[#2D6A6A]">
          ← Back to feed
        </Link>

        <article className="mt-4 grid overflow-hidden rounded-xl border border-[#8A8580] bg-white md:grid-cols-[1.3fr_1fr]">
          <ImageCarousel images={post.post_images.map((img) => img.image_url)} alt={post.title} />

          {}
          <ReplyProvider>
          <div className="flex min-h-0 flex-col md:max-h-160">
            <div className="flex items-center gap-3 border-b border-[#D3D1C7] px-4 py-3">
              <Avatar url={author?.avatar_url} name={authorName} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#2B2B2B]">{authorName}</p>
                <p className="text-xs text-[#8A8580]">
                  {post.categories?.name ?? 'No country'} · {new Date(post.created_at).toLocaleDateString('en-GB')}
                </p>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link
                    href={`/posts/${post.slug}/edit`}
                    className="rounded-full border border-[#2D6A6A] px-3 py-1 text-xs font-semibold text-[#2D6A6A]"
                  >
                    Edit
                  </Link>
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <ConfirmButton
                      message="Delete this post? This cannot be undone."
                      className="rounded-full border border-[#D85A30] px-3 py-1 text-xs font-semibold text-[#D85A30]"
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h1 className="font-serif text-xl font-semibold text-[#2B2B2B]">{post.title}</h1>
              <p className="mt-2 whitespace-pre-line text-sm text-[#2B2B2B]">{post.content}</p>

              <h2 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-[#8A8580]">
                Comments ({comments.length})
              </h2>
              {comments.length === 0 ? (
                <p className="text-sm text-[#8A8580]">No comments yet. Start the conversation.</p>
              ) : (
                <CommentThread
                  parentId={null}
                  byParent={byParent}
                  authors={authors}
                  userId={userId}
                  postId={post.id}
                  postOwnerId={post.user_id}
                  slug={post.slug}
                />
              )}
            </div>

            <div className="border-t border-[#D3D1C7] px-4 py-3">
              {userId ? (
                <form action={toggleLike} className="mb-3 flex items-center gap-2">
                  <input type="hidden" name="post_id" value={post.id} />
                  <input type="hidden" name="slug" value={post.slug} />
                  <button
                    type="submit"
                    aria-label={liked ? 'Unlike' : 'Like'}
                    className={`text-2xl leading-none ${liked ? 'text-[#D85A30]' : 'text-[#8A8580]'}`}
                  >
                    {liked ? '♥' : '♡'}
                  </button>
                  <span className="text-sm text-[#2B2B2B]">
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </span>
                </form>
              ) : (
                <p className="mb-3 text-sm text-[#8A8580]">♡ {likeCount} {likeCount === 1 ? 'like' : 'likes'}</p>
              )}

              {userId ? (
                <CommentForm postId={post.id} slug={post.slug} />
              ) : (
                <p className="text-sm text-[#8A8580]">
                  <Link href="/login" className="font-semibold text-[#2D6A6A] underline">
                    Log in
                  </Link>{' '}
                  to like and comment.
                </p>
              )}
            </div>
          </div>
          </ReplyProvider>
        </article>
      </main>
    </div>
  )
}