'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Category = { id: string; name: string }

const MAX_FILES = 5
const MAX_SIZE_MB = 5

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function NewPostForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    let problem: string | null = null

    if (picked.length > MAX_FILES) {
      problem = `You can add up to ${MAX_FILES} photos.`
    } else if (picked.some((f) => !f.type.startsWith('image/'))) {
      problem = 'Only image files are allowed.'
    } else if (picked.some((f) => f.size > MAX_SIZE_MB * 1024 * 1024)) {
      problem = `Each photo must be smaller than ${MAX_SIZE_MB} MB.`
    }

    if (problem) {
      setError(problem)
      setFiles([])
      e.target.value = ''
      return
    }

    setError(null)
    setFiles(picked)
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
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      router.push('/login')
      return
    }

    
    const imageUrls: string[] = []
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, file)

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }

      imageUrls.push(supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl)
    }
  
    
    const slug = `${slugify(title) || 'post'}-${Math.random().toString(36).slice(2, 7)}`
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({ title, content, slug, user_id: user.id, category_id: categoryId })
      .select('id, slug')
      .single()

    if (postError || !post) {
      setError(postError?.message ?? 'Could not save the post.')
      setSaving(false)
      return
    }

    if (imageUrls.length > 0) {
      const { error: imagesError } = await supabase
        .from('post_images')
        .insert(imageUrls.map((image_url) => ({ post_id: post.id, image_url })))

      if (imagesError) {
        setError(`Post saved, but the photos could not be linked: ${imagesError.message}`)
        setSaving(false)
        return
      }
    }

    router.push(`/posts/${post.slug}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <label htmlFor="title" className="block text-sm text-[#2B2B2B]">
        Title
      </label>
      <input
        id="title"
        name="title"
        type="text"
        required
        className="mb-4 mt-1 w-full rounded-lg border border-[#8A8580] bg-white px-3 py-3 text-sm text-[#2B2B2B]"
      />

      <label htmlFor="category_id" className="block text-sm text-[#2B2B2B]">
        Country / region
      </label>
      <select
        id="category_id"
        name="category_id"
        required
        defaultValue=""
        className="mb-4 mt-1 w-full rounded-lg border border-[#8A8580] bg-white px-3 py-3 text-sm text-[#2B2B2B]"
      >
        <option value="" disabled>
          Choose a country
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <label htmlFor="content" className="block text-sm text-[#2B2B2B]">
        Content
      </label>
      <textarea
        id="content"
        name="content"
        required
        rows={8}
        className="mb-4 mt-1 w-full rounded-lg border border-[#8A8580] bg-white px-3 py-3 text-sm text-[#2B2B2B]"
      />

      <label htmlFor="photos" className="block text-sm text-[#2B2B2B]">
        Photos (up to {MAX_FILES}, {MAX_SIZE_MB} MB each)
      </label>
      <input
        id="photos"
        name="photos"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="mb-2 mt-1 block w-full text-sm text-[#2B2B2B] file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8914B] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
      {files.length > 0 && (
        <ul className="mb-4 text-xs text-[#8A8580]">
          {files.map((f) => (
            <li key={f.name + f.size}>{f.name}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-lg bg-[#E8914B] px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Publishing...' : 'Publish'}
      </button>
    </form>
  )
}