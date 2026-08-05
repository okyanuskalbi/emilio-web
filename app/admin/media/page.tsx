'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'

interface UploadedMedia {
  url: string
  name: string
}

export default function MediaPage() {
  const [uploaded, setUploaded] = useState<UploadedMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiStatus, setAiStatus] = useState('')
  const [aiImage, setAiImage] = useState<string | null>(null)

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true)
    const results: UploadedMedia[] = []

    for (const file of files) {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        results.push({ url: data.publicUrl, name: file.name })
        await supabase.from('media_assets').insert({
          url: data.publicUrl,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          source: 'upload',
        })
      }
    }

    setUploaded((prev) => [...results, ...prev])
    setUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
  })

  const generateAI = async () => {
    if (!aiPrompt.trim()) return
    setAiStatus('Atlas AI görsel üretiyor...')
    setAiImage(null)
    try {
      const res = await fetch('/api/atlas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      const data = await res.json()
      if (data.url) {
        setAiImage(data.url)
        setAiStatus('✓ Görsel üretildi.')
      } else {
        setAiStatus(`Hata: ${data.error || 'bilinmeyen'}`)
      }
    } catch {
      setAiStatus('Atlas API çağrısı başarısız (API yapılandırmasını kontrol edin).')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-cream mb-8">Medya & AI Görsel</h1>

      {/* Drag drop */}
      <section className="mb-12">
        <h2 className="text-lg font-serif font-semibold text-cream mb-4">Sürükle-Bırak Foto Yükleme</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-gold bg-gold/5' : 'border-cream/20 hover:border-gold'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-cream/70">
            {uploading ? 'Yükleniyor...' : isDragActive ? 'Bırakın!' : 'Fotoğrafları buraya sürükleyin veya tıklayın'}
          </p>
          <p className="text-cream/40 text-xs mt-2">PNG, JPG, WEBP</p>
        </div>

        {uploaded.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            {uploaded.map((m, i) => (
              <div key={i} className="relative group">
                <img src={m.url} alt={m.name} className="w-full aspect-square object-cover rounded-md" />
                <button
                  onClick={() => navigator.clipboard.writeText(m.url)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-gold rounded-md"
                >
                  URL Kopyala
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* AI generation */}
      <section>
        <h2 className="text-lg font-serif font-semibold text-cream mb-4">Atlas AI ile Görsel Üret</h2>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Örn: altın cuban zincir bileklik, siyah zemin, lüks ürün fotoğrafı"
            className="flex-1 bg-black border border-cream/20 text-cream px-4 py-3 rounded-md focus:border-gold outline-none"
          />
          <button onClick={generateAI}
            className="px-6 py-3 bg-gold text-black font-semibold rounded-md hover:bg-gold/80 transition-colors uppercase tracking-wider">
            Üret
          </button>
        </div>
        {aiStatus && <p className="text-gold text-sm mb-4">{aiStatus}</p>}
        {aiImage && (
          <img src={aiImage} alt="AI" className="w-64 aspect-square object-cover rounded-lg border border-gold/30" />
        )}
        <p className="text-cream/40 text-xs mt-2">
          Renk paleti (siyah/altın/krem) ve lüks stil otomatik uygulanır.
        </p>
      </section>
    </div>
  )
}
