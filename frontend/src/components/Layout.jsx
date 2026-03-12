import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  const navLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PromptLibraryIcon className="h-8 w-8 flex-shrink-0 text-indigo-600" />
            <h1 className="text-xl font-semibold text-slate-800">AI Prompt Library</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-slate-500 hover:text-slate-800 underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-52 flex-shrink-0 bg-white border-r border-slate-200 py-4">
          <nav className="px-2 space-y-0.5">
            <NavLink to="/" end className={navLinkClass}>
              Library
            </NavLink>
            <NavLink to="/submit" className={navLinkClass}>
              Submit a prompt
            </NavLink>
            <NavLink to="/help-create" className={navLinkClass}>
              Help me create a prompt <span className="text-xs text-slate-400">(TBD)</span>
            </NavLink>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto max-w-4xl px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Icon: document (prompt) + sparkle to imply AI prompt management */
function PromptLibraryIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="5" y="2" width="14" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7h7M8 11h5M8 15h6M8 19h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M22 5L25 8l-3 3-3-3 3-3z" fill="currentColor" opacity="0.9" />
    </svg>
  )
}
