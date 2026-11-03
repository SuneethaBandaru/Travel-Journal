'use client'

import { createContext, useActionState, useContext, useRef, useState } from 'react'
import { addComment, type CommentState } from '@/app/posts/actions'

type Target = { id: string; name: string } | null

const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😎', '🤩', '😮', '😢',
  '🙏', '👍', '👏', '🔥', '❤️', '✨', '🎉', '💯',
  '🌍', '✈️', '🏖️', '🏔️', '🌅', '📸', '🍜', '🍕',
]

type ReplyState = {
  target: Target
  setTarget: (t: Target) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

const ReplyCtx = createContext<ReplyState | null>(null)

function useReply() {
  const ctx = useContext(ReplyCtx)
  if (!ctx) throw new Error('Reply components must be inside <ReplyProvider>')
  return ctx
}

export function ReplyProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<Target>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  return <ReplyCtx.Provider value={{ target, setTarget, inputRef }}>{children}</ReplyCtx.Provider>
}


export function ReplyButton({ id, name }: { id: string; name: string }) {
  const { setTarget, inputRef } = useReply()
  return (
    <button
      type="button"
      onClick={() => {
        setTarget({ id, name })
        inputRef.current?.focus()
      }}
      className="font-semibold hover:text-[#2B2B2B]"
    >
      Reply
    </button>
  )
}


export function CommentForm({ postId, slug }: { postId: string; slug: string }) {
  const { target, setTarget, inputRef } = useReply()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    async (_prev: CommentState, formData: FormData): Promise<CommentState> => {
      const result = await addComment(formData)
      if (!result.error) setTarget(null)
      return result
    },
    { error: null }
  )

  
  function addEmoji(emoji: string) {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    el.setRangeText(emoji, start, end, 'end')
    el.focus()
    setPickerOpen(false)
  }

  return (
    <div className="relative">
      {target && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-[#FAF7F2] px-3 py-1.5 text-xs text-[#5F5E5A]">
          <span>
            Replying to <span className="font-semibold">{target.name}</span>
          </span>
          <button
            type="button"
            aria-label="Cancel reply"
            onClick={() => setTarget(null)}
            className="text-base leading-none text-[#8A8580] hover:text-[#2B2B2B]"
          >
            ×
          </button>
        </div>
      )}
      <form
        action={formAction}
        className="flex gap-2"
      >
        <input type="hidden" name="post_id" value={postId} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="parent_id" value={target?.id ?? ''} />
        <input
          ref={inputRef}
          name="content"
          required
          maxLength={1000}
          placeholder={target ? `Reply to ${target.name}…` : 'Add a comment…'}
          className="min-w-0 flex-1 rounded-full border border-[#8A8580] px-4 py-2 text-sm"
        />
        <button
          type="button"
          aria-label="Add emoji"
          onClick={() => setPickerOpen((o) => !o)}
          className="text-xl leading-none"
        >
          😊
        </button>
        <button disabled={pending} className="text-sm font-semibold text-[#E8914B] disabled:opacity-50">
          {pending ? 'Posting…' : 'Post'}
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs text-red-700">{state.error}</p>}

      {pickerOpen && (
        <div className="absolute bottom-full right-0 mb-2 grid grid-cols-8 gap-1 rounded-lg border border-[#D3D1C7] bg-white p-2 shadow-lg">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="rounded p-1 text-xl leading-none hover:bg-[#FAF7F2]"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}