import Link from 'next/link';
import { WOW_CLASSES } from '@/lib/db';

export default function WoWAvatar({
  authorName,
  authorClass,
  isGuest = false,
  joinedAt,
  postCount = 0,
  isModerator = false,
}) {
  const classObj = !isGuest && authorClass
    ? WOW_CLASSES.find((c) => c.id === authorClass)
    : null;

  const nameColor = isGuest ? '#94a3b8' : classObj?.color || '#ffffff';

  // Format joined date (e.g., Oct 2026)
  let joinedText = 'Recently';
  if (joinedAt) {
    try {
      const date = new Date(joinedAt);
      joinedText = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      joinedText = 'Recently';
    }
  }

  // Get initials or crest representation
  const initial = authorName ? authorName.slice(0, 2).toUpperCase() : '??';

  return (
    <div className="flex flex-col items-center text-center p-4 bg-[#0d131f] border-r border-[#261f12] w-full md:w-48 shrink-0">
      {/* Framed Avatar Box */}
      <div className="relative mb-3 group">
        <div
          className="w-16 h-16 rounded border-2 p-0.5 flex items-center justify-center bg-gradient-to-b from-[#182338] to-[#0a0f18] shadow-md"
          style={{ borderColor: isGuest ? '#475569' : classObj?.color || '#8c733e' }}
        >
          <div className="w-full h-full bg-[#080d16] rounded-sm flex items-center justify-center overflow-hidden">
            <span
              className="font-fantasy font-black text-xl"
              style={{ color: nameColor }}
            >
              {initial}
            </span>
          </div>
        </div>

        {/* Small in-game decorative border corners */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#f8b700]/70" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[#f8b700]/70" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[#f8b700]/70" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#f8b700]/70" />
      </div>

      {/* Author Username in Class Colour */}
      {isGuest ? (
        <span className="font-semibold text-slate-400 text-sm">{authorName}</span>
      ) : (
        <Link
          href={`/member/${encodeURIComponent(authorName)}`}
          className="font-semibold text-sm hover:underline transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
          style={{ color: nameColor }}
        >
          {authorName}
        </Link>
      )}

      {/* Class Tag or Guest Tag */}
      <div className="mt-1">
        {isGuest ? (
          <span className="text-[11px] font-mono text-slate-500 bg-[#070b12] px-2 py-0.5 rounded border border-slate-800">
            Guest
          </span>
        ) : (
          <span
            className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-[#101726] border border-[#2b2212]"
            style={{ color: classObj?.color || '#e2e8f0' }}
          >
            {classObj?.name || 'Adventurer'}
          </span>
        )}
      </div>

      {/* Forum Moderator Badge */}
      {isModerator && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2a1d08] border border-[#f8b700] text-[#f8b700] shadow-[0_0_8px_rgba(248,183,0,0.3)]">
            Forum Moderator
          </span>
        </div>
      )}

      {/* Member Details */}
      {!isGuest && (
        <div className="mt-3 pt-2 border-t border-[#1e170d] w-full text-xs text-slate-400 space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Joined:</span>
            <span className="text-slate-300 font-mono">{joinedText}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Posts:</span>
            <span className="text-slate-300 font-mono">{postCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
