'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { registerAction } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-wow-gold w-full py-2.5 px-4 rounded text-sm uppercase tracking-wider font-bold transition-all disabled:opacity-50"
    >
      {pending ? 'Forging Character...' : 'Register'}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, null);

  return (
    <div className="max-w-md mx-auto my-8 animate-fade-in">
      <div className="wow-panel overflow-hidden">
        {/* Header */}
        <div className="wow-panel-header px-6 py-4 border-b border-[#4a3a1b]">
          <h1 className="font-fantasy text-xl font-bold text-[#f8b700] tracking-wide text-center">
            Register
          </h1>
          <p className="text-xs text-slate-400 text-center mt-1">
            Create your account to unlock your class badge, Buddy List, and custom forums.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {state?.error && (
            <div
              role="alert"
              className="p-3 rounded bg-red-950/80 border border-red-700/70 text-red-200 text-xs leading-relaxed"
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                autoComplete="username"
                className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all"
                placeholder="3-20 characters (letters, numbers, _)"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Letters, numbers, and underscore only. Unique and case-insensitive.
              </span>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={12}
                maxLength={72}
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all"
                placeholder="Min 12 characters"
              />
              <div className="mt-1 space-y-0.5 text-[10px] text-slate-400">
                <p>• 12-72 characters in length</p>
                <p>• Must include uppercase, lowercase, number, and a symbol</p>
                <p>• Cannot contain your username</p>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
              >
                Repeat Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all"
                placeholder="Re-enter your password"
              />
            </div>

            {/* Privacy Highlight */}
            <div className="p-3 rounded bg-[#090e18] border border-[#3b2f15] text-[11px] text-slate-400 space-y-1">
              <span className="text-[#f8b700] font-semibold block">Privacy First</span>
              <span>
                No email required! A random character class colour (Warrior, Mage, Rogue, Druid, Paladin, Priest, Shaman, Hunter, Warlock, or Death Knight) is assigned to your banner.
              </span>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          {/* Already have an account */}
          <div className="pt-4 border-t border-[#1c2638] text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-[#00aeff] hover:underline font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
