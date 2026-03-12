import { useState, useEffect } from 'react'

const CATEGORIES = [
  'Customer Baseline',
  'Feature Adoption',
  'Outcome Adoption',
  'QBR Preparation',
  'Product Name/General',
]

export default function PromptForm({ onSubmit, loading, initialText = '' }) {
  const [text, setText] = useState(initialText)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [productContext, setProductContext] = useState('')

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      text: text.trim(),
      category,
      product_context: productContext.trim() || null,
    })
    setText('')
    setProductContext('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-medium text-slate-800 mb-4">Submit a prompt</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt-text" className="block text-sm font-medium text-slate-700 mb-1">
            Prompt text
          </label>
          <textarea
            id="prompt-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={4}
            placeholder="Enter your prompt..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y min-h-[100px]"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-slate-700 mb-1">
            Product name / General
          </label>
          <input
            id="product"
            type="text"
            value={productContext}
            onChange={(e) => setProductContext(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
