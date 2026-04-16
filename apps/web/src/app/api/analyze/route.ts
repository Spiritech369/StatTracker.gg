import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import ZAI from 'z-ai-web-dev-sdk'
import { VisionMessage } from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json()
    const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join('/home/z/my-project', imagePath)

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: `Image not found at: ${fullPath}` }, { status: 404 })
    }

    const imageBuffer = fs.readFileSync(fullPath)
    const base64Image = imageBuffer.toString('base64')
    const ext = path.extname(imagePath).toLowerCase()
    const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'image/png'

    const zai = await ZAI.create()
    const config = (zai as any).config

    const messages: VisionMessage[] = [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'Output only text, no markdown.' }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this gaming stats website UI design in EXTREME detail. I need to recreate this as a web page. Focus on:

1. OVERALL LAYOUT: Page width, padding, grid structure, column arrangement
2. HEADER/NAVIGATION: Logo area, navigation tabs/buttons, search, user actions
3. HERO SECTION: Any banner or featured area at top
4. CONTENT SECTIONS: Each major section from top to bottom
5. CHAMPION CARDS: Card design - avatar, name, stats, tier, borders, shadows
6. TABLE/LIST DESIGN: Headers, rows, hover states
7. COLOR SCHEME: Primary, accent, background, text, border colors
8. TYPOGRAPHY: Sizes, weights, spacing
9. STATS DISPLAY: Win rate, pick rate, ban rate presentation
10. ROLE FILTERS: Tab design, active states, role colors
11. SIDEBAR: Items, icons, active states
12. SPACING: Gaps, margins, padding
13. INTERACTIVE: Buttons, badges, hover effects
14. UNIQUE PATTERNS: Badges, progress bars, trending indicators

Be extremely specific about colors, sizes and layout.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ]

    // Direct fetch with proper auth headers
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4.6v',
        messages,
        thinking: { type: 'disabled' }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vision API error:', response.status, errorText)
      return NextResponse.json({ success: false, error: `API error: ${response.status}: ${errorText}` }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'No analysis generated'

    return NextResponse.json({ success: true, analysis: content })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
