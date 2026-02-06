'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateSubscriptionWindow } from '@/lib/recommendation';
import ShowCard from '@/components/ShowCard';
import Link from 'next/link';

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !userId) {
      setLoading(false);
      return;
    }

    async function load() {
      const { data } = await supabase
        .from('user_shows')
        .select('tmdb_id')
        .eq('user_id', userId);

      const ids = data?.map((s: any) => s.tmdb_id) || [];

      const loaded = await Promise.all(
        ids.map(async (id: number) => {
          const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=watch/providers`);
          const details = await res.json();

          const epRes = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${details.number_of_seasons || 1}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`);
          const season = await epRes.json();

          const window = calculateSubscriptionWindow(season.episodes || []);

          // Get primary service name
          const providers = details['watch/providers']?.results?.US?.flatrate || [];
          const service = providers[0]?.provider_name || 'Unknown Service';

          return { ...details, window, service };
        })
      );

      setShows(loaded);
      setLoading(false);
    }

    load();
  }, [userId, isLoaded]);

  const removeShow = async (tmdbId: number) => {
    if (!confirm('Remove this show from your list?')) return;

    await fetch('/api/remove-show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId }),
    });

    setShows(shows.filter(s => s.id !== tmdbId));
  };

  if (!isLoaded) return <div className="p-20 text-center">Loading...</div>;
  if (!userId) return <div className="p-20 text-center text-2xl">Please sign in</div>;

  // Group by "Service — Month"
  const grouped: Record<string, any[]> = {};
  shows.forEach(show => {
    const key = `${show.service} — ${show.window.primarySubscribe}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(show);
  });

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl font-bold">My Shows</h1>
            <p className="text-emerald-400 mt-2">{shows.length} shows saved</p>
          </div>
          <Link href="/upgrade" className="bg-emerald-500 text-black px-8 py-3 rounded-2xl font-bold">
            Upgrade $2.99/mo →
          </Link>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <p className="text-2xl text-zinc-400">No shows saved yet.</p>
        ) : (
          <div className="space-y-16">
            {Object.entries(grouped).map(([groupKey, monthShows]) => (
              <div key={groupKey}>
                <h2 className="text-3xl font-bold text-emerald-400 mb-6 border-b border-emerald-900 pb-3">
                  {groupKey}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {monthShows.map((show: any) => (
                    <div key={show.id} className="bg-zinc-900 rounded-3xl overflow-hidden relative group">
                      <ShowCard show={show} />

                      <div className="p-6">
                        <p className="text-emerald-400 font-bold">Cancel {show.window.primaryCancel}</p>

                        <button
                          onClick={() => removeShow(show.id)}
                          className="mt-4 w-full bg-red-900/50 hover:bg-red-900 text-red-400 text-sm py-2.5 rounded-2xl transition-colors"
                        >
                          Remove from My Shows
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}