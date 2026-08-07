'use client'

import { useState } from 'react'

interface ParsedRow {
  name: string
  price: number
  compare_price?: number
  material: string
  category: string
  description?: string
  active: boolean
  has_variants: boolean
  variants?: string
}

const HEADER_ALIASES = {
  name: ['Ürün Adı', 'name', 'Name'],
  price: ['Fiyat', 'price', 'Price'],
  comparePrice: ['Eski Fiyat', 'compare_price'],
  material: ['Materyal', 'material', 'Material'],
  category: ['Kategori', 'category', 'Category'],
  description: ['Açıklama', 'description'],
  active: ['Ürün Aktif', 'active', 'Active'],
  hasVariants: ['Varyasyon Kullan', 'Varyasyon Var mı?', 'has_variants', 'Has Variants'],
  variants: ['Varyasyonlar', 'variants', 'Variations'],
} as const

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(value.trim())
      value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(value.trim())
      if (row.some((cell) => cell !== '')) rows.push(row)
      row = []
      value = ''
    } else {
      value += char
    }
  }

  row.push(value.trim())
  if (row.some((cell) => cell !== '')) rows.push(row)
  return rows
}

function columnIndex(headers: string[], aliases: readonly string[]) {
  return headers.findIndex((header) => aliases.includes(header))
}

function parseBooleanCell(value: unknown, defaultValue = false) {
  const normalized = String(value ?? '').trim().toLocaleLowerCase('tr-TR')
  if (!normalized) return defaultValue
  return ['evet', 'yes', 'true', '1', 'x'].includes(normalized)
}

function parseRows(matrix: readonly (readonly unknown[])[]): ParsedRow[] {
  const [rawHeaders, ...dataRows] = matrix
  if (!rawHeaders) return []
  const headers = rawHeaders.map((cell) => String(cell || '').trim().replace(/^\uFEFF/, ''))
  const indices = {
    name: columnIndex(headers, HEADER_ALIASES.name),
    price: columnIndex(headers, HEADER_ALIASES.price),
    comparePrice: columnIndex(headers, HEADER_ALIASES.comparePrice),
    material: columnIndex(headers, HEADER_ALIASES.material),
    category: columnIndex(headers, HEADER_ALIASES.category),
    description: columnIndex(headers, HEADER_ALIASES.description),
    active: columnIndex(headers, HEADER_ALIASES.active),
    hasVariants: columnIndex(headers, HEADER_ALIASES.hasVariants),
    variants: columnIndex(headers, HEADER_ALIASES.variants),
  }

  return dataRows.map((cells) => ({
    name: String(cells[indices.name] || '').trim(),
    price: Number(cells[indices.price] || 0),
    compare_price: indices.comparePrice >= 0 && cells[indices.comparePrice] !== null && cells[indices.comparePrice] !== ''
      ? Number(cells[indices.comparePrice])
      : undefined,
    material: String(cells[indices.material] || '').trim(),
    category: String(cells[indices.category] || 'bracelets').trim(),
    description: indices.description >= 0 ? String(cells[indices.description] || '').trim() : '',
    active: indices.active < 0 || parseBooleanCell(cells[indices.active], true),
    has_variants: indices.hasVariants >= 0 && parseBooleanCell(cells[indices.hasVariants]),
    variants: indices.variants >= 0 ? String(cells[indices.variants] || '').trim() : '',
  })).filter((row) => row.name && Number.isFinite(row.price) && row.price > 0)
}

