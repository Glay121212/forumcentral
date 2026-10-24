import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getForumById, getCategoryBySlug } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isValidId } from '@/lib/security';
import NewTopicForm from './NewTopicForm';

export const dynamic = 'force-dynamic';

export default async function NewTopicPage({ params }) {
  const { id } = params;

  if (!isValidId(id)) {
    notFound();
  }

  const forum = await getForumById(id);
  if (!forum) {
    notFound();
  }

  const category = forum.categorySlug ? await getCategoryBySlug(forum.categorySlug) : null;
  const { isAuthenticated, isGuest, user } = await getCurrentUser();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
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
        <Link href={`/forum/${forum.id}`} className="hover:text-[#f8b700] transition-colors">
          {forum.name}
        </Link>
        <span>»</span>
        <span className="text-[#f8b700] font-semibold">Post New Topic</span>
      </nav>

      {/* Main Panel */}
      <div className="wow-panel overflow-hidden">
        <div className="wow-panel-header px-6 py-4 border-b border-[#4a3a1b]">
          <h1 className="font-fantasy text-xl font-bold text-[#f8b700] tracking-wide">
            Post New Topic
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Posting in <span className="text-slate-200 font-semibold">{forum.name}</span> as{' '}
            <span className={isGuest ? 'text-slate-400 font-mono' : 'text-[#f8b700] font-semibold'}>
              {user.username} {isGuest && '(Guest)'}
            </span>
          </p>
        </div>

        <div className="p-6">
          <NewTopicForm
            forumId={forum.id}
            categorySlug={forum.categorySlug || ''}
            isGuest={isGuest}
          />
        </div>
      </div>
    </div>
  );
}
