import Link from 'next/link';
import { getAllMembers, WOW_CLASSES } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function MemberlistPage() {
  const members = await getAllMembers();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-2">
        <Link href="/" className="hover:text-[#f8b700] transition-colors">
          Board Index
        </Link>
        <span>»</span>
        <span className="text-[#f8b700] font-semibold">Memberlist</span>
      </nav>

      {/* Main Panel */}
      <div className="wow-panel overflow-hidden">
        <div className="wow-panel-header px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4a3a1b]">
          <div>
            <h1 className="font-fantasy text-xl font-bold text-[#f8b700] tracking-wide">
              Memberlist
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Registered adventurers and forum champions of ForumCentral.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-[#090e18] border border-[#3b2f15] self-start sm:self-auto">
            Total Members: <strong className="text-slate-200">{members.length}</strong>
          </span>
        </div>

        {/* Member Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0b101b] border-b border-[#2b2112] text-xs uppercase font-mono text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Username</th>
                <th scope="col" className="px-6 py-3">Class</th>
                <th scope="col" className="px-6 py-3 text-center">Topics</th>
                <th scope="col" className="px-6 py-3 text-center">Post Count</th>
                <th scope="col" className="px-6 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/70">
              {members.length > 0 ? (
                members.map((member) => {
                  const classObj = WOW_CLASSES.find((c) => c.id === member.wowClass);
                  let joinedFormatted = 'Recently';
                  if (member.joinedAt) {
                    try {
                      joinedFormatted = new Date(member.joinedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    } catch {
                      joinedFormatted = 'Recently';
                    }
                  }

                  return (
                    <tr
                      key={member.username}
                      className="hover:bg-[#151f33] transition-colors"
                    >
                      {/* Username */}
                      <td className="px-6 py-4 font-semibold">
                        <Link
                          href={`/member/${encodeURIComponent(member.username)}`}
                          className="hover:underline flex items-center gap-2"
                          style={{ color: classObj?.color || '#ffffff' }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: classObj?.color || '#ffffff' }}
                          />
                          <span>{member.username}</span>
                        </Link>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4">
                        <span
                          className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-[#090e18] border border-[#3b2f15]"
                          style={{ color: classObj?.color || '#94a3b8' }}
                        >
                          {classObj?.name || 'Adventurer'}
                        </span>
                      </td>

                      {/* Topics */}
                      <td className="px-6 py-4 text-center font-mono text-slate-300">
                        {member.topicCount || 0}
                      </td>

                      {/* Post Count */}
                      <td className="px-6 py-4 text-center font-mono text-slate-200 font-bold">
                        {member.postCount || 0}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">
                        {joinedFormatted}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-500">
                    No registered members yet. Be the first to join the realm!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
