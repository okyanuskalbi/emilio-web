import { createClient } from '@supabase/supabase-js'
import { getSupabasePublicConfig } from './supabase/config'

const { url: supabaseUrl, publishableKey: supabaseKey } = getSupabasePublicConfig()
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PRODUCT_MODEL_IMAGE_BY_SLUG: Record<string, string> = {
  'gold-cuban-chain-bracelet': '/images/products/gold-cuban-chain-bracelet-model.webp',
  'sterling-silver-curb-bracelet': '/images/products/sterling-silver-curb-bracelet-model.webp',
  'ceramic-diamond-bracelet': '/images/products/ceramic-diamond-bracelet-model.webp',
  'diamond-pendant-necklace': '/images/products/diamond-pendant-necklace-model.webp',
  'cuban-curb-chain-necklace': '/images/products/cuban-curb-chain-necklace-model.webp',
  'signet-onyx-ring': '/images/products/signet-onyx-ring-model.webp',
  'pearl-drop-earrings': '/images/products/pearl-drop-earrings-model.webp',
  'custom-engraved-cuff': '/images/products/custom-engraved-cuff-model.webp',
  'diamond-band-ring': '/images/products/diamond-band-ring-model.webp',
  'gold-huggie-earrings': '/images/products/gold-huggie-earrings-model.webp',
}

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
  const currentResult = await supabase
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, verified_purchase, created_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!currentResult.error) {
    return (currentResult.data || []) as ProductReview[]
  }

  // Keep the storefront readable while older installations await the reviews migration.
  if (currentResult.error.message.includes('verified_purchase')) {
    const legacyResult = await supabase
      .from('reviews')
      .select('id, product_id, author_name, rating, title, body, created_at')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!legacyResult.error) {
      return (legacyResult.data || []).map((review) => ({
        ...review,
        verified_purchase: false,
      })) as ProductReview[]
    }
  }

  console.error('getApprovedReviewsForProduct:', currentResult.error.message)
  return []
}

export async function getFeaturedReviews(limit = 9): Promise<FeaturedReview[]> {
  const currentResult = await supabase
    .from('reviews')
    .select('id, product_id, author_name, rating, title, body, verified_purchase, created_at, product:products(name, slug)')
    .eq('status', 'approved')
    .order('approved_at', { ascending: false })
    .limit(limit)

  let reviewRows: Array<Record<string, unknown>> | null = currentResult.data as Array<Record<string, unknown>> | null

  if (currentResult.error?.message.includes('verified_purchase') || currentResult.error?.message.includes('approved_at')) {
    const legacyResult = await supabase
      .from('reviews')
      .select('id, product_id, author_name, rating, title, body, created_at, product:products(name, slug)')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (legacyResult.error) {
      console.error('getFeaturedReviews:', legacyResult.error.message)
      return []
    }

    reviewRows = (legacyResult.data || []).map((review) => ({
      ...review,
      verified_purchase: false,
    })) as Array<Record<string, unknown>>
  } else if (currentResult.error) {
    console.error('getFeaturedReviews:', currentResult.error.message)
    return []
  }

  return (reviewRows || []).map((review) => ({
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
  const baseImages = imgs.length ? imgs : [productImage(product)]
  const modelImage = PRODUCT_MODEL_IMAGE_BY_SLUG[product.slug]
  return modelImage && !baseImages.includes(modelImage) ? [...baseImages, modelImage] : baseImages
}
