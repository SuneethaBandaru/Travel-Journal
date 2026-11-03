'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'

type Props = {
  userId: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

const MAX_SIZE_MB = 2
const field =
  'mb-4 mt-1 w-full rounded-lg border border-[#8A8580] bg-white px-3 py-3 text-sm text-[#2B2B2B]'

export default function SettingsForm({ userId, email, firstName, lastName, avatarUrl }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null
    setSaved(false)
    if (!picked) return
    if (!picked.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      e.target.value = ''
      return
    }
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`The picture must be smaller than ${MAX_SIZE_MB} MB.`)
      e.target.value = ''
      return
    }
    setError(null)
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const first_name = String(form.get('first_name') ?? '').trim()
    const last_name = String(form.get('last_name') ?? '').trim()

    setSaving(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()
    let avatar_url = avatarUrl

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${userId}/${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file)
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }
      avatar_url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    }

    const { error: saveError } = await supabase
      .from('profiles')
      .upsert({ id: userId, first_name, last_name, avatar_url })

    setSaving(false)
    if (saveError) {
      setError(saveError.message)
      return
    }

    setFile(null)
    setSaved(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Settings saved.</p>
      )}

      <div className="mb-6 flex items-center gap-4">
        <Avatar url={preview} name={`${firstName} ${email}`} size={72} />
        <div>
          <label htmlFor="avatar" className="block text-sm text-[#2B2B2B]">Profile picture</label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="mt-1 block text-sm text-[#2B2B2B] file:mr-3 file:rounded-lg file:border-0 file:bg-[#E8914B] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </div>
      </div>

      <label htmlFor="first_name" className="block text-sm text-[#2B2B2B]">First name</label>
      <input id="first_name" name="first_name" defaultValue={firstName} className={field} />

      <label htmlFor="last_name" className="block text-sm text-[#2B2B2B]">Last name</label>
      <input id="last_name" name="last_name" defaultValue={lastName} className={field} />

      <label htmlFor="email" className="block text-sm text-[#2B2B2B]">Email</label>
      <input id="email" value={email} disabled className={`${field} opacity-60`} />

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[#E8914B] px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
