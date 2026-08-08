export default function CollectionLoading() {
  return (
    <div className="min-h-screen bg-black pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-7xl animate-pulse px-4 md:px-8">
        <div className="h-3 w-36 rounded bg-cream/10" />
        <div className="mt-8 h-14 w-72 max-w-full rounded bg-cream/10" />
        <div className="mt-4 h-1 w-24 bg-gold/30" />
        <div className="mt-10 flex gap-2 border-b border-cream/10 pb-5">
          {[1, 2, 3, 4].map((item) => <span key={item} className="h-9 w-24 rounded-full bg-cream/[0.06]" />)}
        </div>
        <div className="mt-8 grid grid-cols-1 gap-x-4 gap-y-7 min-[360px]:grid-cols-2 md:grid-cols-3 md:gap-7 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item}>
              <div className="aspect-[4/5] rounded-2xl bg-cream/[0.06]" />
              <div className="mt-4 h-3 w-24 rounded bg-gold/15" />
              <div className="mt-3 h-6 w-4/5 rounded bg-cream/10" />
              <div className="mt-4 h-5 w-28 rounded bg-cream/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
