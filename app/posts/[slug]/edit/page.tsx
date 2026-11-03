import { notFound, redirect } from 'next/navigation'
import Header from '@/components/Header'
import EditPostForm from '@/components/EditPostForm'
import { createClient } from '@/lib/supabase/server'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub
  if (!userId) redirect('/login')

  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, slug, user_id, category_id, post_images(image_url)')
    .eq('slug', slug)
    .maybeSingle()

  if (!post) notFound()
  if (post.user_id !== userId) redirect(`/posts/${slug}`)

  const { data: categories } = await supabase.from('categories').select('id, name').order('name')
  const images = ((post.post_images ?? []) as { image_url: string }[]).map((i) => i.image_url)

  return (
    <div className="flex-1 bg-[#FAF7F2]">
      <Header />
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-6 font-serif text-2xl font-semibold text-[#2B2B2B]">Edit post</h1>
        <EditPostForm
          userId={userId}
          post={{
            id: post.id,
            slug: post.slug,
            title: post.title,
            content: post.content,
            category_id: post.category_id,
          }}
          categories={categories ?? []}
          images={images}
        />
      </main>
    </div>
  )
}