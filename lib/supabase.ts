import { createClient } from '@supabase/supabase-js'

// Fallback: public Supabase değerleri (anon/publishable key zaten tarayıcıya
// açık, güvenliği RLS sağlar). Env varsa o kullanılır; yoksa build patlamaz.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhonnaajslctnvjhhlgc.supabase.co'
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_aUuLwpdCtMWZ3NF4G9yU6Q_X217NoW8'

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
          image_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      products: {
        Row: {
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
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Row']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          position: number
          alt: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_images']['Row']>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string | null
          color: string | null
          material: string | null
          stock_count: number
          price_override: number | null
          sku: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_variants']['Row']>
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total: number
          shipping_address: string
          payment_provider: 'paytr' | 'iyzico'
          payment_ref: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Row']>
      }
    }
  }
}
