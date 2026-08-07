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
        <div className="flex flex-wrap gap-2">
          {materials.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`px-4 py-1.5 text-xs uppercase tracking-wider transition-colors rounded-full border ${
                selectedMaterial === mat
                  ? 'bg-gold text-black border-gold'
                  : 'bg-transparent text-cream/70 border-cream/20 hover:border-gold'
              }`}
            >
              {mat === 'all' ? 'All' : mat}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="bg-black border border-cream/20 text-cream text-sm px-4 py-2 rounded-full focus:border-gold outline-none"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-cream/50 text-center py-20">No products found for this filter.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:gap-x-7 md:gap-y-10 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}
