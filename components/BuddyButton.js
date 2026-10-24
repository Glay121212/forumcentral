'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toggleBuddyAction } from '@/lib/actions';

export default function BuddyButton({ targetUsername, isGuest = false, initialIsBuddy = false }) {
  const [isBuddy, setIsBuddy] = useState(initialIsBuddy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isGuest) {
    return (
      <Link
        href="/register"
        className="inline-block btn-wow-dark px-4 py-2 text-xs rounded uppercase tracking-wider text-center"
      >
        Register to add members to your Buddy List
      </Link>
    );
  }

  const handleToggle = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await toggleBuddyAction(targetUsername);
      if (res.success) {
        setIsBuddy(res.added);
      } else {
        setError(res.error || 'Failed to update Buddy List.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={
          isBuddy
            ? 'btn-wow-dark px-4 py-2 text-xs rounded uppercase tracking-wider'
            : 'btn-wow-gold px-4 py-2 text-xs rounded uppercase tracking-wider'
        }
      >
        {loading
          ? 'Updating...'
          : isBuddy
          ? 'Remove from Buddy List'
          : 'Add to Buddy List'}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
