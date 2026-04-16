import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json()
    const fullPath = path.join('/home/z/my-project', imagePath)

    const imageBuffer = fs.readFileSync(fullPath)
    const base64Image = imageBuffer.toString('base64')
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'

    const zai = await ZAI.create()

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this gaming website UI design in extreme detail. Focus on: 1) Overall layout structure 2) Navigation/header design 3) Hero section 4) Content sections arrangement 5) Color scheme (exact colors if possible) 6) Cards design style 7) Data presentation (tables, grids, stats) 8) Typography hierarchy 9) Spacing and padding patterns 10) Any unique UI patterns or design elements. Be as specific as possible with measurements, colors, and layout positions.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    })

    const content = response.choices[0]?.message?.content || 'No content generated'

    return NextResponse.json({ success: true, analysis: content })
  } catch (error: any) {
    console.error('Image analysis error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
