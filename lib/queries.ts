import { createClient } from '@supabase/supabase-js'
import { getSupabasePublicConfig } from './supabase/config'

const { url: supabaseUrl, publishableKey: supabaseKey } = getSupabasePublicConfig()
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

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
  product_variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  options?: Record<string, string> | null
  size?: string | null
  color?: string | null
  material?: string | null
  stock_count: number
  price_override: number | null
  sku: string
  active?: boolean | null
}

export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  image_url: string | null
}

export interface ProductReview {
  id: string
  product_id: string
  author_name: string
  rating: number
  title: string | null
  body: string
  verified_purchase: boolean
  created_at: string
}

export interface FeaturedReview extends ProductReview {
  product: { name: string; slug: string } | null
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(url, position, alt)')
    .eq('featured', true)
    .eq('active', true)
    .order('sort_order', { ascending: true })
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
    .order('sort_order', { ascending: true })

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

export async function getApprovedReviewsForProduct(productId: string, limit = 24): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, verified_purchase, created_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getApprovedReviewsForProduct:', error.message)
    return []
  }
  return (data || []) as ProductReview[]
}

export async function getFeaturedReviews(limit = 9): Promise<FeaturedReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, verified_purchase, created_at, product:products(name, slug)')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getFeaturedReviews:', error.message)
    return []
  }

  return (data || []).map((review) => ({
    ...review,
    product: Array.isArray(review.product) ? review.product[0] || null : review.product || null,
  })) as FeaturedReview[]
}

export async function getAllProductSlugs(): Promise<{ slug: string; updated: string }[]> {
  const { data, error } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('active', true)
  if (error) return []
  return (data || []).map((p) => ({ slug: p.slug, updated: p.created_at }))
}

export function productImage(product: Product): string {
  const img = product.product_images?.sort((a, b) => a.position - b.position)[0]
  return img?.url || 'https://via.placeholder.com/600x600/0A0A0A/C9A97D?text=Emilio+Savio'
}

export function productImages(product: Product): string[] {
  const imgs = (product.product_images || [])
    .sort((a, b) => a.position - b.position)
    .map((i) => i.url)
  return imgs.length ? imgs : [productImage(product)]
}
