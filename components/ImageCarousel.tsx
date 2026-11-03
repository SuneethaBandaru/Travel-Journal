"use client";

import { useRef, useState } from "react";

export default function ImageCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function goTo(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const el = ref.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center bg-[#D3D1C7] text-sm text-[#5F5E5A]">
        No photo
      </div>
    );
  }

  const arrow =
    "absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-lg text-[#2B2B2B] shadow hover:bg-white";

  return (
    <div className="relative aspect-square bg-[#D3D1C7]">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={alt}
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white">
            {index + 1}/{images.length}
          </span>

          {index > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => goTo(index - 1)}
              className={`${arrow} left-3`}
            >
              ‹
            </button>
          )}
          {index < images.length - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => goTo(index + 1)}
              className={`${arrow} right-3`}
            >
              ›
            </button>
          )}

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-[#E8914B]" : "bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
