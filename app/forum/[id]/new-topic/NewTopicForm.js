'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createTopicAction } from '@/lib/actions';
import ImageUploader from '@/components/ImageUploader';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-wow-gold px-6 py-2.5 rounded text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50"
    >
      {pending ? 'Submitting Topic...' : 'Submit Topic'}
    </button>
  );
}

export default function NewTopicForm({ forumId, categorySlug, isGuest = false }) {
  const [state, formAction] = useFormState(createTopicAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="forumId" value={forumId} />
      <input type="hidden" name="categorySlug" value={categorySlug} />

      {state?.error && (
        <div
          role="alert"
          className="p-3 rounded bg-red-950/80 border border-red-700/70 text-red-200 text-xs"
        >
          {state.error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="topicTitle"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
        >
          Topic Title (3-120 characters)
        </label>
        <input
          id="topicTitle"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all"
          placeholder="Enter a descriptive topic title"
        />
      </div>

      {/* Message Body */}
      <div>
        <label
          htmlFor="topicBody"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
        >
          Message (up to 5,000 characters)
        </label>
        <textarea
          id="topicBody"
          name="body"
          required
          rows={10}
          maxLength={5000}
          className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all resize-y leading-relaxed font-sans"
          placeholder="Write your topic message here..."
        />
      </div>

      {/* Image Uploader */}
      <div className="pt-2 border-t border-[#1c2638]">
        <ImageUploader isGuest={isGuest} />
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-[#1c2638] flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {isGuest
            ? '60s cooldown applies after submitting.'
            : '30s cooldown applies between topics.'}
        </span>
        <SubmitButton />
      </div>
    </form>
  );
}
