'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from './ProductCard'

interface FilterProduct {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  images?: string[]
  material: string
}

type SortOption = 'featured' | 'price-asc' | 'price-desc'

export function CollectionFilter({ products }: { products: FilterProduct[] }) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all')
  const [sort, setSort] = useState<SortOption>('featured')

  const materials = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.material)))],
    [products]
  )

  const filtered = useMemo(() => {
    let result = products
    if (selectedMaterial !== 'all') {
      result = result.filter((p) => p.material === selectedMaterial)
    }
    if (sort === 'price-asc') result = [...result].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    return result
  }, [products, selectedMaterial, sort])

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-4 border-b border-gold/20 pb-4 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          {materials.map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => setSelectedMaterial(mat)}
              aria-pressed={selectedMaterial === mat}
              className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                selectedMaterial === mat
                  ? 'bg-gold text-black border-gold'
                  : 'bg-transparent text-cream/70 border-cream/20 hover:border-gold'
              }`}
            >
              {mat === 'all' ? 'All' : mat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p aria-live="polite" className="shrink-0 text-xs text-cream/45">{filtered.length} {filtered.length === 1 ? 'item' : 'items'}</p>
          <label className="sr-only" htmlFor="collection-sort">Sort products</label>
          <select
            id="collection-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="min-h-11 rounded-full border border-cream/20 bg-black px-4 py-2 text-sm text-cream outline-none focus:border-gold"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-2xl text-cream">No products match this filter</p>
          <p className="mt-2 text-sm text-cream/50">Clear the filter to explore the other materials.</p>
          <button type="button" onClick={() => setSelectedMaterial('all')} className="mt-6 min-h-11 rounded-full border border-gold px-6 text-xs font-bold uppercase tracking-[0.14em] text-gold hover:bg-gold hover:text-black">Clear filter</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 min-[360px]:grid-cols-2 md:gap-x-7 md:gap-y-10 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}
