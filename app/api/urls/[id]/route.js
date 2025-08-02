import { getUrlsCollection } from '../../../../lib/mongodb'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

// DELETE - Remove URL by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'URL ID is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid URL ID format' },
        { status: 400 }
      )
    }

    const collection = await getUrlsCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'URL not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'URL deleted successfully' })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to delete URL' },
      { status: 500 }
    )
  }
}