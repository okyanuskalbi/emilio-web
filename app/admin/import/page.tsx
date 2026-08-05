'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'

interface ParsedRow {
  name: string
  price: number
  compare_price?: number
  material: string
  category: string
  description?: string
}

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function ImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [status, setStatus] = useState<string>('')
  const [importing, setImporting] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

      const parsed: ParsedRow[] = json.map((r) => ({
        name: String(r['Ürün Adı'] || r['name'] || r['Name'] || ''),
        price: Number(r['Fiyat'] || r['price'] || r['Price'] || 0),
        compare_price: r['Eski Fiyat'] || r['compare_price'] ? Number(r['Eski Fiyat'] || r['compare_price']) : undefined,
        material: String(r['Materyal'] || r['material'] || r['Material'] || ''),
        category: String(r['Kategori'] || r['category'] || r['Category'] || 'bracelets'),
        description: String(r['Açıklama'] || r['description'] || ''),
      })).filter((r) => r.name && r.price)

      setRows(parsed)
      setStatus(`${parsed.length} ürün okundu. İçe aktarmaya hazır.`)
    }
    reader.readAsArrayBuffer(file)
  }

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Ürün Adı': 'Örnek Bileklik', 'Fiyat': 1200, 'Eski Fiyat': 1500, 'Materyal': 'Gold Vermeil', 'Kategori': 'bracelets', 'Açıklama': 'Ürün açıklaması' },
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Ürünler')
    XLSX.writeFile(wb, 'emilio-urun-sablonu.xlsx')
  }

  const doImport = async () => {
    setImporting(true)
    setStatus('İçe aktarılıyor...')

    // Kategori slug → id map
    const { data: cats } = await supabase.from('categories').select('id, slug')
    const catMap = new Map((cats || []).map((c) => [c.slug, c.id]))

    let success = 0
    for (const row of rows) {
      const category_id = catMap.get(row.category) || catMap.get('bracelets')
      const { error } = await supabase.from('products').insert({
        name: row.name,
        slug: slugify(row.name) + '-' + Math.random().toString(36).slice(2, 6),
        description: row.description || '',
        price: row.price,
        compare_price: row.compare_price || null,
        material: row.material,
        category_id,
        featured: false,
        active: true,
      })
      if (!error) success++
    }

    setStatus(`✓ ${success}/${rows.length} ürün başarıyla eklendi.`)
    setRows([])
    setImporting(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-cream mb-2">Excel ile Ürün İçe Aktarma</h1>
      <p className="text-cream/60 text-sm mb-8">
        Excel dosyanızı yükleyin (kolonlar: Ürün Adı, Fiyat, Eski Fiyat, Materyal, Kategori, Açıklama).
      </p>

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={downloadTemplate}
          className="px-6 py-3 border border-gold text-gold rounded-md hover:bg-gold hover:text-black transition-colors text-sm uppercase tracking-wider">
          ↓ Şablon İndir
        </button>
        <label className="px-6 py-3 bg-gold text-black rounded-md cursor-pointer hover:bg-gold/80 transition-colors text-sm uppercase tracking-wider">
          Excel Seç
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
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
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t border-cream/10 text-cream">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.price.toLocaleString('tr-TR')} ₺</td>
                    <td className="p-3">{r.material}</td>
                    <td className="p-3">{r.category}</td>
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
