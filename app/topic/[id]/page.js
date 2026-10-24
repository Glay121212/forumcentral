import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopicById, getForumById, getCategoryBySlug, findUserById, findUserByUsername } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isValidId } from '@/lib/security';
import WoWAvatar from '@/components/WoWAvatar';
import ImageLightbox from '@/components/ImageLightbox';
import ReplyForm from './ReplyForm';

export const dynamic = 'force-dynamic';

export default async function TopicPage({ params }) {
  const { id } = params;

  if (!isValidId(id)) {
    notFound();
  }

  const topic = await getTopicById(id);
  if (!topic) {
    notFound();
  }

  const forum = topic.forumId ? await getForumById(topic.forumId) : null;
  const category = forum?.categorySlug ? await getCategoryBySlug(forum.categorySlug) : null;
  const { isAuthenticated, isGuest, user: currentUser } = await getCurrentUser();

  // Fetch author details for topic OP
  let opUser = null;
  if (!topic.isGuest) {
    opUser = (await findUserById(topic.authorId)) || (await findUserByUsername(topic.authorName));
  }

  // Check if OP is Forum Moderator
  const isOpModerator = forum?.creator === topic.authorId || forum?.creatorName === topic.authorName;

  // Format creation time
  let topicDateFormatted = 'Recent';
  if (topic.createdAt) {
    try {
      topicDateFormatted = new Date(topic.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      topicDateFormatted = 'Recent';
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
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
        {forum && (
          <>
            <span>»</span>
            <Link
              href={`/forum/${forum.id}`}
              className="hover:text-[#f8b700] transition-colors"
            >
              {forum.name}
            </Link>
          </>
        )}
        <span>»</span>
        <span className="text-[#f8b700] font-semibold truncate max-w-xs">{topic.title}</span>
      </nav>

      {/* Topic Title Header Bar */}
      <div className="wow-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4a3a1b]">
        <div>
          <h1 className="font-fantasy text-xl sm:text-2xl font-bold text-[#f8b700] tracking-wide leading-tight">
            {topic.title}
          </h1>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Posted in</span>
            <span className="text-slate-300 font-semibold">{forum?.name || 'General'}</span>
            <span>•</span>
            <span>{topicDateFormatted}</span>
          </div>
        </div>

        <a
          href="#post-reply"
          className="btn-wow-gold px-4 py-2 text-xs rounded uppercase tracking-wider self-start sm:self-auto shrink-0"
        >
          Post Reply
        </a>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        {/* Original Post (OP) */}
        <article className="wow-panel overflow-hidden flex flex-col md:flex-row">
          {/* Left Avatar Sidebar */}
          <WoWAvatar
            authorName={topic.authorName}
            authorClass={topic.authorClass || opUser?.wowClass}
            isGuest={topic.isGuest}
            joinedAt={opUser?.joinedAt}
            postCount={opUser?.postCount || 1}
            isModerator={isOpModerator}
          />

          {/* Right Post Body Panel */}
          <div className="flex-1 p-5 md:p-6 bg-[#101726] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#1c2638] text-xs text-slate-400">
                <span className="font-mono text-[11px] text-slate-500">Post #1</span>
                <span className="font-mono text-[11px]">{topicDateFormatted}</span>
              </div>

              {/* Message Body (Safe text rendering, no dangerouslySetInnerHTML) */}
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans break-words">
                {topic.body}
              </div>

              {/* Clickable Image Attachments Lightbox */}
              {topic.images && topic.images.length > 0 && (
                <ImageLightbox images={topic.images} />
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-[#1c2638] flex justify-end">
              <a
                href="#post-reply"
                className="text-xs text-[#00aeff] hover:text-[#42c2ff] hover:underline font-semibold"
              >
                Quote & Reply ↓
              </a>
            </div>
          </div>
        </article>

        {/* Replies List */}
        {topic.replies && topic.replies.length > 0 && (
          <div className="space-y-4 pt-2">
            {topic.replies.map((reply, index) => {
              let replyDate = 'Recent';
              if (reply.createdAt) {
                try {
                  replyDate = new Date(reply.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                } catch {
                  replyDate = 'Recent';
                }
              }

              const isReplyModerator =
                forum?.creator === reply.authorId || forum?.creatorName === reply.authorName;

              return (
                <article
                  key={reply.id}
                  className="wow-panel overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Left Avatar Sidebar */}
                  <WoWAvatar
                    authorName={reply.authorName}
                    authorClass={reply.authorClass}
                    isGuest={reply.isGuest}
                    joinedAt={reply.createdAt}
                    postCount={1}
                    isModerator={isReplyModerator}
                  />

                  {/* Right Post Body Panel */}
                  <div className="flex-1 p-5 md:p-6 bg-[#101726] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[#1c2638] text-xs text-slate-400">
                        <span className="font-mono text-[11px] text-slate-500">
                          Reply #{index + 1}
                        </span>
                        <span className="font-mono text-[11px]">{replyDate}</span>
                      </div>

                      <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans break-words">
                        {reply.body}
                      </div>

                      {reply.images && reply.images.length > 0 && (
                        <ImageLightbox images={reply.images} />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Reply Section */}
      <div id="post-reply" className="pt-4">
        <div className="wow-panel overflow-hidden">
          <div className="wow-panel-header px-6 py-4 border-b border-[#4a3a1b]">
            <h2 className="font-fantasy text-lg font-bold text-[#f8b700] tracking-wide">
              Post Reply
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Posting as{' '}
              <span className={isGuest ? 'text-slate-400 font-mono' : 'text-[#f8b700] font-semibold'}>
                {currentUser.username} {isGuest && '(Guest)'}
              </span>
            </p>
          </div>

          <div className="p-6">
            <ReplyForm topicId={topic.id} isGuest={isGuest} />
          </div>
        </div>
      </div>
    </div>
  );
}
