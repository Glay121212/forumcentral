'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { loginAction } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-wow-gold w-full py-2.5 px-4 rounded text-sm uppercase tracking-wider font-bold transition-all disabled:opacity-50"
    >
      {pending ? 'Authenticating...' : 'Login'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, null);

  return (
    <div className="max-w-md mx-auto my-8 animate-fade-in">
      <div className="wow-panel overflow-hidden">
        {/* Header */}
        <div className="wow-panel-header px-6 py-4 border-b border-[#4a3a1b]">
          <h1 className="font-fantasy text-xl font-bold text-[#f8b700] tracking-wide text-center">
            Login
          </h1>
          <p className="text-xs text-slate-400 text-center mt-1">
            Sign in to access your character profile and Buddy List.
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
                autoComplete="username"
                className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all"
                placeholder="e.g. Thrall_99"
              />
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
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all"
                placeholder="Your secret password"
              />
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>

          {/* Guest reminder & Register link */}
          <div className="pt-4 border-t border-[#1c2638] text-center space-y-3">
            <p className="text-xs text-slate-400">
              Don&apos;t have a character account?{' '}
              <Link href="/register" className="text-[#00aeff] hover:underline font-semibold">
                Register here
              </Link>
            </p>
            <div className="p-2.5 rounded bg-[#090f1b] border border-[#2b2112] text-[11px] text-slate-400">
              <strong>Tip:</strong> Visitors can freely browse, post new topics, and submit replies as a <strong>Guest</strong> without signing up!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
