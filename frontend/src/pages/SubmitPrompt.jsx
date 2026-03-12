import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import PromptForm from '../components/PromptForm'

export default function SubmitPrompt() {
  const location = useLocation()
  const promptTextFromState = location.state?.promptText ?? ''
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [productOptions, setProductOptions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.getProducts().then(setProductOptions).catch(() => setProductOptions([]))
  }, [])

  async function handleSubmit(formData) {
    setSubmitLoading(true)
    setError('')
    try {
      await api.createPrompt(formData)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message || 'Failed to submit')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Submit a prompt</h2>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <PromptForm
        onSubmit={handleSubmit}
        loading={submitLoading}
        initialText={promptTextFromState}
        productOptions={productOptions}
      />
    </div>
  )
}
