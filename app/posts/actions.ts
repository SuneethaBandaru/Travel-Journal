'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) redirect('/login')
  return { supabase, userId }
}

const text = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim()

export type CommentState = { error: string | null }

export async function addComment(formData: FormData): Promise<CommentState> {
  const { supabase, userId } = await requireUser()
  const content = text(formData, 'content').slice(0, 1000)
  const postId = text(formData, 'post_id')
  const slug = text(formData, 'slug')
  const parentId = text(formData, 'parent_id') || null
  if (!content) return { error: 'Write a comment first.' }
  if (!postId) return { error: 'Could not find the post.' }

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content, parent_comment_id: parentId })
  if (error) return { error: `Could not post your comment: ${error.message}` }

  revalidatePath(`/posts/${slug}`)
  return { error: null }
}


export async function deleteComment(formData: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(formData, 'id')

  const { data: comment } = await supabase
    .from('comments')
    .select('id, user_id, posts(user_id)')
    .eq('id', id)
    .maybeSingle()
  if (!comment) throw new Error('That comment no longer exists.')

  const post = comment.posts as unknown as { user_id: string } | null
  if (comment.user_id !== userId && post?.user_id !== userId) {
    throw new Error('You can only delete your own comments or comments on your own posts.')
  }

  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw new Error(`Could not delete the comment: ${error.message}`)
  revalidatePath(`/posts/${text(formData, 'slug')}`)
}

export async function toggleLike(formData: FormData) {
  const { supabase, userId } = await requireUser()
  const postId = text(formData, 'post_id')
  const slug = text(formData, 'slug')

  const { data: existing } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

  const { error } = existing
    ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId)
    : await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
  if (error) throw new Error(error.message)

  revalidatePath(`/posts/${slug}`)
}

export async function updatePost(formData: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(formData, 'id')
  const slug = text(formData, 'slug')
  const title = text(formData, 'title')
  const content = text(formData, 'content')
  const categoryId = text(formData, 'category_id')

  if (!title || !content || !categoryId) {
    redirect(`/posts/${slug}/edit?error=` + encodeURIComponent('Fill in title, country and content.'))
  }

  const { error } = await supabase
    .from('posts')
    .update({ title, content, category_id: categoryId })
    .eq('id', id)
    .eq('user_id', userId)
  if (error) redirect(`/posts/${slug}/edit?error=` + encodeURIComponent(error.message))

  revalidatePath('/', 'layout')
  redirect(`/posts/${slug}`)
}

export async function deletePost(formData: FormData) {
  const { supabase, userId } = await requireUser()
  const id = text(formData, 'id')

 
  const { data: post } = await supabase
    .from('posts')
    .select('id, post_images(image_url)')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()
  if (!post) throw new Error('You can only delete your own posts.')

  await supabase.from('post_images').delete().eq('post_id', id)
  await supabase.from('comments').delete().eq('post_id', id)
  await supabase.from('post_likes').delete().eq('post_id', id)

  const { error } = await supabase.from('posts').delete().eq('id', id).eq('user_id', userId)
  if (error) throw new Error(`Could not delete the post: ${error.message}`)

  
  const paths = ((post.post_images ?? []) as { image_url: string }[])
    .map((i) => decodeURIComponent(i.image_url.split('/post-images/')[1] ?? ''))
    .filter(Boolean)
  if (paths.length > 0) await supabase.storage.from('post-images').remove(paths)

  revalidatePath('/', 'layout')
  redirect('/my-posts')
}
