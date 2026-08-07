export type VariantOptions = Record<string, string>

export interface VariantLike {
  options?: unknown
  size?: string | null
  color?: string | null
  material?: string | null
}

export interface ParsedVariantImport {
  options: VariantOptions
  stock_count: number
  sku: string
  price_override: number | null
  active: boolean
}

const CONTROL_FIELDS = new Map([
  ['stok', 'stock_count'],
  ['stock', 'stock_count'],
  ['sku', 'sku'],
  ['fiyat', 'price_override'],
  ['price', 'price_override'],
  ['fiyat farki', 'price_override'],
  ['fiyat farkı', 'price_override'],
  ['price override', 'price_override'],
  ['aktif', 'active'],
  ['active', 'active'],
])

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizedKey(value: string) {
  return value.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim()
}

export function normalizeVariantOptions(value: unknown): VariantOptions {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const options: VariantOptions = {}
  for (const [rawName, rawValue] of Object.entries(value)) {
    const name = cleanText(rawName, 48)
    const optionValue = cleanText(rawValue, 96)
    if (name && optionValue && Object.keys(options).length < 6) options[name] = optionValue
  }
  return options
}

/** Keeps legacy size/color/material variants visible after the flexible schema ships. */
export function variantOptionsFromRecord(variant: VariantLike): VariantOptions {
  const options = normalizeVariantOptions(variant.options)
  if (Object.keys(options).length) return options

  const legacyOptions: VariantOptions = {}
  if (variant.size?.trim()) legacyOptions['Ölçü'] = variant.size.trim()
  if (variant.color?.trim()) legacyOptions['Renk'] = variant.color.trim()
  if (variant.material?.trim()) legacyOptions['Materyal'] = variant.material.trim()
  return legacyOptions
}

export function formatVariantOptions(options: VariantOptions) {
  return Object.entries(options).map(([name, value]) => `${name}: ${value}`).join(' · ')
}

function parsePositiveInteger(value: string) {
  const number = Number(value.replace(',', '.'))
  return Number.isInteger(number) && number >= 0 && number <= 1_000_000 ? number : null
}

function parsePrice(value: string) {
  const number = Number(value.replace(',', '.'))
  return Number.isFinite(number) && number >= 0 && number <= 10_000_000 ? number : null
}

function parseBoolean(value: string) {
  const normalized = normalizedKey(value)
  if (['evet', 'yes', 'true', '1', 'x'].includes(normalized)) return true
  if (['hayır', 'hayir', 'no', 'false', '0'].includes(normalized)) return false
  return null
}

/**
 * Excel syntax:
 * Yüzük ölçüsü=14; Karat=0,50 ct; Stok=3; SKU=YZ-14-050; Fiyat=1250 |
 * Yüzük ölçüsü=15; Karat=0,50 ct; Stok=2; SKU=YZ-15-050; Fiyat=1250
 */
export function parseVariantImport(value: unknown): { variants: ParsedVariantImport[]; error?: string } {
  const raw = cleanText(value, 20_000)
  if (!raw) return { variants: [] }

  const variants: ParsedVariantImport[] = []
  const segments = raw.split('|').map((segment) => segment.trim()).filter(Boolean)
  if (segments.length > 100) return { variants: [], error: 'Bir üründe en fazla 100 varyant olabilir.' }

  for (const segment of segments) {
    const options: VariantOptions = {}
    let stockCount: number | null = null
    let sku = ''
    let priceOverride: number | null = null
    let active = true

    for (const field of segment.split(';').map((entry) => entry.trim()).filter(Boolean)) {
      const separator = field.indexOf('=')
      if (separator <= 0) return { variants: [], error: `“${field}” için Anahtar=Değer biçimini kullanın.` }

      const name = cleanText(field.slice(0, separator), 48)
      const fieldValue = cleanText(field.slice(separator + 1), 96)
      if (!name || !fieldValue) return { variants: [], error: 'Boş varyasyon adı veya değeri kullanılamaz.' }

      const control = CONTROL_FIELDS.get(normalizedKey(name))
      if (control === 'stock_count') {
        stockCount = parsePositiveInteger(fieldValue)
        if (stockCount === null) return { variants: [], error: 'Stok, 0 ile 1.000.000 arasında tam sayı olmalı.' }
      } else if (control === 'sku') {
        sku = cleanText(fieldValue, 100)
      } else if (control === 'price_override') {
        priceOverride = parsePrice(fieldValue)
        if (priceOverride === null) return { variants: [], error: 'Varyant fiyatı geçerli bir sayı olmalı.' }
      } else if (control === 'active') {
        const activeValue = parseBoolean(fieldValue)
        if (activeValue === null) return { variants: [], error: 'Aktif alanı Evet veya Hayır olmalı.' }
        active = activeValue
      } else if (Object.keys(options).length < 6) {
        options[name] = fieldValue
      }
    }

    if (!Object.keys(options).length) return { variants: [], error: 'Her varyantta en az bir seçenek olmalı.' }
    if (stockCount === null) return { variants: [], error: 'Her varyant için Stok alanı gerekli.' }
    if (!sku) return { variants: [], error: 'Her varyant için SKU alanı gerekli.' }
    variants.push({ options, stock_count: stockCount, sku, price_override: priceOverride, active })
  }

  return { variants }
}
