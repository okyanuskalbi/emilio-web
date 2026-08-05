import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

// ChatGPT / Claude / Perplexity / Gemini gibi cevap motorlarının mağazayı
// tarayıp marka, ürün ve fiyat bilgisini yanıtlarında kaynak göstermesi için
// LLM botlarını açıkça listeliyoruz. Admin + API her botta kapalı.
const LLM_BOTS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'ClaudeBot', 'Claude-Web', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Bingbot', 'Applebot-Extended',
  'Amazonbot', 'DuckAssistBot', 'Bytespider',
  'Meta-ExternalAgent', 'FacebookBot', 'CCBot',
] as const

export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api', '/account', '/checkout']
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...LLM_BOTS.map((bot) => ({ userAgent: bot, allow: '/', disallow })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
