const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('prompt_library_token')
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (includeAuth && token) h['Authorization'] = `Bearer ${token}`
  return h
}

export const api = {
  async login(email) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Login failed')
    }
    return res.json()
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/prompts/categories`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to load categories')
    return res.json()
  },

  async getProducts() {
    const res = await fetch(`${API_BASE}/prompts/products`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to load products')
    return res.json()
  },

  async getPrompts(params = {}) {
    const q = new URLSearchParams()
    if (params.category) q.set('category', params.category)
    if (params.product_context) q.set('product_context', params.product_context)
    if (params.sort_by_votes !== undefined) q.set('sort_by_votes', params.sort_by_votes)
    const res = await fetch(`${API_BASE}/prompts?${q}`, { headers: headers() })
    if (!res.ok) throw new Error('Failed to load prompts')
    return res.json()
  },

  async generatePrompt(description) {
    const res = await fetch(`${API_BASE}/prompts/generate`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ description: description.trim() }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Failed to generate prompt')
    }
    return res.json()
  },

  async createPrompt(data) {
    const res = await fetch(`${API_BASE}/prompts`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail?.msg || err.detail || 'Failed to create prompt')
    }
    return res.json()
  },

  async vote(promptId) {
    const res = await fetch(`${API_BASE}/prompts/${promptId}/vote`, {
      method: 'POST',
      headers: headers(),
    })
    if (!res.ok) throw new Error('Failed to vote')
    return res.json()
  },

  async unvote(promptId) {
    const res = await fetch(`${API_BASE}/prompts/${promptId}/vote`, {
      method: 'DELETE',
      headers: headers(),
    })
    if (!res.ok) throw new Error('Failed to remove vote')
    return res.json()
  },

  async exportPdf(params = {}) {
    const q = new URLSearchParams()
    if (params.category) q.set('category', params.category)
    if (params.product_context) q.set('product_context', params.product_context)
    if (params.sort_by_votes !== undefined) q.set('sort_by_votes', params.sort_by_votes)
    const res = await fetch(`${API_BASE}/export/pdf?${q}`, { headers: headers() })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt-library.pdf'
    a.click()
    URL.revokeObjectURL(url)
  },
}

export default api
