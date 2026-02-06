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
        .select('*')
        .eq('user_id', userId);

      const loaded = await Promise.all(
        (data || []).map(async (dbShow: any) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/tv/${dbShow.tmdb_id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&append_to_response=watch/providers`
          );
          const details = await res.json();

          const epRes = await fetch(
            `https://api.themoviedb.org/3/tv/${dbShow.tmdb_id}/season/${details.number_of_seasons || 1}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );
          const season = await epRes.json();

          const window = calculateSubscriptionWindow(season.episodes || []);
          const providers = details['watch/providers']?.results?.US?.flatrate || [];
          const service = providers[0]?.provider_name || 'Unknown';

          return {
            ...details,
            window,
            service,
            favorite: dbShow.favorite || false,
            tmdb_id: dbShow.tmdb_id,
          };
        })
      );

      setShows(loaded);
      setLoading(false);
    }

    load();
  }, [userId, isLoaded]);

  const toggleFavorite = async (tmdbId: number, current: boolean) => {
    await fetch('/api/toggle-favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId, favorite: !current }),
    });
    setShows(shows.map(s => s.tmdb_id === tmdbId ? { ...s, favorite: !current } : s));
  };

  const removeShow = async (tmdbId: number) => {
    if (!confirm('Remove this show?')) return;
    await fetch('/api/remove-show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId }),
    });
    setShows(shows.filter(s => s.tmdb_id !== tmdbId));
  };

  // Group by service + month for the table
  const plan = shows.map(show => ({
    service: show.service,
    month: show.window.primarySubscribe,
    show,
  })).sort((a, b) => a.month.localeCompare(b.month));

  if (!isLoaded) return <div className="p-20 text-center">Loading...</div>;
  if (!userId) return <div className="p-20 text-center text-2xl">Please sign in</div>;

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* Rolling Plan Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Your Rolling Plan</h2>
          <div className="bg-zinc-900 rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plan.map((item, i) => (
                <div key={i} className="bg-zinc-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    ▶
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{item.service}</div>
                    <div className="text-emerald-400 text-sm">{item.month}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Shows Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shows.map(show => (
            <div key={show.id} className="bg-zinc-900 rounded-3xl overflow-hidden group">
              <ShowCard show={show} />

              <div className="p-6">
                <div className="flex justify-between items-center">
                  <p className="text-emerald-400 font-bold">Cancel {show.window.primaryCancel}</p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => toggleFavorite(show.tmdb_id, show.favorite)}
                      className={`text-3xl transition-all ${show.favorite ? 'text-yellow-400' : 'text-zinc-600 hover:text-yellow-400'}`}
                    >
                      ★
                    </button>

                    <button
                      onClick={() => removeShow(show.tmdb_id)}
                      className="text-red-400 hover:text-red-300 text-sm px-4 py-1 rounded-xl border border-red-900 hover:bg-red-950 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}