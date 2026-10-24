import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'ForumCentral - World of Warcraft Styled Community Forums',
  description:
    'A deployable community forum inspired by the official World of Warcraft forums with categories, topics, guest and member posting, buddy lists, and member profiles.',
  openGraph: {
    title: 'ForumCentral - World of Warcraft Styled Community Forums',
    description:
      'A deployable community forum inspired by the official World of Warcraft forums with categories, topics, guest and member posting, buddy lists, and member profiles.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#060a12] text-slate-300 font-sans min-h-screen flex flex-col selection:bg-[#f8b700] selection:text-black">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="mt-auto border-t border-[#3b2f15] bg-[#080d17] py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-fantasy tracking-wider text-sm text-[#f8b700]/80">
              ForumCentral Community Board
            </p>
            <p className="max-w-xl mx-auto text-[11px] leading-relaxed text-slate-500">
              Original fantasy artwork and layout inspired by classic MMORPG discussion boards.
              Built with Next.js App Router, Server Actions, and Firebase.
            </p>
            <p className="text-[10px] text-slate-600">
              Security enforced: server-authoritative Firestore and Storage with zero direct client access.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
