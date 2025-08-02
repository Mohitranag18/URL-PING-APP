'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [urls, setUrls] = useState([])
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Fetch all URLs
  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls')
      const data = await response.json()
      if (response.ok) {
        setUrls(data.urls)
      } else {
        setMessage(data.error || 'Failed to fetch URLs')
      }
    } catch (error) {
      setMessage('Error fetching URLs')
      console.error('Error:', error)
    }
  }

  // Add new URL
  const addUrl = async (e) => {
    e.preventDefault()
    if (!newUrl.trim()) return

    // Basic URL validation
    try {
      new URL(newUrl)
    } catch {
      setMessage('Please enter a valid URL')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: newUrl.trim() }),
      })

      const data = await response.json()
      if (response.ok) {
        setNewUrl('')
        setUrls([...urls, data.url])
        setMessage('URL added successfully!')
      } else {
        setMessage(data.error || 'Failed to add URL')
      }
    } catch (error) {
      setMessage('Error adding URL')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Delete URL
  const deleteUrl = async (id) => {
    try {
      const response = await fetch(`/api/urls/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUrls(urls.filter(url => url._id !== id))
        setMessage('URL deleted successfully!')
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to delete URL')
      }
    } catch (error) {
      setMessage('Error deleting URL')
      console.error('Error:', error)
    }
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Fetch URLs on component mount
  useEffect(() => {
    fetchUrls()
  }, [])

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            URL Ping Manager
          </h1>
          <p className="text-gray-600">
            Keep your backend servers alive by pinging them regularly
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') || message.includes('Failed')
              ? 'bg-red-100 text-red-700 border border-red-200'
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {/* Add URL Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New URL</h2>
          <form onSubmit={addUrl} className="flex gap-4">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://your-backend-api.render.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add URL'}
            </button>
          </form>
        </div>

        {/* URLs List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Monitored URLs ({urls.length})
          </h2>
          
          {urls.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No URLs added yet. Add one above to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {urls.map((urlItem) => (
                <div
                  key={urlItem._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <a
                      href={urlItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium break-all"
                    >
                      {urlItem.url}
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Added: {new Date(urlItem.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteUrl(urlItem._id)}
                    className="ml-4 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm">
            <strong>Info:</strong> URLs are automatically pinged every 5 minutes when deployed to Vercel to prevent cold starts.
          </p>
        </div>
      </div>
    </div>
  )
}