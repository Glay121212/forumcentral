import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getAllCategories, getLatestTopics, getBuddyTopics } from '@/lib/db';
import { getFirebaseAdmin } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { isAuthenticated, isGuest, user } = await getCurrentUser();
  const categories = await getAllCategories();
  const latestTopics = await getLatestTopics(6);
  const buddyTopics = isAuthenticated && user?.buddyList?.length > 0
    ? await getBuddyTopics(user.buddyList, 6)
    : [];

  const { isConfigured } = getFirebaseAdmin();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Notice banner if Firebase credentials are in local demo mode */}
      {!isConfigured && (
        <div className="p-3.5 rounded border border-[#8c6e2d]/60 bg-[#161f30] text-amber-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              <strong>Local Development Mode Active:</strong> Running with local persistent data store. When deploying to Vercel, configure your 4 Firebase environment variables to connect directly to live Firestore and Firebase Storage.
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300 shrink-0">
            Self-Contained Ready
          </span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-md border border-[#4a3a1b] bg-gradient-to-r from-[#121927] via-[#1b263b] to-[#121927] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-fantasy text-2xl sm:text-3xl font-extrabold text-[#f8b700] tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Board Index
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Welcome to ForumCentral! Discuss games, software architecture, hobbies, music, and ideas.
              Visitors may browse and post as Guests, or register to choose a character class badge, unlock the Buddy List, and create new forums.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <span className="text-xs text-[#f8b700] font-semibold px-3 py-1.5 rounded bg-[#101726] border border-[#4a3a1b]">
                Logged in as <span className="font-bold">{user.username}</span>
              </span>
            ) : (
              <Link
                href="/register"
                className="btn-wow-gold px-4 py-2 text-xs rounded uppercase tracking-wider text-center"
              >
                Join the Realm
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Buddy List Topics Section (Registered users with buddies) */}
      {isAuthenticated && (
        <section aria-labelledby="buddy-list-heading">
          <div className="wow-panel overflow-hidden">
            <div className="wow-panel-header px-4 py-3 flex items-center justify-between">
              <h2
                id="buddy-list-heading"
                className="font-fantasy text-sm sm:text-base font-bold text-[#f8b700] flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-[#f8b700] shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>New topics from your Buddy List</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {user.buddyList?.length || 0} Buddies
              </span>
            </div>

            {buddyTopics.length > 0 ? (
              <div className="divide-y divide-[#1e293b]/70">
                {buddyTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3.5 flex items-center justify-between hover:bg-[#151f33] transition-colors"
                  >
                    <div className="min-w-0 pr-4">
                      <Link
                        href={`/topic/${topic.id}`}
                        className="text-sm font-semibold text-[#00aeff] hover:text-[#42c2ff] hover:underline truncate block"
                      >
                        {topic.title}
                      </Link>
                      <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                        <span>Started by</span>
                        <Link
                          href={`/member/${encodeURIComponent(topic.authorName)}`}
                          className="font-medium text-amber-300 hover:underline"
                        >
                          {topic.authorName}
                        </Link>
                        <span>•</span>
                        <span>{topic.replyCount || 0} replies</span>
                      </div>
                    </div>
                    <Link
                      href={`/topic/${topic.id}`}
                      className="text-xs btn-wow-dark px-3 py-1 rounded shrink-0"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <p>
                  {user.buddyList?.length === 0
                    ? 'Your Buddy List is currently empty. Visit the Memberlist or member profiles to add your friends!'
                    : 'No recent topics from your buddies yet. When they post, their topics will appear here!'}
                </p>
                <Link
                  href="/members"
                  className="inline-block text-[#00aeff] hover:underline font-semibold"
                >
                  Browse Memberlist →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Forum Categories */}
      <section aria-labelledby="forums-heading" className="space-y-6">
        <h2 id="forums-heading" className="sr-only">
          Forums by Category
        </h2>

        {categories.map((category) => (
          <div key={category.slug} className="wow-panel overflow-hidden">
            {/* Category Header */}
            <div className="wow-panel-header px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <Link
                  href={`/category/${category.slug}`}
                  className="font-fantasy text-lg font-bold text-[#f8b700] hover:text-[#ffd24d] transition-colors flex items-center gap-2"
                >
                  <span>{category.name}</span>
                </Link>
                <p className="text-xs text-slate-400 mt-0.5">{category.description}</p>
              </div>

              {/* Start a new Forum inside this Category */}
              {isAuthenticated && (
                <Link
                  href={`/category/${category.slug}#new-forum`}
                  className="btn-wow-dark px-3 py-1 text-xs rounded uppercase tracking-wider self-start sm:self-auto shrink-0"
                >
                  Start a new Forum
                </Link>
              )}
            </div>

            {/* Forum Rows */}
            <div className="divide-y divide-[#1e293b]/70">
              {category.forums && category.forums.length > 0 ? (
                category.forums.map((forum) => (
                  <div
                    key={forum.id}
                    className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-[#131b2c] transition-colors"
                  >
                    {/* Forum Details */}
                    <div className="md:col-span-7 flex items-start gap-3">
                      <div className="w-8 h-8 rounded border border-[#4a3a1b] bg-[#0c121e] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[#f8b700] text-sm">⚔</span>
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/forum/${forum.id}`}
                          className="font-fantasy text-base font-bold text-[#00aeff] hover:text-[#42c2ff] hover:underline"
                        >
                          {forum.name}
                        </Link>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {forum.description}
                        </p>
                        {forum.creatorName && forum.creator !== 'system' && (
                          <div className="mt-1 text-[11px] text-slate-500">
                            Moderator:{' '}
                            <Link
                              href={`/member/${encodeURIComponent(forum.creatorName)}`}
                              className="text-amber-400/90 hover:underline"
                            >
                              {forum.creatorName}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Topic Count */}
                    <div className="md:col-span-2 text-left md:text-center">
                      <span className="text-xs text-slate-500 block uppercase font-mono">Topics</span>
                      <span className="text-sm font-semibold font-mono text-slate-200">
                        {forum.topicCount || 0}
                      </span>
                    </div>

                    {/* Last Post */}
                    <div className="md:col-span-3 text-left md:text-right text-xs text-slate-400 min-w-0">
                      <span className="text-[11px] text-slate-500 block font-mono">Last Post</span>
                      <span className="truncate block font-medium text-slate-200" title={forum.lastPostTitle || 'No posts'}>
                        {forum.lastPostTitle || 'No posts yet'}
                      </span>
                      {forum.lastPostUser && (
                        <span className="text-[11px] text-slate-400 block truncate">
                          by <span className="text-slate-300 font-semibold">{forum.lastPostUser}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  No forums found in this category yet. Registered members can start one!
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Latest Topics Across the Board */}
      <section aria-labelledby="latest-topics-heading">
        <div className="wow-panel overflow-hidden">
          <div className="wow-panel-header px-4 py-3 flex items-center justify-between">
            <h2 id="latest-topics-heading" className="font-fantasy text-base font-bold text-[#f8b700]">
              Latest Topics
            </h2>
            <span className="text-xs text-slate-400 font-mono">Across All Realms</span>
          </div>

          <div className="divide-y divide-[#1e293b]/70">
            {latestTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#151f33] transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <Link
                    href={`/topic/${topic.id}`}
                    className="text-sm font-semibold text-[#00aeff] hover:text-[#42c2ff] hover:underline truncate block"
                  >
                    {topic.title}
                  </Link>
                  <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                    <span>by</span>
                    <span className="text-slate-300 font-medium">{topic.authorName}</span>
                    <span>•</span>
                    <span>{topic.replyCount || 0} replies</span>
                  </div>
                </div>
                <Link
                  href={`/topic/${topic.id}`}
                  className="text-xs btn-wow-dark px-3 py-1 rounded shrink-0"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
