'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createForumAction } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-wow-gold px-5 py-2 rounded text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50"
    >
      {pending ? 'Establishing Forum...' : 'Create Forum'}
    </button>
  );
}

export default function NewForumForm({ categorySlug }) {
  const [state, formAction] = useFormState(createForumAction, null);

  return (
    <div className="wow-panel overflow-hidden">
      <div className="wow-panel-header px-6 py-4 border-b border-[#4a3a1b]">
        <h3 className="font-fantasy text-base font-bold text-[#f8b700]">
          Start a new Forum
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          You will become the Forum Moderator for this discussion realm (up to 5 per day).
        </p>
      </div>

      <div className="p-6">
        {state?.error && (
          <div
            role="alert"
            className="p-3 mb-4 rounded bg-red-950/80 border border-red-700/70 text-red-200 text-xs"
          >
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="categorySlug" value={categorySlug} />

          <div>
            <label
              htmlFor="forumName"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
            >
              Forum Name (3-40 characters)
            </label>
            <input
              id="forumName"
              name="name"
              type="text"
              required
              minLength={3}
              maxLength={40}
              className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all"
              placeholder="e.g. Mythic+ Dungeon Strategies"
            />
          </div>

          <div>
            <label
              htmlFor="forumDesc"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
            >
              Description (up to 300 characters)
            </label>
            <textarea
              id="forumDesc"
              name="description"
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all resize-y"
              placeholder="Describe the topics and goals of this forum..."
            />
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
