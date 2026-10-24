'use client';

import { useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createReplyAction } from '@/lib/actions';
import ImageUploader from '@/components/ImageUploader';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-wow-gold px-6 py-2.5 rounded text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50"
    >
      {pending ? 'Submitting Reply...' : 'Submit Reply'}
    </button>
  );
}

export default function ReplyForm({ topicId, isGuest = false }) {
  const [state, formAction] = useFormState(createReplyAction, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="topicId" value={topicId} />

      {state?.error && (
        <div
          role="alert"
          className="p-3 rounded bg-red-950/80 border border-red-700/70 text-red-200 text-xs"
        >
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 rounded bg-emerald-950/80 border border-emerald-700/70 text-emerald-200 text-xs">
          Your reply has been submitted successfully!
        </div>
      )}

      <div>
        <label
          htmlFor="replyBody"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1"
        >
          Reply Message (up to 5,000 characters)
        </label>
        <textarea
          id="replyBody"
          name="body"
          required
          rows={6}
          maxLength={5000}
          className="w-full px-3 py-2 bg-[#090e18] border border-[#4a3a1b] focus:border-[#f8b700] focus:ring-1 focus:ring-[#f8b700] rounded text-slate-200 text-sm outline-none transition-all resize-y leading-relaxed font-sans"
          placeholder="Share your thoughts or answer..."
        />
      </div>

      <div className="pt-2 border-t border-[#1c2638]">
        <ImageUploader isGuest={isGuest} />
      </div>

      <div className="pt-4 border-t border-[#1c2638] flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {isGuest
            ? '60s cooldown applies after submitting.'
            : '10s cooldown applies between replies.'}
        </span>
        <SubmitButton />
      </div>
    </form>
  );
}
