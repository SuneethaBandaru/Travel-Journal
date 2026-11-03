import Link from 'next/link'

export type PostCardData = {
  id: string
  title: string
  slug: string
  created_at: string
  categories: { name: string; slug: string } | null
  post_images: { image_url: string }[]
  comments: { count: number }[]
}

export default function PostCard({
  post,
  children,
}: {
  post: PostCardData
  children?: React.ReactNode
}) {
  const cover = post.post_images?.[0]?.image_url
  const commentCount = post.comments?.[0]?.count ?? 0

  return (
    <div className="group overflow-hidden rounded-xl border border-[#D3D1C7] bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#D3D1C7] text-xs text-[#5F5E5A]">
          {cover ? (
            
            <img src={cover} alt={post.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            'No photo'
          )}
          {post.categories?.name && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2D6A6A]">
              {post.categories.name}
            </span>
          )}
        </div>
        <div className="p-4">
          <h2 className="font-serif text-base font-semibold text-[#2B2B2B]">{post.title}</h2>
          <p className="mt-1 text-xs text-[#8A8580]">
            {new Date(post.created_at).toLocaleDateString('en-GB')} · {commentCount} comments
          </p>
        </div>
      </Link>
      {children && <div className="flex gap-2 border-t border-[#D3D1C7] px-4 py-3">{children}</div>}
    </div>
  )
}