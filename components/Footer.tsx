import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#D3D1C7] bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold text-[#2B2B2B]">
            ✈ Travel Journal
          </p>
          <p className="mt-2 text-sm text-[#8A8580]">
            Share your trips, photos and stories with fellow travelers around
            the world.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8580]">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#2B2B2B]">
            <li>
              <Link href="/" className="hover:text-[#E8914B]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/posts/new" className="hover:text-[#E8914B]">
                Write a post
              </Link>
            </li>
            <li>
              <Link href="/my-posts" className="hover:text-[#E8914B]">
                My posts
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8A8580]">
            Account
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[#2B2B2B]">
            <li>
              <Link href="/login" className="hover:text-[#E8914B]">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-[#E8914B]">
                Register
              </Link>
            </li>
            <li>
              <Link href="/settings" className="hover:text-[#E8914B]">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#D3D1C7] py-4 text-center text-xs text-[#8A8580]">
        © {new Date().getFullYear()} Travel Journal
      </div>
    </footer>
  );
}
