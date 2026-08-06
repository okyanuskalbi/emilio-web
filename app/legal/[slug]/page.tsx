import { notFound } from 'next/navigation'
import { LEGAL_DOCS, LEGAL_SLUGS } from '@/lib/legal-content'

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }))
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = LEGAL_DOCS[slug]

  if (!doc) notFound()

  return (
    <div className="bg-black min-h-screen pt-24 md:pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-cream mb-2">
          {doc.title}
        </h1>
        <div className="h-1 w-24 bg-gold mb-8" />

        <div className="space-y-4">
          {doc.body.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) {
              return (
                <h2 key={i} className="text-xl font-serif font-semibold text-gold mt-8 mb-2">
                  {block.replace('## ', '')}
                </h2>
              )
            }
            if (block.startsWith('- ') || block.includes('\n- ')) {
              return (
                <ul key={i} className="list-disc list-inside space-y-1 text-cream/70">
                  {block.split('\n').map((line, j) => (
                    <li key={j}>{line.replace(/^-\s*/, '')}</li>
                  ))}
                </ul>
              )
            }
            return (
              <p key={i} className="text-cream/70 leading-relaxed">
                {block}
              </p>
            )
          })}
        </div>

        <p className="text-xs text-cream/40 mt-12 pt-8 border-t border-cream/10">
          Last updated: {new Date().toLocaleDateString('en-US')}
        </p>
      </div>
    </div>
  )
}
