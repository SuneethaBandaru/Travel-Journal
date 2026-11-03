import Link from 'next/link'

type Category = { id: string; name: string; slug: string }

const base = 'rounded-full border px-4 py-1 text-sm'
const on = 'border-[#E8914B] bg-[#E8914B] text-white'
const off = 'border-[#8A8580] bg-white text-[#2B2B2B]'


export default function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: Category[]
  activeSlug?: string
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link href="/" className={`${base} ${!activeSlug ? on : off}`}>
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/category/${c.slug}`}
          className={`${base} ${activeSlug === c.slug ? on : off}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  )
}
