import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Construct the path to the JSON file
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'blog', `${slug}.json`)
    
    // Read the JSON file
    const fileContents = await fs.readFile(filePath, 'utf8')
    const blogData = JSON.parse(fileContents)
    
    return NextResponse.json(blogData)
  } catch (error) {
    console.error('Error loading blog data:', error)
    return NextResponse.json(
      { error: 'Blog not found' },
      { status: 404 }
    )
  }
}
