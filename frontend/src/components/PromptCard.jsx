const CX_ASSISTANT_URL = 'https://cxassistant.cisco.com/'

export default function PromptCard({ prompt, onVote, onUnvote }) {
  const hasVoted = prompt.user_has_voted

  function handleVote() {
    if (hasVoted) onUnvote(prompt.id)
    else onVote(prompt.id)
  }

  async function handleTestInCxAssistant(e) {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText(prompt.text)
    } catch {
      // clipboard may fail in some contexts; still open the tab
    }
    window.open(CX_ASSISTANT_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <article className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleVote}
            aria-label={hasVoted ? 'Remove vote' : 'Thumbs up'}
            className={`p-2 rounded-lg transition-colors ${
              hasVoted
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            <ThumbsUpIcon className="w-5 h-5" />
          </button>
          <span className="block text-center text-sm font-medium text-slate-600 mt-1">
            {prompt.vote_count}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-800 whitespace-pre-wrap break-words">{prompt.text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
              {prompt.category}
            </span>
            {prompt.product_context && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                {prompt.product_context}
              </span>
            )}
            <a
              href={CX_ASSISTANT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleTestInCxAssistant}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Test in CX AI Assistant
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

function ThumbsUpIcon({ className }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
    </svg>
  )
}
