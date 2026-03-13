import { NavLink, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, clearAuth } from '../lib/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()
  const user = getUser()

  function handleLogout() {
    clearAuth()
    navigate('/', { replace: true })
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2 select-none">
          <span className="text-2xl">🐾</span>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">ConectaPet</span>
        </NavLink>

        {/* Links */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`
            }
          >
            Adotar
          </NavLink>

          {authenticated ? (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <span>⚙️</span> Admin
              </NavLink>

              {/* Usuário logado + logout */}
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200">
                <span className="text-xs text-gray-400 hidden sm:block">
                  👤 <span className="font-medium text-gray-600">{user?.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Sair do painel"
                >
                  Sair
                </button>
              </div>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`
              }
            >
              <span>⚙️</span> Admin
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
