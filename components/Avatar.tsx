export default function Avatar({
  url,
  name,
  size = 32,
}: {
  url?: string | null
  name?: string | null
  size?: number
}) {
  const initial = (name?.trim()[0] ?? '?').toUpperCase()
  const style = { width: size, height: size, fontSize: size * 0.4 }

  if (url) {
    
    return <img src={url} alt={name ?? 'Avatar'} style={style} className="shrink-0 rounded-full object-cover" />
  }
  return (
    <div
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#2D6A6A] font-semibold text-white"
    >
      {initial}
    </div>
  )
}
