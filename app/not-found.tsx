import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center bg-[#0a0a0a] px-4 pb-20 pt-28 text-center">
      <div className="mx-auto max-w-2xl">
        <Image src="/logo/emilio-savio.svg" alt="Emilio Savio" width={64} height={64} className="mx-auto h-14 w-14" />
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-gold">404 · Lost piece</p>
        <h1 className="mt-4 text-balance text-5xl font-serif font-semibold leading-[0.9] tracking-[-0.035em] text-cream md:text-7xl">
          This page is not in the collection.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-sm leading-7 text-cream/60 md:text-base">
          The piece you are looking for may have moved or left the collection. Return to our latest edit to continue exploring.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/#featured-products" className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-7 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-cream">
            Explore the collection
          </Link>
          <Link href="/" className="inline-flex min-h-12 items-center justify-center px-6 text-xs font-semibold uppercase tracking-[0.15em] text-cream/75 underline decoration-gold/60 underline-offset-8 hover:text-gold">
            Return home
          </Link>
        </div>
      </div>
    </div>
  )
}
