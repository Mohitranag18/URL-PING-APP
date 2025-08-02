'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ExternalLink, Globe, Clock, CheckCircle, AlertCircle } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            URL Ping Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Keep your backend servers alive and responsive with automated health checks
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
            message.includes('Error') || message.includes('Failed')
              ? 'bg-red-50/80 text-red-700 border-red-200 shadow-red-100/50'
              : 'bg-green-50/80 text-green-700 border-green-200 shadow-green-100/50'
          } shadow-lg`}>
            <div className="flex items-center gap-3">
              {message.includes('Error') || message.includes('Failed') ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Add URL Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Add New URL</h2>
          </div>
          
          <form onSubmit={addUrl} className="flex gap-4 flex-col sm:flex-row">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://your-backend-api.render.com"
              className="flex-1 px-6 py-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add URL
                </div>
              )}
            </button>
          </form>
        </div>

        {/* URLs List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Monitored URLs
            </h2>
            <div className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {urls.length} {urls.length === 1 ? 'URL' : 'URLs'}
            </div>
          </div>
          
          {urls.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No URLs monitored yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Add your first URL above to start monitoring your backend services and prevent cold starts.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {urls.map((urlItem) => (
                <div
                  key={urlItem._id}
                  className="group p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <a
                          href={urlItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-semibold text-lg break-all flex items-center gap-2 group-hover:gap-3 transition-all duration-200"
                        >
                          {urlItem.url}
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Added: {new Date(urlItem.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteUrl(urlItem._id)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Automated Monitoring</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                URLs are automatically pinged every 5 minutes to prevent cold starts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}