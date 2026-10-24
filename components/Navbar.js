import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';
import { WOW_CLASSES } from '@/lib/db';

export default async function Navbar() {
  const { isAuthenticated, isGuest, user } = await getCurrentUser();
  const userClassObj = user?.wowClass
    ? WOW_CLASSES.find((c) => c.id === user.wowClass)
    : null;

  return (
    <header className="sticky top-0 z-40 bg-[#090e18]/95 backdrop-blur border-b border-[#3b2f15] shadow-lg shadow-black/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo Wordmark */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="ForumCentral Board Index"
            >
              <div className="w-9 h-9 rounded border border-[#f8b700] bg-gradient-to-b from-[#2a1d08] to-[#120c02] flex items-center justify-center shadow-[0_0_10px_rgba(248,183,0,0.4)] group-hover:shadow-[0_0_16px_rgba(248,183,0,0.7)] transition-all">
                <span className="text-[#f8b700] font-fantasy font-black text-xl">FC</span>
              </div>
              <span className="font-fantasy text-2xl font-bold tracking-wider text-[#f8b700] group-hover:text-[#ffd24d] transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                ForumCentral
              </span>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/"
                className="text-slate-300 hover:text-[#f8b700] transition-colors flex items-center gap-1.5"
              >
                <span>Board Index</span>
              </Link>
              <Link
                href="/members"
                className="text-slate-300 hover:text-[#f8b700] transition-colors flex items-center gap-1.5"
              >
                <span>Memberlist</span>
              </Link>
              {isAuthenticated && (
                <Link
                  href={`/member/${user.username}`}
                  className="text-slate-300 hover:text-[#f8b700] transition-colors flex items-center gap-1.5"
                >
                  <span>My Profile</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right User Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 max-w-[120px] sm:max-w-none truncate">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: userClassObj?.color || '#f8b700' }}
                    title={userClassObj?.name || 'Member'}
                  />
                  <Link
                    href={`/member/${user.username}`}
                    className="text-xs sm:text-sm font-semibold hover:underline truncate"
                    style={{ color: userClassObj?.color || '#ffffff' }}
                  >
                    {user.username}
                  </Link>
                  {userClassObj && (
                    <span className="hidden sm:inline-block text-[11px] px-1.5 py-0.2 rounded border border-[#3b2f15] bg-[#111726] text-slate-400">
                      {userClassObj.name}
                    </span>
                  )}
                </div>

                <form action={logoutAction} className="shrink-0">
                  <button
                    type="submit"
                    className="btn-wow-dark px-2.5 py-1 text-[11px] sm:text-xs rounded uppercase tracking-wider"
                  >
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                  Browsing as <span className="text-slate-300 font-semibold">{user.username}</span>
                </span>
                <Link
                  href="/login"
                  className="btn-wow-dark px-3.5 py-1.5 text-xs rounded uppercase tracking-wider"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-wow-gold px-3.5 py-1.5 text-xs rounded uppercase tracking-wider"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
