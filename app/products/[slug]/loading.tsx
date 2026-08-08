export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-black pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-7xl animate-pulse px-4 md:px-8">
        <div className="mb-8 h-3 w-44 rounded bg-cream/10" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          <div className="aspect-[4/5] rounded-2xl bg-cream/[0.06]" />
          <div className="space-y-6 md:pt-4">
            <div className="h-3 w-28 rounded bg-gold/20" />
            <div className="h-12 w-4/5 rounded bg-cream/10" />
            <div className="h-20 border-y border-gold/10 py-5">
              <div className="h-9 w-40 rounded bg-cream/10" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-full rounded bg-cream/[0.06]" />
              <div className="h-3 w-11/12 rounded bg-cream/[0.06]" />
              <div className="h-3 w-3/4 rounded bg-cream/[0.06]" />
            </div>
            <div className="h-14 rounded-full bg-gold/20" />
            <div className="h-14 rounded-full bg-cream/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  )
}
