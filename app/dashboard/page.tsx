// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { getShowDetails, getNextSeasonEpisodes } from '@/lib/tmdb';
import { calculateSubscriptionWindow } from '@/lib/recommendation';
import ShowCard from '@/components/ShowCard';
import Link from 'next/link';

export default async function Dashboard() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId) return <div>Please sign in</div>;

  const isPaid = (user?.privateMetadata as any)?.isPaid === true;

  const { data: saved } = await supabase
    .from('user_shows')
    .select('tmdb_id')
    .eq('user_id', userId);

  const tmdbIds = saved?.map(s => s.tmdb_id) || [];
  const canAddMore = isPaid || tmdbIds.length < 5;

  // Fetch full details + windows
  const shows = await Promise.all(
    tmdbIds.map(async (id: number) => {
      const details = await getShowDetails(id.toString());
      const episodes = await getNextSeasonEpisodes(id.toString());
      const window = calculateSubscriptionWindow(episodes);
      return { ...details, window, tmdb_id: id };
    })
  );

  // Group by primary binge month for rolling plan
  const grouped = shows.reduce((acc: any, show: any) => {
    const month = show.window.primarySubscribe;
    if (!acc[month]) acc[month] = [];
    acc[month].push(show);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-bold">My Shows</h1>
            <p className="text-emerald-400 mt-2">
              {isPaid ? 'Unlimited plan' : `${tmdbIds.length}/5 shows saved`}
            </p>
          </div>
          {!isPaid && (
            <Link href="/upgrade" className="bg-emerald-500 text-black px-8 py-3 rounded-2xl font-bold">
              Upgrade $2.99/mo →
            </Link>
          )}
        </div>

        {/* Rolling Plan View */}
        {Object.keys(grouped).length === 0 ? (
          <p className="text-2xl text-zinc-400">No shows saved yet. Search and add some!</p>
        ) : (
          <div className="space-y-16">
            {Object.entries(grouped).map(([month, monthShows]: [string, any]) => (
              <div key={month}>
                <h2 className="text-3xl font-bold text-emerald-400 mb-6 border-b border-emerald-900 pb-3">
                  {month} — Binge these shows
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {monthShows.map((show: any) => (
                    <div key={show.id} className="bg-zinc-900 rounded-3xl overflow-hidden">
                      <ShowCard show={show} />
                      <div className="p-6">
                        <p className="text-emerald-400 font-bold">Cancel {show.window.primaryCancel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {canAddMore && (
          <div className="mt-16 bg-zinc-900 rounded-3xl p-8 text-center">
            <p className="text-xl mb-6">Add more shows from the home page or search</p>
            <Link href="/" className="bg-white text-black px-10 py-4 rounded-2xl font-bold">
              Browse trending shows →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}