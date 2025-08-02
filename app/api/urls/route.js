import { getUrlsCollection } from '../../../lib/mongodb'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

// GET - Fetch all URLs
export async function GET() {
  try {
    const collection = await getUrlsCollection()
    const urls = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch URLs' },
      { status: 500 }
    )
  }
}

// POST - Add new URL
export async function POST(request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const collection = await getUrlsCollection()

    // Check if URL already exists
    const existingUrl = await collection.findOne({ url })
    if (existingUrl) {
      return NextResponse.json(
        { error: 'URL already exists' },
        { status: 400 }
      )
    }

    // Insert new URL
    const newUrl = {
      url,
      createdAt: new Date()
    }

    const result = await collection.insertOne(newUrl)
    const insertedUrl = await collection.findOne({ _id: result.insertedId })

    return NextResponse.json({ url: insertedUrl }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to add URL' },
      { status: 500 }
    )
  }
}