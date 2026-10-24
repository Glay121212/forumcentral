import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCategoryBySlug } from '@/lib/db';
import { isValidId } from '@/lib/security';
import NewForumForm from './NewForumForm';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }) {
  const { slug } = params;

  if (!isValidId(slug)) {
    notFound();
  }

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { isAuthenticated, isGuest } = await getCurrentUser();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <Link href="/" className="hover:text-[#f8b700] transition-colors">
          Board Index
        </Link>
        <span>»</span>
        <span className="text-[#f8b700] font-semibold">{category.name}</span>
      </nav>

      {/* Category Header Panel */}
      <div className="wow-panel p-6 border-b border-[#4a3a1b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-fantasy text-2xl font-bold text-[#f8b700] tracking-wide">
              {category.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>

          {isAuthenticated ? (
            <a
              href="#new-forum"
              className="btn-wow-gold px-4 py-2 text-xs rounded uppercase tracking-wider self-start md:self-auto shrink-0"
            >
              Start a new Forum
            </a>
          ) : (
            <Link
              href="/register"
              className="btn-wow-dark px-4 py-2 text-xs rounded uppercase tracking-wider self-start md:self-auto shrink-0"
            >
              Register to Create Forum
            </Link>
          )}
        </div>
      </div>

      {/* Forums List */}
      <div className="wow-panel overflow-hidden">
        <div className="wow-panel-header px-4 py-3 flex items-center justify-between">
          <h2 className="font-fantasy text-sm font-bold text-[#f8b700] uppercase tracking-wider">
            Forums
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {category.forums?.length || 0} Forums
          </span>
        </div>

        <div className="divide-y divide-[#1e293b]/70">
          {category.forums && category.forums.length > 0 ? (
            category.forums.map((forum) => (
              <div
                key={forum.id}
                className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-[#131b2c] transition-colors"
              >
                {/* Forum info */}
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
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {forum.description}
                    </p>
                    {forum.creatorName && forum.creator !== 'system' && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        Forum Moderator:{' '}
                        <Link
                          href={`/member/${encodeURIComponent(forum.creatorName)}`}
                          className="text-[#f8b700] hover:underline"
                        >
                          {forum.creatorName}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Topics count */}
                <div className="md:col-span-2 text-left md:text-center">
                  <span className="text-xs text-slate-500 block uppercase font-mono">Topics</span>
                  <span className="text-sm font-semibold font-mono text-slate-200">
                    {forum.topicCount || 0}
                  </span>
                </div>

                {/* Last post */}
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
            <div className="p-6 text-center text-xs text-slate-500">
              No forums in this category yet. Registered members can start one below!
            </div>
          )}
        </div>
      </div>

      {/* Start a new Forum section */}
      <div id="new-forum" className="pt-4">
        {isAuthenticated ? (
          <NewForumForm categorySlug={category.slug} />
        ) : (
          <div className="wow-panel p-6 text-center space-y-2">
            <h3 className="font-fantasy text-base font-bold text-[#f8b700]">
              Start a new Forum
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Only registered members can create community forums and serve as Forum Moderator.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="btn-wow-gold inline-block px-4 py-2 text-xs rounded uppercase tracking-wider"
              >
                Register to Start a Forum
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
