const ATLAS_API_KEY = process.env.ATLAS_API_KEY

interface AtlasGenerateRequest {
  prompt: string
  style?: string
  colors?: string[]
  type?: 'image' | 'video'
}

const LUXURY_PROMPT_TEMPLATE = (prompt: string) =>
  `${prompt}. Style: luxury jewelry photography, Italian editorial, minimal aesthetic. Colors: black background, gold lighting. Premium quality, 4K.`

export async function generateAtlasImage(request: AtlasGenerateRequest) {
  if (!ATLAS_API_KEY) {
    throw new Error('ATLAS_API_KEY not configured')
  }

  const fullPrompt = LUXURY_PROMPT_TEMPLATE(request.prompt)

  try {
    const response = await fetch('https://api.atlascloud.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ATLAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        style: request.style || 'luxury-jewelry',
        palette: request.colors || ['#0A0A0A', '#C9A97D', '#F5F0E8'],
        type: request.type || 'image',
      }),
    })

    if (!response.ok) {
      throw new Error(`Atlas API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Atlas generation error:', error)
    throw error
  }
}

export async function generateHeroVideo() {
  return generateAtlasImage({
    prompt: 'Luxury bracelet rotating 360 degrees on black surface with gold accent lighting, cinematic 3D animation',
    type: 'video',
  })
}

export async function generateProductImage(productName: string) {
  return generateAtlasImage({
    prompt: `Luxury ${productName} jewelry piece, close-up shot on model's hand, professional product photography`,
  })
}

export async function generateCollectionBanner(collectionName: string) {
  return generateAtlasImage({
    prompt: `${collectionName} collection hero banner, luxury jewelry photography, editorial style`,
  })
}
