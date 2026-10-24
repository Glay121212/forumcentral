import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { findUserByUsername, WOW_CLASSES, getStore } from '@/lib/db';
import { validateUsername } from '@/lib/security';
import BuddyButton from '@/components/BuddyButton';

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage({ params }) {
  const memberName = params.name;

  // Validate username format in URL
  const userCheck = validateUsername(memberName);
  if (!userCheck.valid) {
    notFound();
  }

  const member = await findUserByUsername(userCheck.username);
  if (!member) {
    notFound();
  }

  const { isAuthenticated, isGuest, user: currentUser } = await getCurrentUser();

  const classObj = WOW_CLASSES.find((c) => c.id === member.wowClass);
  const isSelf = isAuthenticated && currentUser.username.toLowerCase() === member.username.toLowerCase();
  const initialIsBuddy = isAuthenticated && currentUser.buddyList?.includes(member.username);

  let joinedFormatted = 'Recently';
  if (member.joinedAt) {
    try {
      joinedFormatted = new Date(member.joinedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      joinedFormatted = 'Recently';
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <Link href="/" className="hover:text-[#f8b700] transition-colors">
          Board Index
        </Link>
        <span>»</span>
        <Link href="/members" className="hover:text-[#f8b700] transition-colors">
          Memberlist
        </Link>
        <span>»</span>
        <span className="text-[#f8b700] font-semibold">{member.username}</span>
      </nav>

      {/* Profile Card */}
      <div className="wow-panel overflow-hidden">
        {/* Banner */}
        <div
          className="h-32 bg-gradient-to-r from-[#0c1424] via-[#162544] to-[#0c1424] border-b border-[#4a3a1b] relative p-6 flex items-end"
          style={{
            borderBottomColor: classObj?.color || '#4a3a1b',
          }}
        >
          <div className="absolute top-4 right-4">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded bg-black/60 border border-[#4a3a1b]"
              style={{ color: classObj?.color || '#f8b700' }}
            >
              {classObj?.name || 'Adventurer'}
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 relative">
          {/* Framed Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
            <div className="flex items-end gap-4">
              <div
                className="w-24 h-24 rounded border-2 p-1 bg-[#090e18] shadow-2xl relative"
                style={{ borderColor: classObj?.color || '#f8b700' }}
              >
                <div className="w-full h-full bg-[#111726] rounded-sm flex items-center justify-center">
                  <span
                    className="font-fantasy font-black text-3xl"
                    style={{ color: classObj?.color || '#ffffff' }}
                  >
                    {member.username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h1
                  className="font-fantasy text-2xl sm:text-3xl font-extrabold tracking-wide"
                  style={{ color: classObj?.color || '#ffffff' }}
                >
                  {member.username}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Class: <span className="font-semibold text-slate-200">{classObj?.name || 'Unknown'}</span>
                </p>
              </div>
            </div>

            {/* Buddy Action Button */}
            {!isSelf && (
              <div className="mt-2 sm:mt-0">
                <BuddyButton
                  targetUsername={member.username}
                  isGuest={isGuest}
                  initialIsBuddy={initialIsBuddy}
                />
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1c2638]">
            <div className="p-4 rounded bg-[#090e18] border border-[#261f12]">
              <span className="text-xs font-mono uppercase text-slate-400 block">Joined</span>
              <span className="font-mono text-sm text-slate-200 font-semibold mt-1 block">
                {joinedFormatted}
              </span>
            </div>

            <div className="p-4 rounded bg-[#090e18] border border-[#261f12]">
              <span className="text-xs font-mono uppercase text-slate-400 block">Total Post Count</span>
              <span className="font-mono text-xl text-[#f8b700] font-bold mt-1 block">
                {member.postCount || 0}
              </span>
            </div>

            <div className="p-4 rounded bg-[#090e18] border border-[#261f12]">
              <span className="text-xs font-mono uppercase text-slate-400 block">Topics Created</span>
              <span className="font-mono text-xl text-[#00aeff] font-bold mt-1 block">
                {member.topicCount || 0}
              </span>
            </div>
          </div>

          {/* Buddies Count for this user */}
          {member.buddyList && member.buddyList.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#1c2638]">
              <h2 className="font-fantasy text-sm font-bold text-[#f8b700] mb-3">
                Buddy List ({member.buddyList.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {member.buddyList.map((buddyName) => (
                  <Link
                    key={buddyName}
                    href={`/member/${encodeURIComponent(buddyName)}`}
                    className="text-xs px-2.5 py-1 rounded bg-[#0c121e] border border-[#3b2f15] text-slate-300 hover:border-[#f8b700] hover:text-[#f8b700] transition-colors"
                  >
                    ✦ {buddyName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
