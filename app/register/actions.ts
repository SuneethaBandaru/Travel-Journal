'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function register(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || password.length < 6) {
    redirect(
      '/register?error=' +
        encodeURIComponent('Enter an email and a password of at least 6 characters.')
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  await supabase.auth.signOut()
  redirect('/register/success')
}