import { getUrlsCollection } from '../../../lib/mongodb'
import { NextResponse } from 'next/server'

// GET - Ping all URLs
export async function GET() {
  try {
    // Fetch all URLs from database
    const collection = await getUrlsCollection()
    const urls = await collection.find({}).toArray()

    if (!urls || urls.length === 0) {
      return NextResponse.json({
        message: 'No URLs to ping',
        results: []
      })
    }

    console.log(`Starting to ping ${urls.length} URLs...`)

    // Ping all URLs
    const pingPromises = urls.map(async (urlItem) => {
      const startTime = Date.now()
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        const response = await fetch(urlItem.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'URL-Ping-Bot/1.0'
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)
        const duration = Date.now() - startTime

        return {
          id: urlItem._id,
          url: urlItem.url,
          status: response.status,
          success: response.ok,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        const duration = Date.now() - startTime
        
        return {
          id: urlItem._id,
          url: urlItem.url,
          status: 0,
          success: false,
          error: error.name === 'AbortError' ? 'Timeout' : error.message,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }
      }
    })

    // Wait for all pings to complete (or fail)
    const results = await Promise.allSettled(pingPromises)
    
    // Process results
    const pingResults = results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        success: false,
        error: 'Promise rejected',
        timestamp: new Date().toISOString()
      }
    )

    const successful = pingResults.filter(r => r.success).length
    const failed = pingResults.length - successful

    const summary = {
      total: urls.length,
      successful,
      failed,
      timestamp: new Date().toISOString()
    }

    console.log(`Ping completed: ${successful}/${urls.length} successful`)

    return NextResponse.json({
      message: `Pinged ${urls.length} URLs`,
      summary,
      results: pingResults
    })

  } catch (error) {
    console.error('Ping operation failed:', error)
    return NextResponse.json(
      { 
        error: 'Ping operation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}