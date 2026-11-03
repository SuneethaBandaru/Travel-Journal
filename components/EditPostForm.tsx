'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Category = { id: string; name: string }

type Props = {
  userId: string
  post: { id: string; slug: string; title: string; content: string; category_id: string | null }
  categories: Category[]
  images: string[]
}

const MAX_FILES = 5
const MAX_SIZE_MB = 5
const field =
  'mb-4 mt-1 w-full rounded-lg border border-[#8A8580] bg-white px-3 py-3 text-sm text-[#2B2B2B]'

export default function EditPostForm({ userId, post, categories, images }: Props) {
  const router = useRouter()
  const [kept, setKept] = useState<string[]>(images)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles])

  function handleNewFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (picked.length === 0) return

    if (kept.length + newFiles.length + picked.length > MAX_FILES) {
      setError(`A post can have up to ${MAX_FILES} photos in total.`)
      return
    }
    if (picked.some((f) => !f.type.startsWith('image/'))) {
      setError('Only image files are allowed.')
      return
    }
    if (picked.some((f) => f.size > MAX_SIZE_MB * 1024 * 1024)) {
      setError(`Each photo must be smaller than ${MAX_SIZE_MB} MB.`)
      return
    }
    setError(null)
    setNewFiles((prev) => [...prev, ...picked])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const content = String(form.get('content') ?? '').trim()
    const categoryId = String(form.get('category_id') ?? '')

    if (!title || !content || !categoryId) {
      setError('Please fill in the title, country and content.')
      return
    }

    setError(null)
    setSaving(true)
    const supabase = createClient()

  
    const { error: updateError } = await supabase
      .from('posts')
      .update({ title, content, category_id: categoryId })
      .eq('id', post.id)
      .eq('user_id', userId)
    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

  
    const removed = images.filter((url) => !kept.includes(url))
    for (const url of removed) {
      const { error: rowError } = await supabase
        .from('post_images')
        .delete()
        .eq('post_id', post.id)
        .eq('image_url', url)
      if (rowError) {
        setError(`Could not remove a photo: ${rowError.message}`)
        setSaving(false)
        return
      }
      const path = decodeURIComponent(url.split('/post-images/')[1] ?? '')
      if (path) await supabase.storage.from('post-images').remove([path])
    }

    
    const newUrls: string[] = []
    for (const file of newFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${userId}/${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file)
      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }
      newUrls.push(supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl)
    }

    if (newUrls.length > 0) {
      const { error: linkError } = await supabase
        .from('post_images')
        .insert(newUrls.map((image_url) => ({ post_id: post.id, image_url })))
      if (linkError) {
        setError(`Photos uploaded, but could not be linked: ${linkError.message}`)
        setSaving(false)
        return
      }
    }

    router.push(`/posts/${post.slug}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <label htmlFor="title" className="block text-sm text-[#2B2B2B]">Title</label>
      <input id="title" name="title" required defaultValue={post.title} className={field} />

      <label htmlFor="category_id" className="block text-sm text-[#2B2B2B]">Country / region</label>
      <select id="category_id" name="category_id" required defaultValue={post.category_id ?? ''} className={field}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label htmlFor="content" className="block text-sm text-[#2B2B2B]">Content</label>
      <textarea id="content" name="content" required rows={8} defaultValue={post.content} className={field} />

      <p className="block text-sm text-[#2B2B2B]">
        Photos ({kept.length + newFiles.length}/{MAX_FILES})
      </p>
      <div className="mb-3 mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {kept.map((url) => (
          <div key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Post photo" className="aspect-square w-full rounded-lg object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => setKept((prev) => prev.filter((u) => u !== url))}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#D85A30] text-sm font-bold text-white"
            >
              ×
            </button>
          </div>
        ))}
        {previews.map((src, i) => (
          <div key={src} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="New photo" className="aspect-square w-full rounded-lg object-cover ring-2 ring-[#E8914B]" />
            <button
              type="button"
              aria-label="Remove new photo"
              onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#D85A30] text-sm font-bold text-white"
            >
              ×
            </button>
            <span className="absolute bottom-1 left-1 rounded bg-[#E8914B] px-1.5 text-[10px] font-semibold text-white">
              New
            </span>
          </div>
        ))}
      </div>

      {kept.length + newFiles.length < MAX_FILES && (
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleNewFiles}
          className="mb-6 block w-full text-sm text-[#2B2B2B] file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8914B] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#E8914B] px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        <a href={`/posts/${post.slug}`} className="rounded-lg border border-[#8A8580] px-8 py-3 text-sm text-[#2B2B2B]">
          Cancel
        </a>
      </div>
    </form>
  )
}