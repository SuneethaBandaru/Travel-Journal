import Avatar from '@/components/Avatar'
import ConfirmButton from '@/components/ConfirmButton'
import { ReplyButton } from '@/components/ReplyContext'
import { deleteComment } from '@/app/posts/actions'
import { fullName, timeAgo, type ProfileLite } from '@/lib/format'

export type CommentRow = {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_comment_id: string | null
}

type Props = {
  parentId: string | null
  byParent: Record<string, CommentRow[]>
  authors: Record<string, ProfileLite>
  userId: string | null
  postId: string
  postOwnerId: string
  slug: string
  depth?: number
}

export default function CommentThread({
  parentId,
  byParent,
  authors,
  userId,
  postId,
  postOwnerId,
  slug,
  depth = 0,
}: Props) {
  const items = byParent[parentId ?? 'root'] ?? []
  if (items.length === 0) return null

  return (
    <ul className={depth > 0 && depth < 3 ? 'ml-6 mt-3 space-y-4' : 'space-y-4'}>
      {items.map((c) => {
        const author = authors[c.user_id]
        const name = fullName(author)
        const canDelete = userId === c.user_id || userId === postOwnerId

        return (
          <li key={c.id}>
            <div className="flex gap-2">
              <Avatar url={author?.avatar_url} name={name} size={28} />
              <div className="min-w-0 flex-1">
                <p className="wrap-break-word text-sm text-[#2B2B2B]">
                  <span className="font-semibold">{name}</span> {c.content}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-[#8A8580]">
                  <span>{timeAgo(c.created_at)}</span>
                  {userId && <ReplyButton id={c.id} name={name} />}
                  {canDelete && (
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <ConfirmButton
                        message="Delete this comment (and its replies)?"
                        className="font-semibold text-[#D85A30]"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  )}
                </div>

                <CommentThread
                  parentId={c.id}
                  byParent={byParent}
                  authors={authors}
                  userId={userId}
                  postId={postId}
                  postOwnerId={postOwnerId}
                  slug={slug}
                  depth={depth + 1}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}