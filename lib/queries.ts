import { supabase } from './supabase'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_price: number | null
  material: string
  category_id: string
  featured: boolean
  active: boolean
  product_images?: { url: string; position: number; alt: string | null }[]
}

export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  image_url: string | null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url, position, alt)')
    .eq('featured', true)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  if (error) {
    console.error('getFeaturedProducts:', error.message)
    return []
  }
  return data || []
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) {
    console.error('getCategories:', error.message)
    return []
  }
  return data || []
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!category) return []

  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url, position, alt)')
    .eq('category_id', category.id)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getProductsByCategory:', error.message)
    return []
  }
  return data || []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url, position, alt), product_variants(*)')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) {
    console.error('getProductBySlug:', error.message)
    return null
  }
  return data
}

export async function getRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url, position, alt)')
    .eq('category_id', categoryId)
    .eq('active', true)
    .neq('id', excludeId)
    .limit(4)

  if (error) return []
  return data || []
}

export function productImage(product: Product): string {
  const img = product.product_images?.sort((a, b) => a.position - b.position)[0]
  return img?.url || 'https://via.placeholder.com/600x600/0A0A0A/C9A97D?text=Emilio+Savio'
}
