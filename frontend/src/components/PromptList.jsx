import PromptCard from './PromptCard'

export default function PromptList({ prompts, onVote, onUnvote, loading }) {
  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        Loading prompts…
      </div>
    )
  }
  if (!prompts?.length) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
        No prompts match your filters. Try changing filters or submit a new prompt.
      </div>
    )
  }
  return (
    <ul className="space-y-4">
      {prompts.map((p) => (
        <li key={p.id}>
          <PromptCard prompt={p} onVote={onVote} onUnvote={onUnvote} />
        </li>
      ))}
    </ul>
  )
}
