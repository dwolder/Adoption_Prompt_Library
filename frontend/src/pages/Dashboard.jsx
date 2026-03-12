import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import Filters from '../components/Filters'
import PromptList from '../components/PromptList'

export default function Dashboard() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState('')
  const [productOptions, setProductOptions] = useState([])

  const [category, setCategory] = useState('')
  const [productContext, setProductContext] = useState('')
  const [sortByVotes, setSortByVotes] = useState(true)

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getPrompts({
        category: category || undefined,
        product_context: productContext || undefined,
        sort_by_votes: sortByVotes,
      })
      setPrompts(data)
    } catch (e) {
      setError(e.message || 'Failed to load prompts')
      setPrompts([])
    } finally {
      setLoading(false)
    }
  }, [category, productContext, sortByVotes])

  const fetchProducts = useCallback(async () => {
    try {
      const list = await api.getProducts()
      setProductOptions(list)
    } catch {
      setProductOptions([])
    }
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function handleVote(promptId) {
    try {
      const updated = await api.vote(promptId)
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? updated : p))
      )
    } catch {
      setError('Failed to vote')
    }
  }

  async function handleUnvote(promptId) {
    try {
      const updated = await api.unvote(promptId)
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? updated : p))
      )
    } catch {
      setError('Failed to remove vote')
    }
  }

  async function handleExportPdf() {
    setExportLoading(true)
    setError('')
    try {
      await api.exportPdf({
        category: category || undefined,
        product_context: productContext || undefined,
        sort_by_votes: sortByVotes,
      })
    } catch (e) {
      setError(e.message || 'Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-800">Prompt Library</h2>
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={exportLoading}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {exportLoading ? 'Generating…' : 'Save Library (PDF)'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <section>
        <Filters
          category={category}
          productContext={productContext}
          sortByVotes={sortByVotes}
          onCategoryChange={setCategory}
          onProductChange={setProductContext}
          onSortChange={setSortByVotes}
          productOptions={productOptions}
        />
        <PromptList
          prompts={prompts}
          onVote={handleVote}
          onUnvote={handleUnvote}
          loading={loading}
        />
      </section>
    </div>
  )
}
