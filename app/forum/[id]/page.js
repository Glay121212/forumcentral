import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getForumById, getCategoryBySlug, WOW_CLASSES } from '@/lib/db';
import { isValidId } from '@/lib/security';

export const dynamic = 'force-dynamic';

export default async function ForumPage({ params }) {
  const { id } = params;

  if (!isValidId(id)) {
    notFound();
  }

  const forum = await getForumById(id);
  if (!forum) {
    notFound();
  }

  const category = forum.categorySlug ? await getCategoryBySlug(forum.categorySlug) : null;
  const isCustomModerator = forum.creator && forum.creator !== 'system';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <Link href="/" className="hover:text-[#f8b700] transition-colors">
          Board Index
        </Link>
        {category && (
          <>
            <span>»</span>
            <Link
              href={`/category/${category.slug}`}
              className="hover:text-[#f8b700] transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <span>»</span>
        <span className="text-[#f8b700] font-semibold">{forum.name}</span>
      </nav>

      {/* Forum Header Panel */}
      <div className="wow-panel p-6 border-b border-[#4a3a1b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-fantasy text-2xl font-bold text-[#f8b700] tracking-wide">
                {forum.name}
              </h1>
              {isCustomModerator && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#2a1d08] border border-[#f8b700] text-[#f8b700]">
                  Forum Moderator: {forum.creatorName}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {forum.description}
            </p>
          </div>

          <Link
            href={`/forum/${forum.id}/new-topic`}
            className="btn-wow-gold px-4 py-2 text-xs rounded uppercase tracking-wider self-start md:self-auto shrink-0"
          >
            Post New Topic
          </Link>
        </div>
      </div>

      {/* Topics List Panel */}
      <div className="wow-panel overflow-hidden">
        <div className="wow-panel-header px-4 py-3 flex items-center justify-between">
          <h2 className="font-fantasy text-sm font-bold text-[#f8b700] uppercase tracking-wider">
            Topics
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {forum.topics?.length || 0} Topics
          </span>
        </div>

        <div className="divide-y divide-[#1e293b]/70">
          {forum.topics && forum.topics.length > 0 ? (
            forum.topics.map((topic) => {
              const classObj = topic.authorClass
                ? WOW_CLASSES.find((c) => c.id === topic.authorClass)
                : null;

              return (
                <div
                  key={topic.id}
                  className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-[#131b2c] transition-colors"
                >
                  {/* Topic Title & Author */}
                  <div className="md:col-span-8 flex items-start gap-3">
                    <div className="w-8 h-8 rounded border border-[#3b2f15] bg-[#0c121e] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#00aeff] text-sm">📜</span>
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/topic/${topic.id}`}
                        className="font-fantasy text-base font-bold text-[#00aeff] hover:text-[#42c2ff] hover:underline block leading-snug"
                      >
                        {topic.title}
                      </Link>
                      <div className="mt-1 text-xs text-slate-400 flex flex-wrap items-center gap-2">
                        <span>Started by</span>
                        {topic.isGuest ? (
                          <span className="text-slate-400 font-medium">{topic.authorName}</span>
                        ) : (
                          <Link
                            href={`/member/${encodeURIComponent(topic.authorName)}`}
                            className="font-semibold hover:underline"
                            style={{ color: classObj?.color || '#f8b700' }}
                          >
                            {topic.authorName}
                          </Link>
                        )}
                        {topic.images && topic.images.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                            📷 {topic.images.length} photo{topic.images.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replies count */}
                  <div className="md:col-span-2 text-left md:text-center">
                    <span className="text-xs text-slate-500 block uppercase font-mono">Replies</span>
                    <span className="text-sm font-semibold font-mono text-slate-200">
                      {topic.replyCount || 0}
                    </span>
                  </div>

                  {/* Last activity */}
                  <div className="md:col-span-2 text-left md:text-right text-xs text-slate-400">
                    <span className="text-[11px] text-slate-500 block font-mono">Last Activity</span>
                    <span className="font-mono text-slate-300">
                      {topic.lastPostAt ? new Date(topic.lastPostAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No topics have been posted in this forum yet.
              </p>
              <Link
                href={`/forum/${forum.id}/new-topic`}
                className="btn-wow-gold inline-block px-4 py-2 text-xs rounded uppercase tracking-wider"
              >
                Post New Topic
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
