// app/search/page.tsx
import { searchShows } from '@/lib/tmdb';
import ShowCard from '@/components/ShowCard';
import Link from 'next/link';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || '';
  let results: any[] = [];

  if (query) {
    results = await searchShows(query);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300">← Back to home</Link>
          <h1 className="text-4xl font-bold">Results for “{query}”</h1>
        </div>

        {results.length === 0 ? (
          <p className="text-xl text-zinc-400">No shows found. Try another search.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {results.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}