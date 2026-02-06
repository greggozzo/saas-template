// components/AddToMyShowsButton.tsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AddToMyShowsButton({ tmdbId }: { tmdbId: number }) {
  const { isSignedIn, userId } = useUser();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const router = useRouter();

  // Check if already saved
  useEffect(() => {
    if (!isSignedIn || !userId) return;

    supabase
      .from('user_shows')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .then(({ data }) => setAlreadySaved(data && data.length > 0));
  }, [isSignedIn, userId, tmdbId]);

  const add = async () => {
    if (!isSignedIn) {
      alert('Sign in to save shows');
      return;
    }
    setLoading(true);

    const res = await fetch('/api/add-show', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdbId }),
    });

    const json = await res.json();
    if (json.success) {
      setAdded(true);
      setTimeout(() => router.push('/dashboard'), 600);
    } else {
      alert(json.error || 'Could not add');
    }
    setLoading(false);
  };

  if (alreadySaved) {
    return (
      <div className="w-full bg-zinc-800 text-zinc-400 font-medium py-4 rounded-2xl text-center cursor-default">
        Already in My Shows ✓
      </div>
    );
  }

  if (added) return <div className="text-emerald-400 font-bold text-center py-4">Added ✓ Going to dashboard...</div>;

  return (
    <button
      onClick={add}
      disabled={loading}
      className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
    >
      {loading ? 'Adding...' : 'Add to My Shows'}
    </button>
  );
}