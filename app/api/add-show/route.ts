// app/api/add-show/route.ts
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { tmdbId } = await request.json();

  // Optional: check free tier limit (we'll add paid check later)
  const { data: existing } = await supabase
    .from('user_shows')
    .select('*')
    .eq('user_id', userId);

  if (existing.length >= 5) {
    return Response.json({ error: 'Free tier limit reached (5 shows). Upgrade for unlimited.' }, { status: 402 });
  }

  const { error } = await supabase
    .from('user_shows')
    .insert({ user_id: userId, tmdb_id: tmdbId });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}