export default function ImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [status, setStatus] = useState<string>('')
  const [importing, setImporting] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setStatus('Dosya en fazla 5 MB olabilir.')
      return
    }

    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv'
      const matrix = isCsv
        ? parseCsv(await file.text())
        : await import('read-excel-file/browser').then(({ readSheet }) => readSheet(file))
      const parsed = parseRows(matrix)
      setRows(parsed)
      setStatus(`${parsed.length} ürün okundu. İçe aktarmaya hazır.`)
    } catch {
      setStatus('Dosya okunamadı. Lütfen geçerli bir XLSX veya CSV dosyası seçin.')
    }
  }

  const downloadTemplate = async () => {
    const sheet = [
      ['Ürün Adı', 'Fiyat', 'Eski Fiyat', 'Materyal', 'Kategori', 'Açıklama', 'Ürün Aktif', 'Varyasyon Kullan', 'Varyasyonlar'],
      ['Örnek Bileklik', 1200, 1500, 'Gold Vermeil', 'bracelets', 'Varyasyonsuz ürün örneği', 'Evet', 'Hayır', ''],
      ['Örnek Yüzük', 12500, 14500, '14 Ayar Altın', 'rings', 'Varyasyonlu ürün örneği', 'Evet', 'Evet', 'Yüzük ölçüsü=14; Karat=0,50 ct; Stok=3; SKU=YZ-14-050; Fiyat=12500 | Yüzük ölçüsü=15; Karat=0,50 ct; Stok=2; SKU=YZ-15-050; Fiyat=12500'],
    ]
    const { default: writeXlsxFile } = await import('write-excel-file/browser')
    await writeXlsxFile(sheet, { sheet: 'Ürünler' }).toFile('emilio-urun-sablonu.xlsx')
  }

  const doImport = async () => {
    setImporting(true)
    setStatus('İçe aktarılıyor...')

    try {
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await response.json()
      if (!response.ok) {
        setStatus(`Hata: ${data.error || 'İçe aktarma tamamlanamadı.'}`)
        return
      }
      setStatus(`✓ ${data.imported}/${rows.length} ürün ve ${data.variants || 0} varyasyon başarıyla eklendi.`)
      setRows([])
    } catch {
      setStatus('Hata: İçe aktarma isteği tamamlanamadı.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-cream mb-2">Excel ile Ürün İçe Aktarma</h1>
      <p className="text-cream/60 text-sm mb-8">
        XLSX veya CSV dosyanızı yükleyin. Her satırda “Varyasyon Kullan” alanını Evet/Hayır olarak işaretleyin; yalnızca Evet seçilen satırlarda varyasyon tanımı zorunludur.
      </p>

      <div className="mb-8 border border-gold/20 bg-cream/[0.03] p-4 text-sm text-cream/70">
        <p className="mb-2 font-medium text-gold">Varyasyonlar hücresi örneği</p>
        <code className="block overflow-x-auto whitespace-nowrap text-xs text-cream/80">
          Yüzük ölçüsü=14; Karat=0,50 ct; Stok=3; SKU=YZ-14-050; Fiyat=12500 | Yüzük ölçüsü=15; Karat=0,50 ct; Stok=2; SKU=YZ-15-050; Fiyat=12500
        </code>
        <p className="mt-2 text-xs text-cream/45">Her “|” işareti yeni bir stok/SKU kombinasyonu başlatır. Varyasyonsuz ürün için “Varyasyon Kullan” hücresini Hayır seçin ve varyasyon hücresini boş bırakın.</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={downloadTemplate}
          className="px-6 py-3 border border-gold text-gold rounded-md hover:bg-gold hover:text-black transition-colors text-sm uppercase tracking-wider">
          ↓ Excel Şablonu İndir
        </button>
        <label className="px-6 py-3 bg-gold text-black rounded-md cursor-pointer hover:bg-gold/80 transition-colors text-sm uppercase tracking-wider">
          Dosya Seç
          <input type="file" accept=".xlsx,.csv" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {status && <p className="text-gold text-sm mb-4">{status}</p>}

      {rows.length > 0 && (
        <div>
          <div className="overflow-x-auto border border-gold/20 rounded-lg mb-6">
            <table className="w-full text-sm">
              <thead className="bg-cream/5">
                <tr className="text-left text-cream/60 uppercase text-xs tracking-wider">
                  <th className="p-3">Ürün</th>
                  <th className="p-3">Fiyat</th>
                  <th className="p-3">Materyal</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Varyasyon kullan</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t border-cream/10 text-cream">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.price.toLocaleString('tr-TR')} ₺</td>
                    <td className="p-3">{r.material}</td>
                    <td className="p-3">{r.category}</td>
                    <td className="p-3 max-w-72 truncate text-cream/60">{r.has_variants ? r.variants || 'Eksik tanım' : 'Hayır'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 20 && <p className="text-cream/40 text-xs mb-4">... ve {rows.length - 20} ürün daha</p>}

          <button onClick={doImport} disabled={importing}
            className="px-8 py-3 bg-gold text-black font-semibold rounded-md hover:bg-gold/80 transition-colors uppercase tracking-wider disabled:opacity-50">
            {importing ? 'Aktarılıyor...' : `${rows.length} Ürünü İçe Aktar`}
          </button>
        </div>
      )}
    </div>
  )
}
