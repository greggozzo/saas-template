// app/api/remove-show/route.ts
import { getAuth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { userId } = getAuth(request);
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { tmdbId } = await request.json();

  await supabase
    .from('user_shows')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_id', tmdbId);

  return Response.json({ success: true });
}