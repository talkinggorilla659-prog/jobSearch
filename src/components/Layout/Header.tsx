import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900">JobHunt</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" active={isActive('/')}>
              Dashboard
            </NavLink>
            <NavLink to="/tracker" active={isActive('/tracker')}>
              Tracker
            </NavLink>
            <NavLink to="/settings" active={isActive('/settings')}>
              Settings
            </NavLink>
          </nav>

          <div className="sm:hidden">
            <Link
              to="/settings"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              aria-label="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="sm:hidden flex items-center gap-1 pb-2 -mt-1 overflow-x-auto">
          <NavLink to="/" active={isActive('/')} mobile>
            Dashboard
          </NavLink>
          <NavLink to="/tracker" active={isActive('/tracker')} mobile>
            Tracker
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  to,
  active,
  mobile,
  children
}: {
  to: string;
  active: boolean;
  mobile?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        mobile && 'whitespace-nowrap'
      )}
    >
      {children}
    </Link>
  );
}
