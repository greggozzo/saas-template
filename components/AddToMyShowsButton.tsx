// components/AddToMyShowsButton.tsx
'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AddToMyShowsButton({ tmdbId }: { tmdbId: number }) {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();

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
      setTimeout(() => router.push('/dashboard'), 800);
    } else {
      alert(json.error || 'Could not add');
    }
    setLoading(false);
  };

  if (added) return <div className="text-emerald-400 font-bold">Added ✓ Going to dashboard...</div>;

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